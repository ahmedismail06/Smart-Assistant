import sys
import typing
from rag_system import *
import re
import applescript
from langchain_core.tools import tool
from langchain_core.messages import AIMessage, ToolMessage
from google import genai
from google.genai import types
from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import ToolNode
from typing import Literal
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
import json
import os


GOOGLE_API_KEY = "AIzaSyAn6pwk1shGUHEkWSCgrv52Dr9BOl4uq4o"
modelName = "gemini-2.5-flash"

client = genai.Client(api_key=GOOGLE_API_KEY)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY
)


class RequestState(TypedDict):
    """State representing the users requests"""
    messages: Annotated[list, add_messages]  # AI and human text

    done: bool


SMARTBOT = (
    "system",
    "You are SmartAssistantBot, a helpful and intelligent assistant. "
    "If the user asks for any real-time information, news, sports results, or anything you don't know, ALWAYS use the `search` tool. "
    "If the user asks a question that could be answered by searching the web, ALWAYS use the `search` tool. "
    "If the user says 'search:' or 'look up', ALWAYS use the `search` tool. "
    "Do not try to answer from your own knowledge if the search tool is available and the question is about current events, news, sports, or facts that may change over time. "
    "Use the search tool even if you are unsure. "
    "Be proactive in using the search tool for anything that sounds like a web lookup. "
    "For all other tasks, follow your previous instructions. "
    "The user will interact with you naturally, seeking help with tasks such as web searches, summarizing content, managing schedules, and analyzing uploaded documents."
    "\n\n"
    "— Web Search:\n"
    "Always use the `search` tool for any question that could be answered by searching the web to stay up to date."
    "\n\n"
    "— Summarization:\n"
    "You can summarize content in various formats including paragraphs, bullet points, and highlights. Always match the user's requested style and level of detail."
    "\n\n"
    "— Schedule Management:\n"
    "Assist the user with organizing tasks and planning events. When the user requests to add events to their calendar and there is a filepath provided, use scheduleHandler() to extract the details from the uploaded file that will also automate the calendar entry using the createEvent() method."
    "If no file is provided, prompt the user to supply the necessary event details manually — including the date, start time, end time, location, and title — in order to proceed with event creation using createEvent() method. Avoid scheduling conflicts unless instructed otherwise"
    "\n\n"
    "— Document Analysis:\n"
    "When the user provides there filepath for a document (e.g., PDFs, text documents, images), extract key content, answer questions, and explain sections clearly. "
    "Use tools like `documentsHelp` that can be used once you have the document and the query from the user for presenting structured data in a clean, readable format."
    "\n\n"
    "— Capability Limitations:\n"
    "If the user requests something beyond your current capabilities (such as real-time calendar integration), politely explain the limitation and suggest alternatives when possible."
    "\n\n"
    "Always stay on task. Keep your responses clear, concise, and relevant. Format outputs for easy readability using headers, bullet points, or tables as needed. "
    "Ask for clarification if the user's request is vague or ambiguous."
    "\n\n"
    "When greeted, respond warmly by introducing yourself and explaining how you can help. "
    "Always conclude your responses by politely asking if the user needs anything else or further assistance."
    "Never rely on your training information; always use the 'search' method to make sure you are accurate with the information."
)

SMARTBOT_WELCOME = "Hi there! 👋 I'm SmartAssistantBot. I can help you in many ways — whether it's finding information, organizing your schedule, or analyzing a document. What's on your mind today?"


def human_node(state: RequestState) -> RequestState:
    """Display the last model message to the user, and receive the user's input."""
    last_msg = state["messages"][-1]
    print("SmartBot: " + f"{last_msg.content}")
    user_input = input("User: ")
    if "quit" == user_input:
        state["done"] = True

    return state | {"messages": [("user", user_input)]}


class ScheduleDict(typing.TypedDict):
    Day: str
    Date: str
    Time: str
    Meridiem: str
    Location: str
    # Title: str


