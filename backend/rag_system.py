import shutil
import sys
from itertools import count

import chromadb
from google import genai
from google.genai import types
from chromadb import Documents, EmbeddingFunction, Embeddings
from google.genai import types
from pdfminer.high_level import extract_text
from langchain.text_splitter import CharacterTextSplitter
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
GOOGLE_API_KEY = "AIzaSyAn6pwk1shGUHEkWSCgrv52Dr9BOl4uq4o"
modelName = "gemini-2.5-flash"


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

     print("[embedDoc] Starting document embedding for:", documentPath)
     client = genai.Client(api_key=GOOGLE_API_KEY)
     docs = []
     DB_NAME = "googlecarbd"

     # 1. your raw text
     try:
         raw = extract_text(documentPath).replace("\n", " ")
         print(f"[embedDoc] Extracted text length: {len(raw)}")
     except Exception as e:
         print(f"[embedDoc] Error extracting text: {e}")
         raise

     # 2. configure how big each chunk should be, and how much overlap (optional)
     splitter = CharacterTextSplitter(
     chunk_size=1000,      # max characters per chunk
     chunk_overlap=100     # characters of overlap between chunks
     )

     # 3. split!
     chunks = splitter.split_text(raw)
     print(f"[embedDoc] Number of chunks: {len(chunks)}")

     for chunk in chunks:
          docs.append(chunk)

     print("[embedDoc] Initializing ChromaDB client...")
     chroma_client = chromadb.PersistentClient()

     embed_function = GeminiEmbeddingFunction()
     embed_function.doc_mode = True

     print("[embedDoc] Getting or creating collection in ChromaDB...")
     db = chroma_client.get_or_create_collection(name = DB_NAME, embedding_function=embed_function)

     print("[embedDoc] Adding documents to ChromaDB...")
     db.add(documents=docs, ids= [str(i) for i in range(len(docs))])

     embed_function.doc_mode = False

     print("[embedDoc] Querying ChromaDB with query:", query)
     result = db.query(query_texts=query, n_results=1)

     [all_passages] = result["documents"]
     print(f"[embedDoc] Passages returned: {len(all_passages)}")

     # This prompt is where you can specify any guidance on tone, or what topics the model should stick to, or avoid.
     prompt = f"""You are a helpful and informative bot that answers questions using text from the reference passage included below. 
     Be sure to respond in a complete sentence, being comprehensive, including all relevant background information. 
     However, you are talking to a non-technical audience, so be sure to break down complicated concepts and 
     strike a friendly and converstional tone. If the context is irrelevant to the answer, you may reply with a message that the question is irrelevan.

     QUESTION: {query}
     """

     for text in all_passages:
          prompt += "Context: " + f"{text.replace("\n", " ")}"

     print("[embedDoc] Sending prompt to Gemini model...")
     response = client.models.generate_content(
          model= modelName,
          contents= prompt,
          config= types.GenerateContentConfig(
               max_output_tokens= 1000
          )
     )
     print("[embedDoc] Gemini response object:", repr(response))
     print("[embedDoc] Gemini response received.")
     #shutil.rmtree('/Users/ahmedismail/Desktop/AICourse/Smart Assistant/chroma')
     return response.text