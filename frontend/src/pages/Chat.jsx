import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Send, Paperclip, Search, Circle, MessageSquare } from 'lucide-react';

const Chat = () => {
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activePartner) {
      fetchMessages(activePartner._id);
      
      if (socket) {
        const roomId = [user.id || user._id, activePartner._id].sort().join('-');
        socket.emit('joinRoom', roomId);
      }
    }
  }, [activePartner, socket]);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on('messageReceived', (message) => {
        const isFromPartner = message.sender._id === activePartner?._id || message.sender === activePartner?._id;
        const isToMe = message.receiver === (user.id || user._id);
        
        if (isFromPartner) {
          setMessages((prev) => [...prev, message]);
          
          // Send read receipt if active room
          const roomId = [user.id || user._id, activePartner._id].sort().join('-');
          socket.emit('readReceipt', { roomId, messageId: message._id, readerId: user.id || user._id });
        } else {
          // Re-fetch conversations list to show unread badges
          fetchConversations();
        }
      });

      // Listen for typing indicator
      socket.on('typingStatus', ({ userId, isTyping }) => {
        if (userId === activePartner?._id) {
          setPartnerTyping(isTyping);
        }
      });

      // Listen for partner online status
      socket.on('userStatus', ({ userId, status }) => {
        if (userId === activePartner?._id) {
          setPartnerOnline(status === 'online');
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('messageReceived');
        socket.off('typingStatus');
        socket.off('userStatus');
      }
    };
  }, [socket, activePartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const res = await api.get(`/chat/history/${partnerId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await api.post('/chat', {
        receiverId: activePartner._id,
        message: text
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setText('');
        emitTyping(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const emitTyping = (isTyping) => {
    if (!socket || !activePartner) return;
    const roomId = [user.id || user._id, activePartner._id].sort().join('-');
    socket.emit('typing', { roomId, userId: user.id || user._id, isTyping });
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!typing) {
      setTyping(true);
      emitTyping(true);
    }

    // Debounce typing status clear
    setTimeout(() => {
      setTyping(false);
      emitTyping(false);
    }, 3000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await api.post('/chat', {
          receiverId: activePartner._id,
          file: reader.result,
          fileName: file.name,
          fileType: file.type
        });

        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.data]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)] bg-slate-950">
      {/* Left panel: Conversation log list */}
      <div className="w-1/3 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 mb-2">Chats</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search chat..."
              className="w-full bg-slate-900 border border-slate-800 rounded-md py-1.5 pl-8 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
          {conversations.map((c) => (
            <div
              key={c.partner._id}
              onClick={() => setActivePartner(c.partner)}
              className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${activePartner?._id === c.partner._id ? 'bg-slate-800/60' : 'hover:bg-slate-900'}`}
            >
              <div className="relative h-10 w-10 flex-shrink-0">
                <img
                  src={c.partner.avatar || 'https://via.placeholder.com/150'}
                  alt={c.partner.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-700"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-200 truncate">{c.partner.name}</h3>
                  <span className="text-[10px] text-slate-500">
                    {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-400 truncate">{c.lastMessage.message || 'File attachment'}</p>
                  {c.unreadCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Active Message thread */}
      <div className="flex-1 flex flex-col">
        {activePartner ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              {activePartner.role === 'freelancer' ? (
                <Link to={`/freelancers/${activePartner._id}`} className="flex items-center space-x-3 group">
                  <img
                    src={activePartner.avatar || 'https://via.placeholder.com/150'}
                    alt={activePartner.name}
                    className="h-9 w-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-primary-400 group-hover:underline">{activePartner.name}</h3>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Circle className={`h-2 w-2 fill-current ${partnerOnline ? 'text-green-500' : 'text-slate-500'}`} />
                      <span className="text-[10px] text-slate-400 capitalize">{partnerOnline ? 'online' : 'offline'}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  <img
                    src={activePartner.avatar || 'https://via.placeholder.com/150'}
                    alt={activePartner.name}
                    className="h-9 w-9 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{activePartner.name}</h3>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Circle className={`h-2 w-2 fill-current ${partnerOnline ? 'text-green-500' : 'text-slate-500'}`} />
                      <span className="text-[10px] text-slate-400 capitalize">{partnerOnline ? 'online' : 'offline'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/20">
              {messages.map((m) => {
                const isSentByMe = m.sender._id === (user.id || user._id) || m.sender === (user.id || user._id);
                return (
                  <div key={m._id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 text-sm shadow-md ${isSentByMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                      {m.message && <p>{m.message}</p>}
                      {m.fileUrl && (
                        <div className="mt-1">
                          {m.fileType.startsWith('image/') ? (
                            <img src={m.fileUrl} alt="uploaded" className="max-w-xs rounded-md" />
                          ) : (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer" className="underline text-xs block truncate max-w-xs">
                              {m.fileName || 'View attachment'}
                            </a>
                          )}
                        </div>
                      )}
                      <span className="text-[9px] text-slate-300 block text-right mt-1.5">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {partnerTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 text-xs rounded-lg rounded-tl-none px-3 py-1.5 italic animate-pulse">
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex items-center space-x-2 bg-slate-900/30">
              <label className="cursor-pointer p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
                <Paperclip className="h-5 w-5" />
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>

              <input
                type="text"
                value={text}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-2 px-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary-500"
              />

              <button type="submit" className="p-2 bg-primary-600 hover:bg-primary-500 rounded-full transition-colors text-white">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageSquare className="h-12 w-12 mb-2 text-slate-600" />
            <p className="text-sm">Select a conversation to start collaborating</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
