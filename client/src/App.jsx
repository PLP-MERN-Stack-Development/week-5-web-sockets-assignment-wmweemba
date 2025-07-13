import { useState, useRef, useEffect } from 'react';
import { useSocket } from './socket/socket';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { connect, isConnected, messages, sendMessage, typingUsers, setTyping, users } = useSocket();

  const handleLogin = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setUsername(input.trim());
      connect(input.trim());
      setShowModal(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      setTyping(false);
    }
  };

  // Typing indicator logic
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(false);
    }, 1000);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Filter out self from typing users
  const otherTypingUsers = typingUsers.filter((u) => u !== username);

  return (
    <>
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Enter your username</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Username"
                autoFocus
                required
              />
              <button type="submit">Join Chat</button>
            </form>
          </div>
        </div>
      )}
      {!showModal && (
        <div className="chat-container">
          <h1>Welcome, {username}!</h1>
          <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <div style={{ minWidth: 180, textAlign: 'left' }}>
              <h3 style={{ margin: '8px 0' }}>Online Users</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map((user) => (
                  <li key={user.id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'limegreen',
                      marginRight: 8,
                    }} />
                    <span style={{ fontWeight: user.username === username ? 'bold' : 'normal' }}>
                      {user.username} {user.username === username && '(You)'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <div className="chat-box" style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: 8 }}>
                    {msg.system ? (
                      <em style={{ color: '#888' }}>{msg.message}</em>
                    ) : (
                      <>
                        <strong>{msg.sender || 'Anonymous'}</strong> <span style={{ color: '#aaa', fontSize: 12 }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>: {msg.message}
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {otherTypingUsers.length > 0 && (
                <div style={{ color: '#888', fontStyle: 'italic', marginBottom: 8 }}>
                  {otherTypingUsers.join(', ')} {otherTypingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={message}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  style={{ flex: 1 }}
                  disabled={!isConnected}
                  required
                />
                <button type="submit" disabled={!isConnected || !message.trim()}>
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
