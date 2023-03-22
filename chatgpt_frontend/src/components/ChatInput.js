import React from "react";

const ChatInput = ({ inputMessage, setInputMessage, sendMessage }) => {
  return (
    <div className="chat-input">
      <textarea
        placeholder="Type a message"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />

      <button onClick={sendMessage} disabled={!inputMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;
