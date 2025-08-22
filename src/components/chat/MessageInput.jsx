import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, WifiOff } from 'lucide-react';

export default function MessageInput({ onSendMessage, isSending }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/60 p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <Input
          type="text"
          placeholder={isSending ? "Connecting to chat..." : "Type your message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          disabled={isSending}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || isSending}
          className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 flex-shrink-0"
        >
          {isSending ? (
            <WifiOff className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
}