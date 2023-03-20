import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    const response = await fetch('http://localhost:8090/api/chat_history/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const chatHistory = await response.json();
    const formattedHistory = chatHistory.map((msg) => ({
      type: msg.is_user ? 'user' : 'ai',
      content: msg.content,
    }));
    setMessages(formattedHistory);
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
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      submitMessage(e);
    }
  };


  return (
    <div className="App">
      <div className="chat-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <span className="message-content">{msg.content}</span>
          </div>
        ))}
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
