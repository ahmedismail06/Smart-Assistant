<p align="center">
  <img src="https://placehold.co/200x200?text=Logo" alt="Smart Assistant Logo" width="200"/>
</p>

<h1 align="center">Smart Assistant</h1>

<p align="center">
  <b>AI-powered assistant for real-time info, document analysis, and schedule management</b><br/>
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img alt="GitHub branch" src="https://img.shields.io/badge/branch-backend-blue">
  <img alt="Last commit" src="https://img.shields.io/badge/commit-9452085--2025--06--26-brightgreen">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
</p>

---

## Table of Contents
- [About](#about)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Folder Structure](#folder-structure)
- [Usage](#usage)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
- [Contact](#contact)

---

## About
Smart Assistant is a modern, open-source AI assistant with a web frontend and a Python backend. It helps users retrieve real-time information, analyze documents, and manage schedules using advanced AI (Google Gemini) and vector search (ChromaDB).

---

## Features
- 💬 **Conversational AI**: Chat with an intelligent assistant for info, summaries, and more
- 📄 **Document Analysis**: Upload PDFs/images and get summaries or answers
- 📅 **Schedule Management**: Extract events from uploaded schedules and add to your calendar
- 🌐 **Web Search**: Get real-time information using integrated web search tools

---

## Screenshots
> _Add your screenshots here!_

<p align="center">
  <img src="https://placehold.co/600x300?text=Screenshot+1" alt="Screenshot 1"/>
  <img src="https://placehold.co/600x300?text=Screenshot+2" alt="Screenshot 2"/>
</p>

---

## Tech Stack

### Frontend
- **Framework:** [React](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [PostCSS](https://postcss.org/), [Autoprefixer](https://github.com/postcss/autoprefixer)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **UI/UX:** [Framer Motion](https://www.framer.com/motion/), [React Icons](https://react-icons.github.io/react-icons/), [emoji-picker-react](https://github.com/ealush/emoji-picker-react), [react-markdown](https://github.com/remarkjs/react-markdown), [react-tsparticles](https://github.com/matteobruni/tsparticles), [tsparticles](https://github.com/matteobruni/tsparticles)
- **Testing:** [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/), [@testing-library/jest-dom](https://github.com/testing-library/jest-dom), [jsdom](https://github.com/jsdom/jsdom), [msw](https://mswjs.io/)
- **Linting:** [ESLint](https://eslint.org/), [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks), [eslint-plugin-react-refresh](https://www.npmjs.com/package/eslint-plugin-react-refresh)
- **Other:** [whatwg-fetch](https://github.com/github/fetch), [Globals](https://www.npmjs.com/package/globals)

### Backend
- **Language:** [Python 3](https://www.python.org/)
- **Web Framework:** [Flask](https://flask.palletsprojects.com/), [Flask-CORS](https://flask-cors.readthedocs.io/)
- **AI/LLM:** [Google Gemini](https://ai.google.dev/), [google-genai](https://pypi.org/project/google-genai/), [langchain](https://python.langchain.com/), [langchain-google-genai](https://pypi.org/project/langchain-google-genai/), [langgraph](https://github.com/langchain-ai/langgraph)
- **Vector Database:** [ChromaDB](https://www.trychroma.com/), [chroma-hnswlib](https://pypi.org/project/chroma-hnswlib/)
- **Document Processing:** [pdfminer.six](https://github.com/pdfminer/pdfminer.six), [PyMuPDF](https://github.com/pymupdf/PyMuPDF), [pypdf](https://github.com/py-pdf/pypdf)
- **Scheduling/Calendar:** [applescript](https://pypi.org/project/applescript/) (for macOS Calendar integration)
- **Data Science/Utils:** [pandas](https://pandas.pydata.org/), [numpy](https://numpy.org/)
- **API/HTTP:** [requests](https://docs.python-requests.org/), [httpx](https://www.python-httpx.org/)
- **Environment:** [python-dotenv](https://pypi.org/project/python-dotenv/)
- **Other:** [pydantic](https://docs.pydantic.dev/), [marshmallow](https://marshmallow.readthedocs.io/), [protobuf](https://developers.google.com/protocol-buffers), [grpcio](https://grpc.io/), [orjson](https://github.com/ijl/orjson), [PyYAML](https://pyyaml.org/)

> _See `frontend/package.json` and `backend/requirements.txt` for the full list of dependencies._

---

## Quick Start
```bash
# 1. Clone the repository
$ git clone https://github.com/your-username/smart-assistant.git
$ cd smart-assistant

# 2. Backend setup
$ cd backend
$ pip install -r requirements.txt
$ cp env.example .env  # Add your Google API key to .env
$ python api_server.py

# 3. Frontend setup (in a new terminal)
$ cd frontend
$ npm install
$ npm run dev
```

---

## Folder Structure
```
Smart Assistant/
├── backend/         # Python backend (Flask, Google Gemini, ChromaDB)
│   ├── api_server.py
│   ├── smart_assistant.py
│   ├── rag_system.py
│   ├── chroma/      # Vector DB and embeddings
│   ├── uploads/     # Uploaded files
│   └── env.example  # Backend environment variables
├── frontend/        # React frontend (Vite, Tailwind)
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   ├── pages/
│   │   └── styles/
│   └── public/
├── package.json     # Project-level dependencies (if any)
└── README.md        # Project documentation
```

---

## Usage
- Open the frontend in your browser (default: http://localhost:5173)
- Chat with the assistant, upload documents, or manage your schedule
- The assistant uses the backend for AI, document, and scheduling features

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Code of Conduct
This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainer.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact
**Project Maintainer:** [Your Name](mailto:your.email@example.com)

For questions, suggestions, or feedback, please open an issue or contact the maintainer. 