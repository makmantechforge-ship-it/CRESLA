'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Send, 
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  Building2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { 
  getUserProfile, 
  getPropertyById, 
  sendMessage, 
  markMessagesAsRead 
} from '@/utils/supabase/queries';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const toUserId = searchParams.get('to');
  const propertyId = searchParams.get('property');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(toUserId || null);
  const [inquiryProperty, setInquiryProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(!toUserId);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load Messages & Active Contact
  useEffect(() => {
    async function loadChatData() {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        const redirectUrl = toUserId ? `/messages?to=${toUserId}${propertyId ? `&property=${propertyId}` : ''}` : '/messages';
        router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }
      
      setCurrentUser(user);

      // If inquiry about a property is present, fetch property details
      if (propertyId) {
        try {
          const prop = await getPropertyById(propertyId);
          if (prop) {
            setInquiryProperty(prop);
            setInputText(`Hi, I'm interested in "${prop.title}". Is it currently available for viewing?`);
          }
        } catch (err) {
          console.warn('Could not fetch inquiry property:', err);
        }
      }

      // Fetch user's existing messages
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(id, full_name, avatar_url, phone), receiver:profiles!receiver_id(id, full_name, avatar_url, phone)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      const convMap = new Map<string, any>();

      if (messagesData) {
        const chronologicalMessages = [...messagesData].reverse();
        
        chronologicalMessages.forEach((msg: any) => {
          const isSender = msg.sender_id === user.id;
          const contact = isSender ? msg.receiver : msg.sender;
          
          if (!contact) return;
          const contactId = contact.id;
          
          if (!convMap.has(contactId)) {
            convMap.set(contactId, {
              id: contactId,
              contactName: contact.full_name || 'User',
              phone: contact.phone || '',
              role: 'Landlord / Agent',
              avatar: contact.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.full_name || 'U')}&background=1034A6&color=fff`,
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
      }

      // If 'to' user param was passed and not in convMap yet, fetch their profile to create a new thread
      if (toUserId && toUserId !== user.id && !convMap.has(toUserId)) {
        try {
          const targetProfile = await getUserProfile(toUserId);
          convMap.set(toUserId, {
            id: toUserId,
            contactName: targetProfile?.full_name || 'Property Owner',
            phone: targetProfile?.phone || '',
            role: targetProfile?.account_type === 'agent' ? 'Verified Agent' : 'Property Owner',
            avatar: targetProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetProfile?.full_name || 'Owner')}&background=1034A6&color=fff`,
            online: true,
            unreadCount: 0,
            messages: []
          });
        } catch (err) {
          console.warn('Could not fetch target profile:', err);
        }
      }

      const convList = Array.from(convMap.values());
      setConversations(convList);

      if (toUserId && convMap.has(toUserId)) {
        setActiveChatId(toUserId);
        setIsMobileListVisible(false);
      } else if (convList.length > 0 && !activeChatId) {
        setActiveChatId(convList[0].id);
      }

      setLoading(false);
    }
    
    loadChatData();
  }, [toUserId, propertyId, router, supabase]);

  // 2. Real-time Subscription to new messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('realtime-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload: any) => {
          const newMsg = payload.new;
          if (!newMsg) return;

          // Check if this message involves current user
          if (newMsg.receiver_id === currentUser.id || newMsg.sender_id === currentUser.id) {
            const otherUserId = newMsg.sender_id === currentUser.id ? newMsg.receiver_id : newMsg.sender_id;
            const timeString = new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            setConversations((prevConvs) => {
              const existingIdx = prevConvs.findIndex(c => c.id === otherUserId);

              const formattedMessage = {
                id: newMsg.id,
                senderId: newMsg.sender_id,
                text: newMsg.content || '',
                timestamp: timeString,
                isRead: newMsg.is_read || false,
              };

              if (existingIdx !== -1) {
                const updatedConv = { ...prevConvs[existingIdx] };
                // avoid duplicate if added optimistically
                if (!updatedConv.messages.some((m: any) => m.id === newMsg.id || (m.id.startsWith('temp-') && m.text === newMsg.content))) {
                  updatedConv.messages = [...updatedConv.messages, formattedMessage];
                  if (newMsg.receiver_id === currentUser.id && activeChatId !== otherUserId) {
                    updatedConv.unreadCount = (updatedConv.unreadCount || 0) + 1;
                  }
                }
                const remaining = prevConvs.filter(c => c.id !== otherUserId);
                return [updatedConv, ...remaining];
              } else {
                // New incoming conversation thread
                getUserProfile(otherUserId).then(profile => {
                  if (profile) {
                    setConversations(current => [
                      {
                        id: otherUserId,
                        contactName: profile.full_name || 'User',
                        phone: profile.phone || '',
                        role: 'Contact',
                        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=1034A6&color=fff`,
                        online: true,
                        unreadCount: 1,
                        messages: [formattedMessage]
                      },
                      ...current
                    ]);
                  }
                });
                return prevConvs;
              }
            });

            // If chat is actively open, mark as read
            if (activeChatId === otherUserId && newMsg.receiver_id === currentUser.id) {
              markMessagesAsRead(otherUserId, currentUser.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, activeChatId, supabase]);

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

    const textToSend = inputText.trim();
    setInputText('');

    const tempId = `temp-${Date.now()}`;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimisticMessage = {
      id: tempId,
      senderId: currentUser.id,
      text: textToSend,
      timestamp: timeString,
      isRead: false
    };

    // Optimistically update conversation
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === activeChatId);
      if (idx === -1) return prev;
      const target = { ...prev[idx] };
      target.messages = [...target.messages, optimisticMessage];
      const others = prev.filter(c => c.id !== activeChatId);
      return [target, ...others];
    });

    try {
      await sendMessage({
        senderId: currentUser.id,
        receiverId: activeChatId,
        content: textToSend,
        propertyId: propertyId || undefined,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    setIsMobileListVisible(false);
    
    // Mark as read locally and in database
    setConversations(prev => prev.map(conv => {
      if (conv.id === id) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));

    if (currentUser) {
      markMessagesAsRead(id, currentUser.id);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-xs text-slate-500 font-medium">Opening secure message portal...</p>
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
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Messages</h1>
            <p className="text-[11px] text-slate-400">Direct Inquiries & In-App Chat</p>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Online" />
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 rounded-2xl py-2 pl-9 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No active conversations</p>
              <p className="text-[11px] text-slate-400 mt-1">Browse properties and click &ldquo;Message Owner&rdquo; to start an inquiry.</p>
              <Link
                href="/properties"
                className="inline-block mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const lastMessage = chat.messages[chat.messages.length - 1];
              const isActive = chat.id === activeChatId;
              
              return (
                <div 
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`
                    p-3.5 cursor-pointer flex items-center gap-3 transition-colors
                    ${isActive ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-slate-50 bg-white'}
                  `}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={chat.avatar} 
                      alt={chat.contactName} 
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-xs text-slate-900 truncate pr-2">{chat.contactName}</h3>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{lastMessage?.timestamp || 'New'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate pr-2 ${chat.unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                        {lastMessage 
                          ? `${lastMessage.senderId === currentUser?.id ? 'You: ' : ''}${lastMessage.text}`
                          : 'New inquiry thread started'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Active Chat */}
      <div className={`
        ${!isMobileListVisible ? 'flex' : 'hidden'} 
        md:flex flex-col flex-1 bg-slate-50/50
      `}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 md:px-6 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-full"
                  onClick={() => setIsMobileListVisible(true)}
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative">
                  <img 
                    src={activeChat.avatar} 
                    alt={activeChat.contactName} 
                    className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200"
                  />
                  {activeChat.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900">{activeChat.contactName}</h2>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>{activeChat.role}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-emerald-600 font-semibold">Active Now</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {activeChat.phone ? (
                  <a 
                    href={`tel:${activeChat.phone}`}
                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Call Owner"
                  >
                    <Phone size={16} />
                    <span className="hidden sm:inline">{activeChat.phone}</span>
                  </a>
                ) : (
                  <a 
                    href="tel:+263772000111"
                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                    title="Call Contact"
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Context Header: If Chatting about a specific Property */}
            {inquiryProperty && (
              <div className="bg-primary/5 border-b border-primary/10 px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 bg-primary/10 rounded-lg text-primary">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500">Inquiring about: </span>
                    <strong className="text-slate-900 font-bold">{inquiryProperty.title}</strong>
                    <span className="text-primary font-bold ml-1.5">${inquiryProperty.price}/mo</span>
                  </div>
                </div>
                <Link
                  href={`/properties/${inquiryProperty.id}`}
                  target="_blank"
                  className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                >
                  View Listing <ExternalLink size={12} />
                </Link>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              <div className="text-center">
                <span className="bg-white border border-slate-200 text-slate-400 text-[10px] font-semibold px-3 py-1 rounded-full shadow-xs">
                  End-to-end verified real estate communication
                </span>
              </div>
              
              <AnimatePresence initial={false}>
                {activeChat.messages.map((msg: any) => {
                  const isMe = msg.senderId === currentUser?.id;

                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img 
                          src={activeChat.avatar} 
                          alt="" 
                          className="w-7 h-7 rounded-full shadow-xs bg-slate-100 self-end border border-slate-200" 
                        />
                      )}
                      
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div className={`
                          px-4 py-2.5 rounded-2xl shadow-xs text-sm leading-relaxed
                          ${isMe 
                            ? 'bg-primary text-white rounded-br-xs' 
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'}
                        `}>
                          <p>{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                          {isMe && (
                            <span className="text-primary">
                              {msg.isRead ? <CheckCheck size={12} /> : <Check size={12} className="text-slate-400" />}
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

            {/* Message Input Area */}
            <div className="p-3.5 bg-white border-t border-slate-200 z-10">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all"
              >
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a message or inquiry..."
                  className="flex-1 max-h-32 min-h-[38px] bg-transparent resize-none outline-none text-slate-800 py-2 px-2 text-sm placeholder-slate-400"
                  rows={1}
                />
                
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-xl shrink-0 transition-all ${
                    inputText.trim() 
                      ? 'bg-primary text-white shadow-md hover:bg-primary-dark hover:scale-105' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
              <Send size={28} className="text-primary ml-1" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">Your Inbox</h3>
            <p className="text-center text-xs max-w-sm text-slate-400">
              Select an owner or tenant conversation on the left, or contact a property owner from any listing page.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