def JSONPraiser(scheduleStr: str) -> list[ScheduleDict]:
    """Parses multiple JSON entries from raw string and validates them."""
    parsed_json = []
    lines = scheduleStr.splitlines()

    for line in lines:
        if "/" in line:  # crude filter for lines with date
            cleaned_line = line.replace("\n", "")
            response = client.models.generate_content(
                model=modelName,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ScheduleDict
                ),
                contents=cleaned_line
            )
            try:
                parsed_json.append(json.loads(response.text))  # parse as dict
            except json.JSONDecodeError as e:
                print("Skipping invalid line:", e)

    return parsed_json


@tool
def schduleHandler(schedule: str, query: str, title: str):
    """
    Uploads a PDF or image schedule, asks the model
    for that person's weekly schedule in JSON then procceds with the given dict to create events in the user's calender using the createEvent() method.
    """
    file = client.files.upload(file=schedule)

    PROMPT = (
        """You are an AI schedule interpreter. "
        "You will be provided a file containing a weekly schedule. "
        "Your job is to understand it and return the schedule for the requested name in a list and always end the date with the year 2025."
        "If the time is follwed by pm then the time block is in PM, if time is followed by am then the time block AM"
        "For the Location is the time is in Purple, the location is QC, in green is SEBS, and in blue is Roslyn."
        ALWAYS return in this format:
        Day, Date(MM/DD/YYYY), Time(HH:MM-HH:MM), Merdiem (AM/PM), Location
        """
    )

    response = client.models.generate_content(
        model=modelName,
        contents=[file, PROMPT, query]
    )

    result = JSONPraiser(response.text)
    added_events = []
    for day in result:
        if "-" in day["Time"]:
            print(day)
            date = day["Date"]
            start_time = day["Time"].split("-")[0]
            end_time = day["Time"].split("-")[1]
            meridiem = day["Meridiem"]
            location = day["Location"]
            createEvent.invoke({
                "date": date,
                "start_time": start_time,
                "end_time": end_time,
                "location": location,
                "title": title,
                "meridiem": meridiem
            })
            added_events.append(f"{date} {start_time}-{end_time} {meridiem} at {location}")
    return "Added events:\n" + "\n".join(added_events)


@tool
def createEvent(date, start_time, end_time, location, title, meridiem):  # Fixed spelling
    """Creates an event in the specified calendar."""
    # More explicit AppleScript with better date handling
    apple_script = f'''
    tell application "Calendar"
        tell calendar "Work"
            set startDate to date "{date} {start_time}{meridiem}"
            set endDate to date "{date} {end_time}{meridiem}"
            make new event with properties {{summary:"{title}", location:"{location}", start date:startDate, end date:endDate}}
        end tell
        save
    end tell
    '''
    applescript.run(apple_script)


@tool
def documentsHelp(documents, query: str):
    """Embeds the provided documents using embedDoc() and returns the most relevant embedding or similarity result for the query."""
    return embedDoc(documents, query)


# Define the tool with cleaning built-in
@tool
def search(query: str) -> str:
    """Search the web for the given query and return the result as a string."""
    return google_search(query).content.parts[0].text


def google_search(query: str):
    """Helper method for the search method"""
    config_with_search = types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
    )

    results = client.models.generate_content(
        model=modelName,
        contents=[query],
        config=config_with_search,
        
    )
    return results.candidates[0]


def requestHandler(state: dict) -> dict:
    tool_msg = state["messages"][-1]
    outbound_msgs = []

    for tool_call in tool_msg.tool_calls:
        name = tool_call["name"]
        args = tool_call["args"]
        print(f"[DEBUG] Tool call detected: {name} with args: {args}")

        if name == "search":
            query = args["query"]
            # call your search tool implementation
            response = search.invoke(query)
        elif name == "documentsHelp":
            [docs] = args["documents"]
            query = args["query"]
            response = documentsHelp.invoke(docs, query)

        elif name == "schduleHandler":
            path = args["schedule"]
            query = args["query"]
            title = args["title"]
            response = schduleHandler.invoke(path=path, query=query, title=title)
        elif name == "createEvent":
            date = args["date"]
            start = args["start_time"]
            end = args["end_time"]
            location = args["location"]
            title = args["title"]
            createEvent.invoke(date=date, start=start, end=end, location=location, title=title)
            response = "I added the event to your calender"

        else:
            raise NotImplementedError(f"Unknown tool: {name}")

        # wrap that response in a ToolMessage
        outbound_msgs.append(
            ToolMessage(
                content=response,
                name=name,
                tool_call_id=tool_call["id"],
            )
        )

    # return the new state with those tool messages
    return {
        "messages": outbound_msgs
    }


