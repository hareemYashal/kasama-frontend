import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Trip } from "@/api/entities";
import { ChatMessage } from "@/api/entities";
import { TripActivity } from "@/api/entities";
import { Loader2, MessageCircle, ArrowLeft, WifiOff } from "lucide-react";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import { Button } from "../components/ui/button";
import { getAuthToken } from "@/api/functions";

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [usePolling, setUsePolling] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (!currentUser.current_trip_id) {
          navigate(createPageUrl("Home"));
          return;
        }

        const currentTrip = await Trip.get(currentUser.current_trip_id);
        setTrip(currentTrip);
        
        await fetchMessages(currentTrip.id);
        
        // Start with polling mode to ensure chat works
        console.log("Starting chat in polling mode for better reliability");
        setUsePolling(true);
        setupPolling(currentTrip.id);

      } catch (error) {
        console.error("Error initializing chat:", error);
        navigate(createPageUrl("Home"));
      }
      setLoading(false);
    };

    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [navigate]);

  const fetchMessages = async (tripId) => {
    try {
      const tripMessages = await ChatMessage.filter({ trip_id: tripId }, "created_date");
      setMessages(tripMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const setupPolling = (tripId) => {
    console.log("Setting up polling mode for chat");
    setConnectionError("Chat is in auto-refresh mode - messages will update automatically");
    setIsConnected(false);
    
    // Poll every 3 seconds for better responsiveness
    pollIntervalRef.current = setInterval(async () => {
      try {
        await fetchMessages(tripId);
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    }, 3000);
  };

  const handleSendMessage = async (messageText) => {
    if (!user || !trip || !messageText.trim()) {
      return;
    }

    try {
      // Always save message directly to database in polling mode
      const newMessage = await ChatMessage.create({
        trip_id: trip.id,
        user_id: user.id,
        user_full_name: user.full_name,
        user_profile_photo_url: user.profile_photo_url,
        message_text: messageText.trim(),
      });

      // Log activity
      const firstName = user.full_name.split(' ')[0];
      await TripActivity.create({
        trip_id: trip.id,
        user_id: user.id,
        user_first_name: firstName,
        action_type: 'SENT_CHAT_MESSAGE',
        description: `${firstName} sent a message in the group chat.`
      });

      // Refresh messages immediately
      await fetchMessages(trip.id);
    } catch (error) {
      console.error("Error sending message:", error);
      setConnectionError("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-[calc(100vh-theme(space.16))] md:max-h-screen">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-white/80"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Group Chat</h1>
            <p className="text-sm text-slate-500">{trip?.occasion}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <WifiOff className="w-4 h-4" />
          Auto-refresh
        </div>
      </header>

      {connectionError && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700 text-sm">
          {connectionError}
        </div>
      )}
      
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <MessageCircle className="w-20 h-20 text-slate-300 mb-6" />
          <h2 className="text-2xl font-semibold text-slate-700">Welcome to the Chat!</h2>
          <p className="text-slate-500 mt-2 max-w-sm">
            Be the first to send a message. This is where you can coordinate with your group, share ideas, and get excited for the trip.
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <MessageList messages={messages} currentUserId={user.id} />
      )}
      
      <MessageInput onSendMessage={handleSendMessage} isSending={false} />
    </div>
  );
}