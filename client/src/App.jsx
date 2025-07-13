import { useState, useRef, useEffect } from 'react';
import { useSocket } from './socket/socket';
import './App.css';

const DEFAULT_ROOMS = ['global'];

function App() {
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChat, setActiveChat] = useState({ type: 'room', room: 'global' }); // {type: 'room', room: string} or {type: 'private', user: {id, username}}
  const [rooms, setRooms] = useState([...DEFAULT_ROOMS]);
  const [newRoom, setNewRoom] = useState('');
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { connect, isConnected, messages, sendMessage, sendPrivateMessage, typingUsers, setTyping, users, socket, markMessageRead, reactToMessage } = useSocket();
  const [file, setFile] = useState(null);

  const REACTIONS = [
    { emoji: '👍', name: 'like' },
    { emoji: '❤️', name: 'love' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', name: 'sad' },
    { emoji: '🎉', name: 'party' },
  ];

  // Track messages per room
  const filteredMessages = messages.filter(msg => {
    if (activeChat.type === 'room') {
      return !msg.isPrivate && (msg.room === activeChat.room || (!msg.room && activeChat.room === 'global'));
    } else if (activeChat.type === 'private') {
      return (
        msg.isPrivate &&
        ((msg.sender === username && msg.senderId === activeChat.user.id) ||
          (msg.sender === activeChat.user.username && msg.senderId === socket.id))
      );
    }
    return false;
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setUsername(input.trim());
      connect(input.trim());
      setShowModal(false);
      setActiveChat({ type: 'room', room: 'global' });
      socket.emit('join_room', 'global');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    let fileData = null;
    if (file) {
      // Read file as base64
      fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          type: file.type,
          data: reader.result,
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    if (message.trim() || fileData) {
      if (activeChat.type === 'room') {
        sendMessage({ message: message.trim(), room: activeChat.room, file: fileData });
      } else if (activeChat.type === 'private') {
        sendPrivateMessage(activeChat.user.id, message.trim(), fileData);
      }
      setMessage('');
      setFile(null);
      setIsTyping(false);
      if (activeChat.type === 'room') {
        setTyping({ isTyping: false, room: activeChat.room });
      } else if (activeChat.type === 'private') {
        setTyping({ isTyping: false, room: `private_${[username, activeChat.user.username].sort().join('_')}` });
      }
    }
  };

  // Typing indicator logic
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      if (activeChat.type === 'room') {
        setTyping({ isTyping: true, room: activeChat.room });
      } else if (activeChat.type === 'private') {
        setTyping({ isTyping: true, room: `private_${[username, activeChat.user.username].sort().join('_')}` });
      }
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeChat.type === 'room') {
        setTyping({ isTyping: false, room: activeChat.room });
      } else if (activeChat.type === 'private') {
        setTyping({ isTyping: false, room: `private_${[username, activeChat.user.username].sort().join('_')}` });
      }
    }, 1000);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Filter out self from typing users, and only for current chat
  let otherTypingUsers = [];
  if (activeChat.type === 'room') {
    otherTypingUsers = typingUsers.filter((u) => u !== username);
  } else if (activeChat.type === 'private') {
    // For private chat, only show if the other user is typing
    otherTypingUsers = typingUsers.filter((u) => u === activeChat.user.username);
  }

  // Handle chat switching
  const handleSelectChat = (item) => {
    if (item.type === 'room') {
      setActiveChat({ type: 'room', room: item.room });
      socket.emit('join_room', item.room);
    } else if (item.type === 'private') {
      setActiveChat({ type: 'private', user: item.user });
    }
  };

  // Handle room creation
  const handleCreateRoom = (e) => {
    e.preventDefault();
    const room = newRoom.trim();
    if (room && !rooms.includes(room)) {
      setRooms([...rooms, room]);
      setActiveChat({ type: 'room', room });
      socket.emit('join_room', room);
      setNewRoom('');
    }
  };

  // Add new rooms from received messages (if any)
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.room && !rooms.includes(msg.room)) {
        setRooms(prev => [...prev, msg.room]);
      }
    });
  }, [messages, rooms]);

  // Mark visible messages as read
  useEffect(() => {
    filteredMessages.forEach(msg => {
      if (msg.sender !== username && (!msg.readBy || !msg.readBy.includes(username))) {
        markMessageRead(msg.id);
      }
    });
  }, [filteredMessages, username, markMessageRead]);

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
            <div style={{ minWidth: 220, textAlign: 'left' }}>
              <h3 style={{ margin: '8px 0' }}>Rooms</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {rooms.map((room) => (
                  <li
                    key={room}
                    style={{ marginBottom: 6, cursor: 'pointer', fontWeight: activeChat.type === 'room' && activeChat.room === room ? 'bold' : 'normal' }}
                    onClick={() => handleSelectChat({ type: 'room', room })}
                  >
                    <span style={{ color: activeChat.type === 'room' && activeChat.room === room ? 'blue' : 'inherit' }}># {room}</span>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleCreateRoom} style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                <input
                  type="text"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  placeholder="New room name"
                  style={{ flex: 1 }}
                />
                <button type="submit" disabled={!newRoom.trim()}>+</button>
              </form>
              <h3 style={{ margin: '16px 0 8px' }}>Online Users</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map((user) => (
                  <li
                    key={user.id}
                    style={{
                      marginBottom: 6,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: user.username !== username ? 'pointer' : 'default',
                      fontWeight:
                        activeChat.type === 'private' && activeChat.user?.id === user.id
                          ? 'bold'
                          : 'normal',
                    }}
                    onClick={() => handleSelectChat({ type: 'private', user })}
                  >
                    <span style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'limegreen',
                      marginRight: 8,
                    }} />
                    <span>
                      {user.username} {user.username === username && '(You)'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <div className="chat-box" style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
                {filteredMessages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: 8 }}>
                    {msg.system ? (
                      <em style={{ color: '#888' }}>{msg.message}</em>
                    ) : (
                      <>
                        <strong>{msg.sender || 'Anonymous'}</strong> <span style={{ color: '#aaa', fontSize: 12 }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>: {msg.message}
                        {msg.isPrivate && <span style={{ color: 'purple', fontSize: 12, marginLeft: 8 }}>(private)</span>}
                        {msg.room && msg.room !== 'global' && !msg.isPrivate && (
                          <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>[#{msg.room}]</span>
                        )}
                        {msg.file && (
                          <div style={{ marginTop: 4 }}>
                            {msg.file.type.startsWith('image/') ? (
                              <img src={msg.file.data} alt={msg.file.name} style={{ maxWidth: 200, maxHeight: 200, border: '1px solid #ccc' }} />
                            ) : (
                              <a href={msg.file.data} download={msg.file.name} target="_blank" rel="noopener noreferrer">
                                {msg.file.name}
                              </a>
                            )}
                          </div>
                        )}
                        {msg.readBy && msg.readBy.length > 0 && (
                          <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>
                            Read by: {msg.readBy.join(', ')}
                          </div>
                        )}
                        <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
                          {REACTIONS.map(r => (
                            <button
                              key={r.name}
                              style={{ fontSize: 16, padding: '2px 6px', border: '1px solid #eee', borderRadius: 4, background: '#fafafa', cursor: 'pointer' }}
                              onClick={() => reactToMessage(msg.id, r.name)}
                              disabled={!isConnected}
                              title={r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                            >
                              {r.emoji} {msg.reactions && msg.reactions[r.name] ? msg.reactions[r.name].length : ''}
                            </button>
                          ))}
                        </div>
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
                  placeholder={
                    activeChat.type === 'room'
                      ? `Message #${activeChat.room}`
                      : `Message @${activeChat.user.username}`
                  }
                  style={{ flex: 1 }}
                  disabled={!isConnected}
                />
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ flex: 1 }}
                  disabled={!isConnected}
                />
                <button type="submit" disabled={!isConnected || (!message.trim() && !file)}>
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
