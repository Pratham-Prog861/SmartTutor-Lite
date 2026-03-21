import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Send,
  BookOpen,
  Key,
  Bot,
  User,
  Info,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import ReactMarkdown from "react-markdown";

import { extractTextFromPDF } from "@/lib/pdf-parser";
import { chunkText, getRelevantChunks } from "@/lib/text-utils";
import { generateAnswer } from "@/lib/gemini";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_GEMINI_API_KEY || "",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAnswering]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsParsing(true);

      try {
        const text = await extractTextFromPDF(selectedFile);
        setExtractedText(text);
        const textChunks = chunkText(text);
        setChunks(textChunks);
        setIsParsing(false);

        setMessages([
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Hi! I've successfully loaded "${selectedFile.name}". I found ${textChunks.length} sections to help me answer your questions. What would you like to know?`,
          },
        ]);
      } catch (error) {
        console.error("PDF parsing failed:", error);
        setIsParsing(false);
        setMessages([
          {
            id: Date.now().toString(),
            role: "error",
            content:
              "Failed to extract text from this PDF. Please try another file.",
          },
        ]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !question.trim() || isAnswering) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuestion = question.trim();
    setQuestion("");

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "err",
          role: "error",
          content:
            "I need a Gemini API Key to answer. Please enter it in the settings at the top.",
        },
      ]);
      return;
    }

    setIsAnswering(true);

    try {
      const relevantContext = getRelevantChunks(currentQuestion, chunks);
      const aiResponse = await generateAnswer(
        currentQuestion,
        relevantContext,
        apiKey,
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "ai",
          role: "assistant",
          content: aiResponse,
        },
      ]);
    } catch (error: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "ai-err",
          role: "error",
          content: `Error: ${error instanceof Error ? error.message : "Failed to generate answer. Check your connection or API key."}`,
        },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Sidebar: PDF Management & Settings */}
      <aside className="w-80 h-full border-r border-slate-200 bg-white p-6 flex flex-col gap-8 shrink-0 z-10 shadow-sm overflow-y-auto">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              SmartTutor
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold font-mono">
              Lite Edition
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-2">
            <Settings2 className="w-3.5 h-3.5" />
            Configuration
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1">
                Gemini API Key
              </label>
              <div className="relative group">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <Input
                  type="password"
                  placeholder="Enter API Key"
                  className="pl-9 h-10 text-sm bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-indigo-500 transition-all shadow-none focus:border-indigo-500"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-3 text-indigo-950">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed font-medium">
                Your key is stored locally in your browser and never sent to our
                servers.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Textbook
          </p>

          <div className="relative group">
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
              onChange={handleFileChange}
            />
            <div
              className={`
              h-44 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all duration-300
              ${
                file
                  ? "bg-slate-50 border-indigo-200"
                  : "bg-white border-slate-200 group-hover:border-indigo-400 group-hover:bg-slate-50"
              }
            `}
            >
              <div
                className={`p-4 rounded-full mb-3 shadow-md transition-all ${file ? "bg-indigo-600 text-white" : "bg-white text-slate-400 group-hover:text-indigo-500"}`}
              >
                {isParsing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 mb-1 max-w-[150px] truncate text-center">
                {file ? file.name : "Select Textbook"}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {file
                  ? isParsing
                    ? "Analyzing content..."
                    : `${(file.size / 1024 / 1024).toFixed(1)}MB • PDF`
                  : "Drag & drop PDF here"}
              </p>
            </div>
          </div>

          {file && !isParsing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2.5 py-1 font-bold"
                >
                  {extractedText.length.toLocaleString()} CHARS
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-2.5 py-1 font-bold"
                >
                  {chunks.length} SECTIONS
                </Badge>
              </div>
            </motion.div>
          )}
        </section>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter italic">
            V1.2 / ST-LITE
          </p>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {/* Chat Header (Floating Style) */}
        {!file && (
          <div className="absolute inset-0 flex items-center justify-center p-6 z-0 pointer-events-none">
            <div className="text-center max-w-sm space-y-4">
              <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl mx-auto flex items-center justify-center">
                <Bot className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Ready to teach.
              </h2>
              <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                Upload your textbook on the left sidebar to start your
                personalized learning session.
              </p>
            </div>
          </div>
        )}

        <div
          className="flex-1 overflow-y-auto px-6 py-10 md:px-20 space-y-8 scroll-smooth z-10"
          ref={scrollRef}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse text-indigo-950" : "flex-row text-slate-800"}`}
              >
                <div
                  className={`
                  w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-sm border
                  ${msg.role === "user" ? "bg-white border-slate-200 text-slate-600" : msg.role === "error" ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-indigo-600 border-indigo-700 text-white"}
                `}
                >
                  {msg.role === "user" ? (
                    <User className="w-5 h-5" />
                  ) : msg.role === "error" ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                <div
                  className={`
                  max-w-[85%] md:max-w-[75%] space-y-2
                  ${msg.role === "user" ? "text-right" : "text-left"}
                `}
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    {msg.role === "user"
                      ? "You"
                      : msg.role === "error"
                        ? "System Error"
                        : "SmartTutor"}
                  </p>
                  <div
                    className={`
                    p-6 rounded-3xl shadow-sm leading-relaxed border
                    ${
                      msg.role === "user"
                        ? "bg-slate-900 border-slate-800 text-white rounded-tr-none"
                        : msg.role === "error"
                          ? "bg-rose-50 border-rose-100 text-rose-800 italic"
                          : "bg-white border-slate-100 text-slate-900 rounded-tl-none"
                    }
                  `}
                  >
                    <div
                      className={`prose prose-sm md:prose-base max-w-none selection:bg-indigo-200
                      ${msg.role === "user" ? "text-white prose-invert font-semibold" : "text-slate-800"}
                    `}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ children }: { children?: React.ReactNode }) => (
                            <p className="mb-4 last:mb-0 leading-relaxed font-medium">
                              {children}
                            </p>
                          ),
                          strong: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <strong className="font-extrabold text-slate-950 tracking-tight">
                              {children}
                            </strong>
                          ),
                          ul: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <ul className="space-y-2 mb-4 list-none pl-1">
                              {children}
                            </ul>
                          ),
                          li: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <li className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                              <span className="font-medium text-[13px] md:text-sm">
                                {children}
                              </span>
                            </li>
                          ),
                          em: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <em className="italic text-indigo-700/80 font-medium tracking-tight bg-indigo-50/50 px-1 rounded">
                              {children}
                            </em>
                          ),
                          h1: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <h1 className="text-xl font-bold mb-3 text-slate-900">
                              {children}
                            </h1>
                          ),
                          h2: ({
                            children,
                          }: {
                            children?: React.ReactNode;
                          }) => (
                            <h2 className="text-lg font-bold mb-2 text-slate-900">
                              {children}
                            </h2>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isAnswering && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 border border-indigo-700">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  SmartTutor
                </p>
                <div className="flex gap-1.5 h-6 items-center px-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="p-6 md:p-8 md:px-20 z-20">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto relative group"
          >
            <Input
              id="question"
              placeholder={
                file
                  ? "Ask something from this book..."
                  : "Please upload a textbook first"
              }
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!file || isAnswering}
              className="w-full h-16 pl-6 pr-16 text-base bg-white border-slate-200 rounded-3xl shadow-xl shadow-slate-100 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 disabled:bg-slate-50 disabled:cursor-not-allowed group-hover:border-slate-300 font-medium"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!file || !question.trim() || isAnswering}
              className={`
                absolute right-2 top-2 h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-white
                ${isAnswering ? "opacity-50" : "active:scale-90"}
              `}
            >
              <Send className="w-5 h-5 text-white" />
            </Button>

            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Info className="w-3 h-3 text-indigo-500" />
                  Gemini API Powered
                </p>
                {file && (
                  <p className="text-[10px] font-bold text-indigo-600 flex items-center gap-1.5 uppercase tracking-wider">
                    <ChevronRight className="w-3 h-3" />
                    Context Enabled
                  </p>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase italic">
                Experimental Alpha
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
