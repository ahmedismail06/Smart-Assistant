import React, { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import { FaRobot, FaPaperclip, FaRegPaperPlane, FaCalendarAlt, FaSmile, FaBrain, FaFileAlt, FaMoon, FaSun } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWindow({ messages, onSend, onFileUpload, onScheduleUpload, loading, input, setInput }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef();
  const [botIdle, setBotIdle] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef();
  const chatEndRef = useRef();
  const [isDark, setIsDark] = useState(false);

  // Move actions array here so JSX is only created at render time
  const actions = [
    { label: 'Summarize', icon: <FaBrain />, action: 'summarize', tooltip: 'Summarize Conversation' },
    { label: 'Schedule Event', icon: <FaCalendarAlt />, action: 'schedule', tooltip: 'Schedule Event' },
    { label: 'Analyze Document', icon: <FaFileAlt />, action: 'analyze', tooltip: 'Analyze Document' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setBotIdle(!loading);
  }, [loading]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setIsDark(document.body.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input, messages);
      setInput("");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const question = window.prompt('Enter a question about this document (or leave blank for summary):', 'Summarize this document');
      onFileUpload(e.target.files[0], question);
      e.target.value = null;
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    setInput(input.slice(0, start) + emoji + input.slice(end));
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.selectionEnd = start + emoji.length;
    }, 0);
  };

  // Toolbar action handlers (stub)
  const handleToolbarAction = (action) => {
    if (action === 'summarize') {
      onSend('Summarize the conversation so far.');
    } else if (action === 'schedule') {
      onScheduleUpload();
    } else if (action === 'analyze') {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full mx-auto relative page-fade">
      {/* Header with glassmorphism and toolbar on the right */}
      <div
        className="flex items-center"
        style={{
          background: isDark ? 'rgba(35,41,70,0.95)' : 'rgba(255,255,255,0.9)',
          height: 65,
          borderBottom: isDark ? '1px solid #232946' : '1px solid rgba(0,0,0,0.1)',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          boxShadow: isDark ? '0 2px 8px 0 rgba(35,41,70,0.18)' : '0 2px 8px 0 rgba(99,102,241,0.08), 0 1.5px 0 0 #e0e7ff',
          position: 'relative',
          zIndex: 10,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24
        }}
      >
        {/* Left: Avatar, Title, Status */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-3">
            <div className="relative bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-1 rounded-full shadow-lg flex items-center justify-center bot-avatar-pulse">
              <div className="bg-white rounded-full p-2 flex items-center justify-center">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SmartAssistantBot" alt="Bot Avatar" className="w-10 h-10 rounded-full object-cover" />
              </div>
            </div>
            <span className="bot-name text-[1.15rem] md:text-[1.25rem] font-bold tracking-wide text-gray-900 drop-shadow" style={{fontWeight:700}}>SmartAssistantBot</span>
          </div>
          <div className="flex items-center gap-4 mt-1">
            {/* AI Assistant pill - more visible and better spaced */}
            <span className="inline-flex items-center px-4 py-0.5 rounded-full bg-indigo-200 text-indigo-800 text-xs font-normal shadow-sm border border-indigo-300" style={{fontWeight:400}}>
              AI Assistant
            </span>
            {/* Online status with larger green dot and white border, better spacing */}
            <span className="flex items-center gap-2 font-normal text-xs text-gray-600 select-none align-middle">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white mr-1 align-middle animate-status-blink" style={{boxShadow:'0 0 0 2px #fff, 0 0 8px 2px #22c55e44'}}></span>
              <span>Online</span>
            </span>
          </div>
        </div>
        {/* Separator between left and right */}
        <div className="mx-6 h-10 w-px bg-gray-200/60 rounded-full hidden md:block" />
        {/* Right: Toolbar icons */}
        <div className="flex items-center ml-auto gap-3 toolbar-icons">
          {/* Toolbar icons with hover effects, tooltips, and separators */}
          {actions.map((a, idx) => (
            <React.Fragment key={a.action}>
              {idx > 0 && (
                <span className="mx-1 h-6 w-px bg-gray-200/60 rounded-full" />
              )}
              <div className="relative group">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-indigo-100/90 text-indigo-600 shadow text-xl focus:outline-none border border-indigo-100/60 backdrop-blur hover-scale ripple btn-tap transition-all duration-200 hover:shadow-lg hover:scale-105"
                  style={{ minWidth: 36, minHeight: 36, borderRadius: '50%' }}
                  onClick={() => handleToolbarAction(a.action)}
                  type="button"
                  aria-label={a.label}
                >
                  {a.icon}
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30 whitespace-nowrap shadow-lg" style={{ bottom: '-2.2rem' }}>{a.tooltip}</span>
              </div>
            </React.Fragment>
          ))}
          <span className="mx-1 h-6 w-px bg-gray-200/60 rounded-full" />
          <div className="relative group">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 hover:bg-indigo-100/90 text-indigo-600 shadow text-xl focus:outline-none border border-indigo-100/60 backdrop-blur hover-scale ripple btn-tap transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{ minWidth: 36, minHeight: 36, borderRadius: '50%' }}
              onClick={() => setDarkMode((d) => !d)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
              type="button"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30 whitespace-nowrap shadow-lg" style={{ bottom: '-2.2rem' }}>Dark Mode</span>
          </div>
        </div>
      </div>
      {/* Subtle separator line below header */}
      <div className="w-full h-px bg-gradient-to-r from-indigo-100 via-gray-200 to-purple-100 opacity-80 mb-2" />
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 z-0 scroll-smooth pb-32" ref={chatEndRef} style={{background: isDark ? '#181824' : undefined}}>
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const isGroupStart = !prev || prev.sender !== msg.sender;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, transform: 'translateY(20px)' }}
                animate={{ opacity: 1, transform: 'translateY(0)' }}
                exit={{ opacity: 0, transform: 'translateY(20px)' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <MessageBubble sender={msg.sender} text={msg.text} timestamp={msg.timestamp} isGroupStart={isGroupStart} />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {/* Typing animation for assistant */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            exit={{ opacity: 0, transform: 'translateY(20px)' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex w-full justify-start mb-5 relative animate-fade-slide-in" style={{marginBottom: 20}}>
              <div className="flex flex-col items-center mr-3">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SmartAssistantBot" alt="Bot Avatar" className="w-8 h-8 rounded-full object-cover shadow" />
              </div>
              <div className="max-w-[70%] flex flex-col items-start">
                <span className="relative px-4 py-4 rounded-[18px] shadow-md text-base font-semibold transition-all duration-200 bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.10)]" style={{padding: 16}}>
                  <span className="flex gap-1 items-center h-6">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    <span className="ml-2 text-xs text-gray-400 font-normal">Typing...</span>
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>
      {/* Input Area - always at the bottom, not fixed here */}
      <form
        onSubmit={handleSend}
        className="w-full max-w-[800px] flex items-center justify-center p-0 bg-transparent border-none shadow-none z-30"
        style={{ position: 'sticky', bottom: 0 }}
      >
        <div
          className="flex-1 flex items-center"
          style={{
            background: isDark ? '#232946' : '#fff',
            borderRadius: 25,
            border: isDark ? '1px solid #232946' : '1px solid rgba(0,0,0,0.1)',
            margin: 20,
            padding: 8,
            boxShadow: isDark ? '0 2px 8px rgba(35,41,70,0.18)' : '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: 800,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {/* Left buttons inside input */}
          <button
            type="button"
            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center bg-white hover:bg-indigo-50 rounded-full transition-all duration-200 shadow animate-emoji-btn active:scale-95 focus:scale-105 hover:shadow-md"
            onClick={() => setShowEmoji((v) => !v)}
            tabIndex={-1}
            title="Emoji"
            style={{marginRight: 8}}
          >
            <FaSmile className="text-yellow-500 text-xl" />
          </button>
          <button
            type="button"
            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center bg-white hover:bg-blue-50 rounded-full transition-all duration-200 shadow active:scale-95 focus:scale-105 hover:shadow-md"
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
            title="Upload File"
            style={{marginRight: 8}}
          >
            <FaPaperclip className="text-indigo-500 text-xl" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Input field */}
          <input
            type="text"
            ref={inputRef}
            className="flex-1 rounded-[18px] border border-gray-200 shadow-sm bg-white placeholder-gray-400 font-semibold text-base transition-all duration-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            style={{
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 16,
              paddingRight: 16,
              background: isDark ? '#181824' : '#fff',
              color: isDark ? '#F4F4F8' : undefined,
              minWidth: 0,
              boxShadow: isDark ? '0 1.5px 6px 0 rgba(35,41,70,0.12)' : '0 1.5px 6px 0 rgba(99,102,241,0.07)'
            }}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          {/* Send button inside input on right */}
          <button
            type="submit"
            className={`w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full shadow-md text-white disabled:opacity-50 ripple hover-scale btn-tap ml-2
              ${input.trim() ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 hover:scale-110 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}
            disabled={loading || !input.trim()}
            title="Send"
            style={{boxShadow: input.trim() ? '0 2px 12px 0 rgba(99,102,241,0.18)' : undefined}}
          >
            <FaRegPaperPlane className="animate-send-icon text-xl" />
          </button>
        </div>
        {showEmoji && (
          <div className="absolute bottom-20 left-0 z-20">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" height={350} width={300} />
          </div>
        )}
      </form>
    </div>
  );
} 