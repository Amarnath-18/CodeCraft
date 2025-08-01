import React, { useRef, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import { extractTextFromJsonMarkdown, getAvatarUrl } from "../utils/projectUtils";

const ProjectChat = ({
  messages,
  messageText,
  setMessageText,
  onSendMessage,
  currentUser,
  isAiThinking = false,
}) => {
  const messageEndRef = useRef();

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSendMessage();
    }
  };

  return (
    <div className="conversationArea max-w-96 grow flex flex-col">
      <div className="messageArea no-scrollbar grow flex flex-col p-2 gap-2 overflow-y-auto max-h-[550px]">
        {messages &&
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              isCurrentUser={msg.senderEmail === currentUser?.email}
            />
          ))}
        
        {/* AI Thinking Indicator */}
        {isAiThinking && <AIThinkingBubble />}
        
        <div ref={messageEndRef} />
      </div>

      <div className="inputBox bg-blue-500 w-full rounded-2xl flex">
        <input
          type="text"
          className="rounded- grow outline-none p-2"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={messageText.includes('@ai') ? "Ask AI anything..." : "Type @ai to chat with AI..."}
        />
        <button
          className="p-2 cursor-pointer rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50"
          onClick={onSendMessage}
          disabled={!messageText.trim() || isAiThinking}
        >
          <i className="ri-send-plane-fill"></i>
        </button>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isCurrentUser }) => {
  return (
    <div
      className={`bg-amber-50 max-w-44 p-2 flex-col rounded-2xl break-words shadow-sm ${
        isCurrentUser ? "ml-auto" : "mr-auto"
      }`}
    >
      <div className="flex justify-center items-center p-1 gap-1">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          <img
            className="h-4 w-4 rounded-2xl"
            src={getAvatarUrl(message.senderEmail)}
            alt="avatar"
          />
        </div>
        <p className="text-sm opacity-55">{message.senderEmail}</p>
      </div>

      {message.senderEmail === "@Ai" ? (
        <AIMessageContent message={message} />
      ) : (
        <p className="text-sm break-words whitespace-pre-wrap">
          {message.text}
        </p>
      )}
    </div>
  );
};

const AIMessageContent = ({ message }) => {
  const { text } = extractTextFromJsonMarkdown(message.text);
  
  return (
    <div className="bg-gray-600 text-gray-100 p-3 rounded-xl w-fit overflow-hidden">
      <div className="space-y-3">
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
};

const AIThinkingBubble = () => {
  return (
    <div className="bg-amber-50 max-w-44 p-2 flex-col rounded-2xl break-words shadow-sm mr-auto">
      <div className="flex justify-center items-center p-1 gap-1">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          <img
            className="h-4 w-4 rounded-2xl"
            src="https://api.dicebear.com/8.x/pixel-art/svg?seed=@Ai"
            alt="AI avatar"
          />
        </div>
        <p className="text-sm opacity-55">@Ai</p>
      </div>
      
      <div className="bg-gray-600 text-gray-100 p-3 rounded-xl w-fit">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <span className="text-sm">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectChat;