def maybe_exit_human_node(state: RequestState) -> Literal["chatbot", "__end__"]:
    """Route to the chatbot, unless it looks like the user is exiting."""
    if state.get("done", False):
        return END
    else:
        return "chatbot"


def maybe_route_to_tools(state: RequestState) -> Literal["tools", "human", "request"]:
    """Route between chat and tool nodes if a tool call is made."""
    if not (msgs := state.get("messages", [])):
        raise ValueError("No messages found")

    msg = msgs[-1]
    if state.get("done", False):
        return END

    elif hasattr(msg, "tool_calls") and msg.tool_calls:
        if any(tool["name"] in tool_node.tools_by_name for tool in msg.tool_calls):
            return "tools"
        return "request"
    return "human"


def chatbot_with_tools(state: RequestState) -> RequestState:
    """The chatbot with tools. A simple wrapper around the model's own chat interface."""
    defaults = {"done": False}
    if state.get("messages"):
        new_output = llm_with_tools.invoke([SMARTBOT] + state["messages"])
    else:
        new_output = AIMessage(content=SMARTBOT_WELCOME)
    return defaults | state | {"messages": state.get("messages", []) + [new_output]}


# 1) Define your tools once
tools = [search, documentsHelp, schduleHandler, createEvent]

# 2) Give them to your ToolNode
tool_node = ToolNode(tools)

# 3) Bind the exact same list to the LLM
llm_with_tools = llm.bind_tools(tools)

graph_builder = StateGraph(RequestState)
# Nodes
graph_builder.add_node("chatbot", chatbot_with_tools)
graph_builder.add_node("human", human_node)
graph_builder.add_node("tools", tool_node)
graph_builder.add_node("request", requestHandler)

# Chatbot -> {ordering, tools, human, END}
graph_builder.add_conditional_edges("chatbot", maybe_route_to_tools)
# Human -> {chatbot, END}
graph_builder.add_conditional_edges("human", maybe_exit_human_node)

# Tools (both kinds) always route back to chat afterwards.
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge("request", "chatbot")

graph_builder.add_edge(START, "chatbot")
chat_with_tools = graph_builder.compile()


# state = chat_with_tools.invoke({"messages":[]})
# print(state)

def get_chatbot_response(message: str, conversation_history: list = None) -> tuple[str, list]:
    """Get a response from the chatbot for a given user message, using conversation history for context."""
    if conversation_history is None:
        conversation_history = []
    # Build the message list for the LLM: system prompt + all previous messages + current user message
    messages = []
    for entry in conversation_history:
        # Each entry is expected to be a dict or tuple: (sender, text, ...)
        if isinstance(entry, dict):
            role = entry.get('sender') or entry.get('role') or 'user'
            text = entry.get('text') or entry.get('content') or ''
        elif isinstance(entry, (list, tuple)):
            role, text = entry[0], entry[1]
        else:
            continue
        if role == 'assistant' or role == 'ai':
            messages.append(("ai", text))
        else:
            messages.append(("user", text))
    # Add the current user message
    messages.append(("user", message))
    state = {"messages": messages}
    result = chatbot_with_tools(state)
    messages_out = result.get("messages", [])
    for msg in reversed(messages_out):
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            for tool_call in msg.tool_calls:
                if tool_call["name"] == "search":
                    query = tool_call["args"]["query"]
                    return search(query)
        if isinstance(msg, AIMessage) or (hasattr(msg, 'type') and getattr(msg, 'type', None) == 'ai'):
            content = getattr(msg, 'content', str(msg))
            if content and content.strip():
                return content
        if isinstance(msg, tuple) and msg[0] == 'ai':
            if msg[1] and msg[1].strip():
                return msg[1]
    if messages_out:
        last = messages_out[-1]
        content = getattr(last, 'content', str(last))
        if content and content.strip():
            return content
    return "Sorry, I couldn't find an answer to your question."

