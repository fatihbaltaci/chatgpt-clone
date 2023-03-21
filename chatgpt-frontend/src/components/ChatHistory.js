import React from "react";

const ChatHistory = ({ chats, selectedChatId, setSelectedChatId }) => {
  return (
    <div className="chat-history">
      {chats.slice(0).map((chat) => (
        <div
          key={chat.id}
          onClick={() => setSelectedChatId(chat.id)}
          className={`chat ${selectedChatId === chat.id ? "selected" : ""}`}
        >
          Chat: {chat.id}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
