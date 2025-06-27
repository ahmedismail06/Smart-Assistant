import React from "react";
import ChatWindow from "./components/ChatWindow";
import Loader from "./components/Loader";
import { sendMessage, uploadFile, uploadSchedule } from "./api/assistantApi";

function App() {
  const [messages, setMessages] = React.useState([
    { sender: "assistant", text: "Hi there! 👋 I'm SmartAssistantBot. I can help you in many ways — whether it's finding information, organizing your schedule, or analyzing a document. What's on your mind today?" },
  ]);
  const [loading, setLoading] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setDarkMode(document.body.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  const handleSend = async (text) => {
    setMessages((msgs) => [...msgs, { sender: "user", text, timestamp: Date.now() }]);
    setLoading(true);
    try {
      // Pass conversation history (excluding the new user message) to backend
      const history = messages;
      const data = await sendMessage(text, history);
      setMessages((msgs) => [...msgs, { sender: "assistant", text: data.response, timestamp: Date.now() }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { sender: "assistant", text: "Sorry, there was an error. Please try again.", timestamp: Date.now() }]);
    }
    setLoading(false);
  };

  const handleFileUpload = async (file, question = 'Summarize this document') => {
    setMessages((msgs) => [...msgs, { sender: "user", text: `Uploaded file: ${file.name}`, timestamp: Date.now() }]);
    setLoading(true);
    try {
      const data = await uploadFile(file, question);
      setMessages((msgs) => [...msgs, { sender: "assistant", text: data.result, timestamp: Date.now() }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { sender: "assistant", text: "Sorry, there was an error processing your file.", timestamp: Date.now() }]);
    }
    setLoading(false);
  };

  const handleScheduleUpload = async () => {
    // Prompt for file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.click();
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const query = window.prompt('Enter the query for the schedule (e.g., Get my schedule for John Doe):', 'Get my schedule for John Doe');
      if (query === null) return;
      const title = window.prompt('Enter the event title:', 'Work Shift');
      if (title === null) return;
      setMessages((msgs) => [...msgs, { sender: "user", text: `Uploaded schedule: ${file.name}\nQuery: ${query}\nTitle: ${title}`, timestamp: Date.now() }]);
      setLoading(true);
      try {
        const data = await uploadSchedule(file, query, title);
        setMessages((msgs) => [...msgs, { sender: "assistant", text: data.result, timestamp: Date.now() }]);
      } catch (err) {
        setMessages((msgs) => [...msgs, { sender: "assistant", text: "Sorry, there was an error processing your schedule.", timestamp: Date.now() }]);
      }
      setLoading(false);
    };
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-100 to-blue-100 overflow-hidden" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', minWidth: '100vw'}}>
      {/* Main centered container with max-w-3xl (800px), responsive padding */}
      <div
        className="w-full max-w-[800px] flex flex-col justify-center items-center z-10 px-5 md:px-10 py-5 md:py-10"
        style={{
          width: '100%',
          maxWidth: 800,
          padding: 12,
          background: darkMode ? '#232946' : '#f8fafc',
          color: darkMode ? '#F4F4F8' : undefined,
          borderRadius: 24,
          boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)'
        }}
      >
        <div className="flex-1 w-full flex flex-col">
          <ChatWindow
            messages={messages}
            onSend={handleSend}
            onFileUpload={handleFileUpload}
            onScheduleUpload={handleScheduleUpload}
            loading={loading}
            input={input}
            setInput={setInput}
          />
          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
}

export default App;
