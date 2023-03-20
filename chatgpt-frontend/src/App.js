import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    const response = await fetch('http://localhost:8090/api/chat_history/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const fetchedChats = await response.json();
    setChats(fetchedChats);
  };

  const fetchChatMessages = async (chatId) => {
    const response = await fetch(`http://localhost:8090/api/chat_messages/${chatId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const chatMessages = await response.json();
    const formattedMessages = chatMessages.map((msg) => ({
      type: msg.role,
      content: msg.content,
    }));
    setMessages(formattedMessages);
  };

  const selectChat = (chatId) => {
    setSelectedChat(chatId);
    fetchChatMessages(chatId);
  };

  const clearChatDisplay = () => {
    setMessages([]);
    setSelectedChat(null);
  };

  const submitMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    setMessages([...messages, { type: 'user', content: message }]);
    setMessage('');

    const response = await fetch('http://localhost:8090/api/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    setMessages((prevMessages) => [...prevMessages, { type: 'ai', content: data.message }]);
    fetchChats();
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      submitMessage(e);
    }
  };

  return (
    <div className="App">
      <div className="sidebar">
        <button onClick={clearChatDisplay}>New Chat</button>
        <div className="chat-history">
          {chats.map((chat, idx) => (
            <div key={idx} className="chat-item" onClick={() => selectChat(chat.id)}>
              Chat {idx + 1}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-container">
        {selectedChat ? (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <span className="message-content">{msg.content}</span>
            </div>
          ))
        ) : (
          <div className="no-chat-selected">No chat selected</div>
        )}
      </div>
      <form onSubmit={submitMessage}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          rows={3}
            />
            <button type="submit">Send</button>
          </form>
        </div>
        );
      }
      
      export default App;
