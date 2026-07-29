'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Send, 
  Mic, 
  ArrowLeft,
  Check,
  CheckCheck
} from 'lucide-react';

// --- Mock Data ---
const currentUser = { id: 'u1', name: 'Alex Johnson' };

const mockConversations = [
  {
    id: 'c1',
    contactName: 'Sarah Jenkins',
    role: 'Real Estate Agent',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    online: true,
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'c1', text: 'Hi Alex, the viewing for the penthouse is confirmed for tomorrow at 2 PM.', timestamp: '10:30 AM', isRead: true },
      { id: 'm2', senderId: 'u1', text: 'Great, thanks Sarah! Is there parking available?', timestamp: '10:35 AM', isRead: true },
      { id: 'm3', senderId: 'c1', text: 'Yes, there is dedicated guest parking on the lower level.', timestamp: '11:00 AM', isRead: false },
      { id: 'm4', senderId: 'c1', text: 'I will send you the access code shortly.', timestamp: '11:01 AM', isRead: false },
    ]
  },
  {
    id: 'c2',
    contactName: 'Michael Chen',
    role: 'Property Owner',
    avatar: 'https://i.pravatar.cc/150?u=michael',
    online: false,
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hi Michael, I was wondering if the rent is negotiable?', timestamp: 'Yesterday', isRead: true },
      { id: 'm2', senderId: 'c2', text: 'Hello! I might be open to a slight reduction for a 2-year lease. What were you thinking?', timestamp: 'Yesterday', isRead: true },
    ]
  },
  {
    id: 'c3',
    contactName: 'Emily Davis',
    role: 'Broker',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    online: true,
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'c3', text: 'The documents are ready for your signature.', timestamp: 'Monday', isRead: true },
      { id: 'm2', senderId: 'u1', text: 'I will review them tonight and get back to you.', timestamp: 'Monday', isRead: true },
    ]
  },
  {
    id: 'c4',
    contactName: 'James Wilson',
    role: 'Support',
    avatar: 'https://i.pravatar.cc/150?u=james',
    online: false,
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'c4', text: 'Your listing has been approved and is now live on CRESLA.', timestamp: 'Sunday', isRead: false },
    ]
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeChatId, setActiveChatId] = useState<string | null>(conversations[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find(c => c.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeChatId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage]
        };
      }
      return conv;
    }));

    setInputText('');
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    setIsMobileListVisible(false);
    
    // Mark as read
    setConversations(prev => prev.map(conv => {
      if (conv.id === id) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
  };

  const filteredConversations = conversations.filter(c => 
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-slate-50 flex overflow-hidden">
      
      {/* LEFT PANEL: Conversation List */}
      <div className={`
        ${isMobileListVisible ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-1/3 lg:w-[380px] bg-white border-r border-slate-200 shadow-sm z-10
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Messages</h1>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((chat) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            const isActive = chat.id === activeChatId;
            
            return (
              <motion.div 
                key={chat.id}
                whileHover={{ backgroundColor: isActive ? '#f1f5f9' : '#f8fafc' }}
                onClick={() => selectChat(chat.id)}
                className={`
                  p-4 border-b border-slate-50 cursor-pointer flex items-center gap-4 transition-colors
                  ${isActive ? 'bg-slate-100' : 'bg-white'}
                `}
              >
                <div className="relative shrink-0">
                  <img 
                    src={chat.avatar} 
                    alt={chat.contactName} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-slate-800 truncate pr-2">{chat.contactName}</h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{lastMessage?.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-2 ${chat.unreadCount > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {lastMessage?.senderId === currentUser.id ? 'You: ' : ''}{lastMessage?.text}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Active Chat */}
      <div className={`
        ${!isMobileListVisible ? 'flex' : 'hidden'} 
        md:flex flex-col flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50
      `}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] px-4 md:px-6 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm z-10">
              <div className="flex items-center gap-4">
                <button 
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
                  onClick={() => setIsMobileListVisible(true)}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative hidden sm:block">
                  <img 
                    src={activeChat.avatar} 
                    alt={activeChat.contactName} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {activeChat.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">{activeChat.contactName}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    {activeChat.role}
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    {activeChat.online ? <span className="text-emerald-500">Online</span> : <span>Offline</span>}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 text-primary">
                <button className="p-2.5 hover:bg-slate-100 rounded-full transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-2.5 hover:bg-slate-100 rounded-full transition-colors">
                  <Video size={20} />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="text-center">
                <span className="bg-white/80 backdrop-blur border border-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full shadow-sm">
                  Today
                </span>
              </div>
              
              <AnimatePresence initial={false}>
                {activeChat.messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser.id;
                  const showAvatar = !isMe && (idx === 0 || activeChat.messages[idx - 1].senderId !== msg.senderId);

                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-8 shrink-0 flex items-end">
                          {showAvatar && (
                            <img src={activeChat.avatar} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                          )}
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div className={`
                          px-4 py-2.5 rounded-2xl shadow-sm relative group
                          ${isMe 
                            ? 'bg-primary text-white rounded-br-sm' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'}
                        `}>
                          <p className="text-[15px] leading-relaxed">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                          {isMe && (
                            <span className="text-primary">
                              {msg.isRead ? <CheckCheck size={14} /> : <Check size={14} className="text-slate-400" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 z-10">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-inner"
              >
                <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                  <Paperclip size={20} />
                </button>
                
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-[40px] bg-transparent resize-none outline-none text-slate-800 py-2.5 px-2 text-[15px] placeholder-slate-400"
                  rows={1}
                />
                
                <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0 hidden sm:block">
                  <Smile size={20} />
                </button>
                
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-xl shrink-0 transition-all ${
                    inputText.trim() 
                      ? 'bg-primary text-white shadow-md hover:bg-primary/90 hover:scale-105' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {inputText.trim() ? <Send size={18} className="ml-0.5" /> : <Mic size={18} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Send size={40} className="text-slate-300 ml-2" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Your Messages</h3>
            <p className="text-center max-w-sm">Select a conversation from the left to start messaging, or search for a contact.</p>
          </div>
        )}
      </div>

    </div>
  );
}
