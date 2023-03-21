import React, { useState, useEffect, useRef } from "react";

import axios from "axios";
import "./App.css";

const baseURL = "http://localhost:8090";

function App() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/chats/`);
      setChats(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`${baseURL}/api/chats/${chatId}/`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    // Update the local state before sending the message to the backend
    setMessages([
      ...messages,
      {
        content: inputMessage,
        role: "user",
      },
    ]);
    setInputMessage("");

    try {
      console.log(selectedChatId);
      const response = await axios.post(`${baseURL}/api/chats/`, {
        chat_id: selectedChatId || undefined,
        message: inputMessage,
      });

      // If there was no selected chat, set the selected chat to the newly created one
      if (!selectedChatId) {
        setSelectedChatId(response.data.chat_id);
      } else {
        fetchMessages(selectedChatId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await axios.post(`${baseURL}/api/chats/`);
      const newChat = response.data;

      setChats([newChat, ...chats]);
      setSelectedChatId(newChat.id);
    } catch (error) {
      console.error("Error creating a new chat:", error);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-history-container">
          <button className="new-chat-button" onClick={createNewChat}>
            + New Chat
          </button>
          <div className="chat-history">
            {chats.slice(0).map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`chat ${
                  selectedChatId === chat.id ? "selected" : ""
                }`}
              >
                Chat {chat.id}
              </div>
            ))}
          </div>
        </div>
        <div className="chat-ui">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.role === "user" ? "user" : "assistant"
                }`}
              >
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button onClick={sendMessage} disabled={!inputMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
