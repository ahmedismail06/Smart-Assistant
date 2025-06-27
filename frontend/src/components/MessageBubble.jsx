import React from "react";
import { FaUser, FaRobot, FaRegClock } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ sender, text, timestamp, isGroupStart, isThinking, userAvatar }) {
  const isUser = sender === "user";
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setIsDark(document.body.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);
  const timeString = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <>
      {isGroupStart && <div className="message-separator" />}
      <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8`}>
        {!isUser && (
          <div className="flex flex-col items-center mr-3">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SmartAssistantBot" alt="Bot Avatar" className="w-8 h-8 rounded-full object-cover shadow" />
          </div>
        )}
        <div className={`max-w-[70%] flex flex-col items-${isUser ? 'end' : 'start'}`}>
          <span
            className={
              `relative rounded-[18px] bubble-shadow text-base font-normal text-contrast transition-all duration-200 ` +
              (isUser
                ? 'bg-[var(--color-bubble-user)] text-gray-900'
                : 'bg-white text-gray-900')
            }
            style={{
              padding: 16,
              maxWidth: '100%',
              ...(isUser
                ? (isDark ? { background: '#181824', color: '#F4F4F8' } : {})
                : (isDark ? { background: '#232946', color: '#F4F4F8' } : { background: '#fff' })
              )
            }}
          >
            {isThinking ? (
              <span className="flex gap-1 items-center h-6">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.18s' }}></span>
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.36s' }}></span>
              </span>
            ) : (
              <ReactMarkdown>{text}</ReactMarkdown>
            )}
          </span>
          <span className="mt-2 ml-2 text-xs text-gray-400 flex items-center gap-1 select-none font-light">
            <FaRegClock className="mr-1 text-gray-300 text-xs" />
            {timeString}
          </span>
        </div>
        {isUser && (
          <div className="flex flex-col items-center ml-3">
            <img src={userAvatar || "https://api.dicebear.com/7.x/person/svg?seed=User"} alt="User Avatar" className="w-8 h-8 rounded-full object-cover shadow" />
          </div>
        )}
      </div>
    </>
  );
} 