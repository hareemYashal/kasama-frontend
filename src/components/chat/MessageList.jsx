import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';

export default function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = format(new Date(message.created_date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
      {Object.entries(messageGroups).map(([date, dayMessages]) => (
        <div key={date}>
          <div className="flex justify-center mb-4">
            <span className="bg-white px-3 py-1 rounded-full text-xs text-slate-500 border border-slate-200">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          
          {dayMessages.map((message) => {
            const isOwnMessage = message.user_id === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center shrink-0 overflow-hidden">
                  {message.user_profile_photo_url ? (
                    <img 
                      src={message.user_profile_photo_url} 
                      alt={message.user_full_name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-600 font-semibold text-xs">
                      {message.user_full_name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-white text-slate-800 rounded-bl-md border border-slate-200'
                  }`}>
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold text-slate-600 mb-1">
                        {message.user_full_name}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed break-words">
                      {message.message_text}
                    </p>
                  </div>
                  <p className={`text-xs text-slate-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {formatMessageTime(message.created_date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}