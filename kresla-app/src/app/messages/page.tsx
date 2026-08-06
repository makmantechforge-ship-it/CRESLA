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
  CheckCheck,
  Loader2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/auth/login');
        return;
      }
      
      setCurrentUser(user);

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(id, full_name, avatar_url), receiver:profiles!receiver_id(id, full_name, avatar_url)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesData) {
        const convMap = new Map();
        
        const chronologicalMessages = [...messagesData].reverse();
        
        chronologicalMessages.forEach((msg: any) => {
          const isSender = msg.sender_id === user.id;
          const contact = isSender ? msg.receiver : msg.sender;
          
          if (!contact) return;
          
          const contactId = contact.id;
          
          if (!convMap.has(contactId)) {
            convMap.set(contactId, {
              id: contactId,
              contactName: contact.full_name || 'Unknown User',
              role: 'Contact',
              avatar: contact.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.full_name || 'U')}&background=random`,
              online: true, 
              unreadCount: 0,
              messages: []
            });
          }
          
          const conv = convMap.get(contactId);
          if (!isSender && !msg.is_read) {
            conv.unreadCount += 1;
          }
          
          const date = new Date(msg.created_at);
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          conv.messages.push({
            id: msg.id,
            senderId: msg.sender_id,
            text: msg.content || msg.text || '',
            timestamp: timeString,
            isRead: msg.is_read || false
          });
        });
        
        // Order by most recent message (since we reverse, we can use the order of original data)
        const orderedContactIds = [...new Set(messagesData.map((msg: any) => msg.sender_id === user.id ? msg.receiver?.id : msg.sender?.id).filter(Boolean))] as string[];
        
        const orderedConvList = orderedContactIds.map(id => convMap.get(id));

        setConversations(orderedConvList);
        if (orderedConvList.length > 0) {
          setActiveChatId(orderedConvList[0].id);
        }
      }
      setLoading(false);
    }
    
    loadMessages();
  }, [router, supabase]);

  const activeChat = conversations.find(c => c.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !currentUser) return;

    const textToSend = inputText;
    setInputText('');

    // Optimistically add to UI
    const tempId = Date.now().toString();
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: tempId,
      senderId: currentUser.id,
      text: textToSend,
      timestamp: timeString,
      isRead: false
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

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: activeChatId,
        content: textToSend,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error sending message:', error);
      // Could remove the optimistic message here or show error
    } else if (data) {
      // Update with real ID
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeChatId) {
          return {
            ...conv,
            messages: conv.messages.map((m: any) => 
              m.id === tempId ? { ...m, id: data.id } : m
            )
          };
        }
        return conv;
      }));
    }
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    setIsMobileListVisible(false);
    
    // Mark as read locally
    setConversations(prev => prev.map(conv => {
      if (conv.id === id) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
    
    // In a real app we would also update the db:
    // supabase.from('messages').update({ is_read: true }).eq('sender_id', id).eq('receiver_id', currentUser.id);
  };

  const filteredConversations = conversations.filter(c => 
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

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
          {filteredConversations.length === 0 && searchQuery === '' ? (
            <div className="p-8 text-center text-slate-500">
              <p>No messages yet. Start a conversation by contacting a property owner!</p>
            </div>
          ) : (
            filteredConversations.map((chat) => {
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
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100"
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
                        {lastMessage?.senderId === currentUser?.id ? 'You: ' : ''}{lastMessage?.text}
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
            })
          )}
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
                    className="w-10 h-10 rounded-full object-cover bg-slate-100"
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
                {activeChat.messages.map((msg: any, idx: number) => {
                  const isMe = msg.senderId === currentUser?.id;
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
                            <img src={activeChat.avatar} alt="" className="w-8 h-8 rounded-full shadow-sm bg-slate-100" />
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
            <p className="text-center max-w-sm">
              {conversations.length === 0 
                ? 'No messages yet. Start a conversation by contacting a property owner!' 
                : 'Select a conversation from the left to start messaging, or search for a contact.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
