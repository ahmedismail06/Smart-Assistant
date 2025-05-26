import chromadb
from google import genai
from google.genai import types
from chromadb import Documents, EmbeddingFunction, Embeddings
from google.genai import types
from pdfminer.high_level import extract_text
from langchain.text_splitter import CharacterTextSplitter
import os

GOOGLE_API_KEY = os.environ["GOOGLE_API_KEY"]
modelName = "gemini-2.0-flash"


client = genai.Client(api_key=GOOGLE_API_KEY)



class GeminiEmbeddingFunction(EmbeddingFunction):

     doc_mode = True

     def __call__(self, input: Documents) -> Embeddings:
          if self.doc_mode:
               task = "retrieval_document"
          else:
               task = "retrieval_query"
          
          response = client.models.embed_content(
               model = "text-embedding-004",
               contents= input,
               config= types.EmbedContentConfig(task_type= task)
          )

          return [e.values for e in response.embeddings] 
     


def embedDoc(documentPath, query:str):

     client = genai.Client(api_key=GOOGLE_API_KEY)
     docs = []
     DB_NAME = "googlecarbd"


     # 1. your raw text
     raw = extract_text(documentPath).replace("\n", " ")

     # 2. configure how big each chunk should be, and how much overlap (optional)
     splitter = CharacterTextSplitter(
     chunk_size=500,      # max characters per chunk
     chunk_overlap=50     # characters of overlap between chunks
     )

     # 3. split!
     chunks = splitter.split_text(raw)

     for chunk in chunks:
          docs.append(chunk)

     chroma_client = chromadb.Client()
     embed_function = GeminiEmbeddingFunction()
     embed_function.doc_mode = True

     db = chroma_client.get_or_create_collection(name = DB_NAME, embedding_function=embed_function)

     db.add(documents=docs, ids= [str(i) for i in range(len(docs))])

     embed_function.doc_mode = False

     result = db.query(query_texts=query, n_results=1)

     [all_passages] = result["documents"]

     # This prompt is where you can specify any guidance on tone, or what topics the model should stick to, or avoid.
     prompt = f"""You are a helpful and informative bot that answers questions using text from the reference passage included below. 
     Be sure to respond in a complete sentence, being comprehensive, including all relevant background information. 
     However, you are talking to a non-technical audience, so be sure to break down complicated concepts and 
     strike a friendly and converstional tone. If the passage is irrelevant to the answer, you may reply with a message that the question is irrelevan.

     QUESTION: {query}
     """

     for text in all_passages:
          prompt += "PASSAGE: " + f"{text.replace("\n", " ")}"

     response = client.models.generate_content(
          model= modelName,
          contents= prompt
     )

     return response.text

