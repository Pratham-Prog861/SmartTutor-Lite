# SmartTutor Lite 🎓

**SmartTutor Lite** is a premium, client-side AI tutoring application designed to help students master their textbooks. By combining local PDF processing with the power of Google's Gemini models, it provides instant, contextually accurate answers to your study questions without ever sending your full documents to a server.

![SmartTutor Banner](public/vite.svg) _-- [WIP: Dashboard Screenshot] --_

## ✨ Features

- **📄 Local PDF Intelligence**: Extract text directly in your browser using `pdfjs-dist`. Your textbooks stay private.
- **🤖 Gemini Integration**: Leverages `gemini-1.5-flash` or `gemini-2.0-flash` for high-speed, intelligent reasoning.
- **🧩 Smart Content Chunking**: Automatically divides large textbooks into manageable clusters (300-500 words) with overlapping context to ensure no information is lost.
- **🔍 Context Pruning**: Uses advanced keyword-matching relevance to select the most relevant sections of your book for every question, optimizing both accuracy and token usage.
- **🎨 Editorial UI**: A high-end, magazine-style chat interface built with `Tailwind CSS`, `Shadcn UI`, and `Motion` for fluid, premium animations.
- **🔒 Security First**: Store your Gemini API key locally in your browser. It's only used to communicate directly with Google's API during your session.

## 🚀 Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Motion/React](https://motion.dev/)
- **AI SDK**: [@google/genai](https://www.npmjs.com/package/@google/genai)
- **PDF Engine**: [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- [pnpm](https://pnpm.io/) (Recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/pratham-prog861/smarttutor-lite.git
   cd smarttutor-lite
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API Key (optional, can also be entered in-app):

   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

## 📖 Usage

1. **Enter API Key**: Open the settings panel on the left sidebar and provide your Google Gemini API key.
2. **Upload PDF**: Drag and drop your textbook into the "Active Textbook" slot. The app will automatically analyze and section the content.
3. **Ask & Learn**: Start typing your questions in the bottom chat bar. The tutor will search through your book and provide a concise, formatted answer with bullets and highlighting.

## 📄 License

Distributed under the MIT License.

---

Built with ❤️ for students everywhere.
