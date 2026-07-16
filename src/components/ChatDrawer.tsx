'use client';

import React, { useState } from 'react';
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
}

export default function ChatDrawer({
  isOpen,
  onClose,
  activeChatPerson,
  messages,
  onSendMessage,
  onSelectPerson,
  peopleList,
}: ChatDrawerProps) {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col h-full text-slate-100"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">Direct Messages</h3>
                  <p className="text-xs text-slate-400">
                    {activeChatPerson
                      ? `Chatting with ${activeChatPerson.name}`
                      : 'Select a student on Radar to chat'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* If a specific person is selected to chat */}
            {activeChatPerson ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/50">
                {/* Person Mini Banner */}
                <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeChatPerson.avatar}
                      alt={activeChatPerson.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-cyan-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-sm text-white">
                          {activeChatPerson.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                          {activeChatPerson.distanceMeter}m away
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {activeChatPerson.bio}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectPerson(null as any)}
                    className="text-xs text-cyan-400 hover:underline font-medium px-2 py-1"
                  >
                    All Chats
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-center py-2 text-[11px] text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/60 mx-4">
                    ⚡ Supabase Realtime active. Messages are peer-to-peer instant.
                  </div>

                  {messages.map((msg) => {
                    const isMe = msg.senderId === 'me';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                              : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSend}
                  className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activeChatPerson.name}...`}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              /* People List inbox when no specific chat is open */
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-slate-400 px-1 pb-1 flex items-center justify-between">
                  <span>Nearby Students on Radar</span>
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
