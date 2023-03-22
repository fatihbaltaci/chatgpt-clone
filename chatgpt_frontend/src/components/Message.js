import React from "react";

const Message = ({ message, formatMessageContent }) => {
  return (
    <div
      className={`message ${
        message.role === "user" ? "user" : "assistant"
      }`}
      dangerouslySetInnerHTML={{
        __html: formatMessageContent(message.content),
      }}
    />
  );
};

export default Message;
