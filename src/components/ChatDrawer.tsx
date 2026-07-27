'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, CheckCircle2, MessageSquare, Heart, Sparkles } from 'lucide-react';
import { ChatMessage, RadarPerson } from '@/types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeChatPerson: RadarPerson | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSelectPerson: (person: RadarPerson) => void;
  peopleList: RadarPerson[];
  myProfileId?: string | null;
}

export default function ChatDrawer({
  isOpen,
  onClose,
  activeChatPerson,
  messages,
  onSendMessage,
  onSelectPerson,
  peopleList,
  myProfileId,
}: ChatDrawerProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, activeChatPerson]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    
    // Keep keyboard open for rapid firing
    inputRef.current?.focus();
    
    setTimeout(scrollToBottom, 50); // Ensure scroll happens after DOM update
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-screen max-w-md bg-[#0b141a] border-l border-[#222d34] shadow-2xl flex flex-col h-full text-[#e9edef]"
          >
            {/* Drawer Header (WhatsApp Style Top Bar) */}
            <div className="p-3.5 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-full bg-[#00a884]/20 text-[#00a884]">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">Direct Messages</h3>
                  <p className="text-xs text-[#8696a0]">
                    {activeChatPerson
                      ? `End-to-End Encrypted · ${activeChatPerson.name}`
                      : 'WhatsApp-Style Instant Messaging'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#374248] text-[#aebac1] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* If a specific person is selected to chat */}
            {activeChatPerson ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0b141a] relative">
                {/* Person Mini Banner (WhatsApp Profile Bar) */}
                <div className="p-3 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between shadow-md z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={activeChatPerson.avatar}
                        alt={activeChatPerson.name}
                        className="h-10 w-10 rounded-full object-cover border border-[#2a3942]"
                      />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#00a884] ring-2 ring-[#202c33]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-white">
                          {activeChatPerson.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#005c4b] text-[#e9edef] font-semibold">
                          📍 {activeChatPerson.distanceMeter < 1000 ? `${activeChatPerson.distanceMeter}m` : `${(activeChatPerson.distanceMeter/1000).toFixed(1)}km`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8696a0] truncate max-w-[200px]">
                        🟢 online · {activeChatPerson.hub}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectPerson(null as any)}
                    className="text-xs text-[#00a884] hover:underline font-bold px-2 py-1"
                  >
                    ← All Chats
                  </button>
                </div>

                {/* Messages Body (WhatsApp Chat Background with Indian Telegram Campus Doodle Pattern on Mobile & Desktop) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 telegram-chat-pattern">
                  <div className="text-center py-1.5 px-3 text-[10.5px] font-medium text-[#8696a0] bg-[#182229]/90 backdrop-blur-sm rounded-lg border border-[#222d34] mx-auto max-w-xs shadow-sm">
                    🔒 Messages are peer-to-peer instant across your active campus radius.
                  </div>

                  {messages
                    .filter((msg) => 
                      ((msg.senderId === activeChatPerson.id || msg.senderName === activeChatPerson.name) && (msg.receiverId === 'me' || (myProfileId && msg.receiverId === myProfileId) || msg.receiverId === 'general')) ||
                      ((msg.senderId === 'me' || (myProfileId && msg.senderId === myProfileId)) && (msg.receiverId === activeChatPerson.id || msg.receiverId === 'me')) ||
                      (msg.receiverId === 'general' && (msg.senderId === activeChatPerson.id || msg.senderName === activeChatPerson.name || msg.senderId === 'me' || (myProfileId && msg.senderId === myProfileId)))
                    )
                    .map((msg) => {
                      const isMe = (myProfileId && msg.senderId === myProfileId) || (msg.senderId === 'me' && msg.senderName !== activeChatPerson.name);
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                        >
                          {/* WhatsApp Style Message Bubble */}
                          <div
                            className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm relative ${
                              isMe
                                ? 'bg-[#005c4b] text-white rounded-tr-none border border-[#006d59]'
                                : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#2a3942]'
                            }`}
                          >
                            {!isMe && (
                              <p className="text-[11px] font-bold text-[#00a884] mb-0.5 tracking-tight truncate">
                                {msg.senderName || activeChatPerson.name}
                              </p>
                            )}
                            <p className="break-words">{msg.text}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-[#8696a0] sm:text-emerald-200/90' : 'text-[#8696a0]'}`}>
                              <span>{msg.timestamp}</span>
                              {isMe && (
                                <span className={`font-bold tracking-tighter ml-0.5 ${msg.isRead ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} title={msg.isRead ? "Read" : "Delivered"}>✓✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  {/* Invisible element to anchor the auto-scroll */}
                  <div ref={messagesEndRef} />
                </div>

                {/* WhatsApp Style Chat Input */}
                <form
                  onSubmit={handleSend}
                  className="p-2.5 pb-5 sm:pb-2.5 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#2a3942] border-none rounded-full px-4 py-2 text-sm text-white placeholder:text-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#029071] text-white font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              /* People List inbox when no specific chat is open */
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400 px-1 pb-1 flex items-center justify-between">
                  <span>Nearby People on Radar</span>
                  <span className="text-[11px] font-normal text-cyan-400">Live 0m–1km</span>
                </p>

                {peopleList.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => onSelectPerson(person)}
                    className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="h-12 w-12 rounded-full object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors"
                        />
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${
                            person.status === 'Online' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">
                            {person.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-semibold border border-slate-700">
                            {person.distanceMeter}m
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {person.bio}
                        </p>
                      </div>
                    </div>
                    <span className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-cyan-400 transition-colors">
                      <Send className="h-4 w-4" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
