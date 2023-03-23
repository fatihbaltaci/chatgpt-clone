import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaGithub } from "react-icons/fa";

import "./App.css";
import ChatHistory from "./components/ChatHistory";
import ChatUI from "./components/ChatUI";

const baseURL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8090/api";

function App() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

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
      const response = await axios.get(`${baseURL}/chats/`);
      setChats(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`${baseURL}/chats/${chatId}/`);
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

    setIsAssistantTyping(true);

    try {
      // Simulate a delay for the typewriting effect
      const delay = 1000 + Math.random() * 1000; // Random delay between 1-2 seconds
      setTimeout(async () => {
        try {
          const response = await axios.post(`${baseURL}/chats/`, {
            chat_id: selectedChatId || undefined,
            message: inputMessage,
          });

          // If there was no selected chat, set the selected chat to the newly created one
          if (!selectedChatId) {
            setSelectedChatId(response.data.chat_id);
            setChats([{ id: response.data.chat_id }, ...chats]);
          } else {
            fetchMessages(selectedChatId);
          }
        } catch (error) {
          console.error("Error sending message:", error);
          setMessages([
            ...messages,
            {
              content:
                "⚠️ An error occurred while sending the message. Please make sure the backend is running and OPENAI_API_KEY is set in the .env file.",
              role: "assistant",
            },
          ]);
        } finally {
          setIsAssistantTyping(false);
        }
      }, delay);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await axios.post(`${baseURL}/chats/`);
      const newChat = response.data;

      setChats([newChat, ...chats]);
      setSelectedChatId(newChat.id);
    } catch (error) {
      console.error("Error creating a new chat:", error);
    }
  };

  function formatMessageContent(content) {
    const sections = content.split(/(```[\s\S]*?```|`[\s\S]*?`)/g);
    return sections
      .map((section) => {
        if (section.startsWith("```") && section.endsWith("```")) {
          section = section.split("\n").slice(1).join("\n");
          const code = section.substring(0, section.length - 3);
          return `<pre><code class="code-block">${code}</code></pre>`;
        } else if (section.startsWith("`") && section.endsWith("`")) {
          const code = section.substring(1, section.length - 1);
          return `<code class="inline-code">${code}</code>`;
        } else {
          return section.replace(/\n/g, "<br>");
        }
      })
      .join("");
  }

  return (
    <div className="App">
      <div className="headline">
        <h1>⚡ ChatGPT Clone ⚡</h1>
      </div>
      <div className="chat-container">
        <div className="chat-history-container">
          <button className="new-chat-button" onClick={createNewChat}>
            <strong>+ New Chat</strong>
          </button>
          <ChatHistory
            chats={chats}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
          />
        </div>
        <ChatUI
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          sendMessage={sendMessage}
          formatMessageContent={formatMessageContent}
          isAssistantTyping={isAssistantTyping}
          messagesEndRef={messagesEndRef}
        />
      </div>
      <div className="footer">
        <a
          href="https://github.com/fatihbaltaci/chatgpt-clone"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub className="icon" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}

export default App;
