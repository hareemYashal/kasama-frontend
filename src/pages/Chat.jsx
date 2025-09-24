import React, {useState, useRef, useEffect} from "react";
import {
  ArrowLeft,
  MessageCircle,
  WifiOff,
  Megaphone,
  X,
  Send,
  Paperclip,
  Image,
  ChartColumn,
  Plus,
} from "lucide-react";
import {useSelector} from "react-redux";
import {io} from "socket.io-client";
import {useMutation, useQuery} from "@tanstack/react-query";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const fileInputRef = useRef();

  const tripId = useSelector((s) => s.trips.activeTripId);
  const token = useSelector((s) => s.user.token);
  const authUser = useSelector((s) => s.user.user);
  const authUerId = authUser?.id;
  const BASE_URL = import.meta.env.VITE_API_URL;
  const {data: activeTripData, isLoading: isLoadingTrip} = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  const activeTrip = activeTripData?.data?.activeTrip;
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const socketRef = useRef(null);
  useEffect(() => {
    if (!tripId || !token) return;

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("joinTripChat", {tripId, userId: authUerId});
      socketRef.current.emit("getMessages", {tripId});
      return;
    }

    const s = io(BASE_URL, {auth: {token}});
    socketRef.current = s;

    s.on("connect", () => {
      s.emit("joinTripChat", {tripId, userId: authUerId});
      s.emit("getMessages", {tripId}); // fetch history
    });

    s.on("messages", (msgs) => {
      setMessages(msgs);
    });

    s.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on("disconnect", (reason) => {
      console.log("socket disconnect:", reason);
    });

    return () => {
      s.off("messages");
      s.off("newMessage");
      s.disconnect();
      socketRef.current = null;
    };
  }, [tripId, token, authUerId, BASE_URL]);

  const handleSendMessage = () => {
    if (!input && !selectedImage && !(mode === "poll" && pollOptions.length))
      return;

    const newMessage = {
      type: mode || "text",
      content: input,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      poll: mode === "poll" ? pollOptions : null,
      timestamp: new Date().toLocaleTimeString(),
      senderId: authUerId,
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendMessage", {
        tripId,
        senderId: authUerId,
        content: input,
        type: mode || "text",
        // fileUrl, fileName etc. can be passed too
      });
    } else {
      console.warn("Socket not connected yet");
    }

    // Optimistic UI update
    setMessages((prev) => [...prev, newMessage]);

    setInput("");
    setSelectedImage(null);
    setMode("");
    setPollOptions([]);
  };

  const handleImageUpload = (e) => {
    if (e.target.files[0]) setSelectedImage(e.target.files[0]);
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, {label: "", votes: 0}]);
  };

  const handlePollChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index].label = value;
    setPollOptions(newOptions);
  };

  return (
    <main className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-3 md:p-6 flex items-center justify-between gap-2 md:gap-4 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <button className="inline-flex items-center justify-center gap-2 border h-9 rounded-md bg-white/80 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm flex-shrink-0">
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>

          <MessageCircle className="w-4 h-4 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />

          <div className="min-w-0 flex-1">
            <h1 className="text-sm md:text-xl font-bold text-slate-800 truncate">
              Group Chat
            </h1>
            <p className="text-xs md:text-sm text-slate-500 truncate">
              {/* Russell&apos;s Launch Party
               */}
              {activeTrip?.welcome_message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm flex-shrink-0">
          <div className="flex items-center gap-1 text-blue-600">
            <WifiOff className="w-3 h-3 md:w-4 md:h-4" />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="w-full max-w-full">
            {msg.type === "announcement" && (
              <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-yellow-100 border-l-4 border-amber-500 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-800">📢 Announcement</p>
                    <p className="text-xs text-amber-600">
                      from {msg?.sender?.name}
                    </p>
                  </div>
                </div>
                {msg.image && (
                  <img
                    src={msg.image}
                    className="w-full h-auto rounded-lg mb-2"
                  />
                )}
                {msg.content && (
                  <p className="text-slate-800 font-semibold text-base">
                    {msg.content}
                  </p>
                )}
                <p className="text-xs text-amber-500 mt-2 text-right">
                  {formatDate(msg.timestamp)}
                </p>
              </div>
            )}

            {msg.type === "poll" && (
              <div className="max-w-[80%] md:max-w-xs lg:max-w-md items-end flex flex-col min-w-0 ml-auto">
                <div className="rounded-2xl px-3 py-2 relative group/message shadow-sm w-full bg-blue-500 text-white rounded-br-md">
                  <p className="text-sm leading-relaxed break-words">
                    {msg.content}
                  </p>
                  <div className="max-w-full overflow-hidden" />
                  <div className="max-w-full">
                    <div className="rounded-lg border text-card-foreground shadow-sm mt-3 border-blue-200 bg-blue-50/50">
                      <div className="flex flex-col space-y-1.5 p-6 pb-3">
                        <h3 className="font-semibold tracking-tight flex items-center gap-2 text-base">
                          <ChartColumn className="w-4 h-4 text-blue-600" />
                          {msg.content}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {msg.poll.reduce((a, b) => a + b.votes, 0)} vote
                          <span className="ml-2">
                            • Click any option to change your vote
                          </span>
                        </p>
                      </div>

                      <div className="p-6 pt-0 space-y-2">
                        {msg.poll.map((opt, i) => {
                          const totalVotes = msg.poll.reduce(
                            (a, b) => a + b.votes,
                            0
                          );
                          const percent = totalVotes
                            ? (opt.votes / totalVotes) * 100
                            : 0;

                          return (
                            <div key={i} className="space-y-1">
                              <button
                                className={`inline-flex items-center justify-between text-left w-full p-3 h-auto transition-all rounded-md border
                    ${
                      opt.votes > 0
                        ? "border-blue-500 bg-blue-100 hover:bg-blue-200"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                              >
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                      {opt.label}
                                      {opt.votes > 0 && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                      )}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {opt.votes} ({Math.round(percent)}%)
                                    </span>
                                  </div>
                                  <div
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    className="relative w-full overflow-hidden rounded-full bg-secondary h-2"
                                  >
                                    <div
                                      className="h-full w-full flex-1 bg-primary transition-all"
                                      style={{
                                        transform: `translateX(${
                                          100 - percent
                                        }%)`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full mt-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 mt-1">
                      <button className="inline-flex items-center justify-center h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 px-1 flex-shrink-0">
                    {formatDate(msg.timestamp)}
                  </p>
                </div>
              </div>
            )}

            {msg.type === "text" && (
              <div
                className={`flex ${
                  msg.senderId === authUerId ? "justify-end" : "justify-start"
                }`}
              >
                <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-xs break-words">
                  {/* Sender name (only show if it's not me, or show anyway if you want both) */}
                  {msg.senderId !== authUerId && (
                    <p className="text-xs  mb-1">
                      {msg?.sender?.name || "Unknown"}
                    </p>
                  )}
                  {msg.content && <p>{msg.content}</p>}
                  {msg.image && (
                    <img
                      src={msg.image}
                      className="mt-2 rounded-lg max-w-full h-auto"
                    />
                  )}
                  <p className="text-xs text-right mt-1">
                    {formatDate(msg.timestamp)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      {/* Input / Announcement / Poll */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 p-2 md:p-4 space-y-3 w-full">
        <div className="bg-white border-t border-slate-200 p-2 md:p-4 space-y-3 w-full">
          {/* Announcement Mode */}
          {mode === "announcement" && (
            <div className="bg-amber-100 text-amber-800 border border-amber-200 rounded-md p-2 flex items-center gap-2 w-full max-w-full overflow-hidden">
              <Megaphone className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs flex-1 min-w-0 truncate">
                Announcement Mode
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-5 w-5 flex-shrink-0"
                onClick={() => setMode("")}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Poll Mode */}
          {mode === "poll" && (
            <div className="bg-white border rounded-lg shadow-sm w-full max-w-md mx-auto p-4">
              <div className="flex flex-col space-y-2">
                <h3 className="font-semibold tracking-tight flex items-center gap-2 text-lg">
                  <ChartColumn className="w-5 h-5 text-blue-600" />
                  Create Poll
                </h3>

                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="What would you like to ask?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />

                {/* Poll Options: always show 2 by default, no cross button for first 2 */}
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder={`Option ${i + 1}`}
                      value={opt.label}
                      onChange={(e) => handlePollChange(i, e.target.value)}
                    />
                    {/* Show cross button only for options after the first 2 */}
                    {i >= 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = [...pollOptions];
                          newOptions.splice(i, 1);
                          setPollOptions(newOptions);
                        }}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                      >
                        <X />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddPollOption}
                  disabled={pollOptions.length >= 6}
                  className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </button>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("");
                      setPollOptions([]);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!input || pollOptions.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Poll
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Default Input (only if not in Poll mode) */}
          {mode !== "poll" && (
            <form className="w-full">
              <div className="flex items-end gap-2 md:gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <textarea
                    className={`flex border px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none w-full min-h-[40px] md:min-h-[48px] max-h-32 rounded-2xl transition-colors text-sm md:text-base
              ${
                mode === "announcement"
                  ? "bg-amber-50 border-amber-400 focus:border-amber-500 focus:ring-amber-500"
                  : "bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
                    placeholder={
                      mode === "announcement"
                        ? "Share an important announcement..."
                        : "Type a message..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); // Line break na ho
                        handleSendMessage();
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!input && !selectedImage}
                  className={`inline-flex items-center justify-center gap-2 text-sm font-medium rounded-full w-10 h-10 md:w-12 md:h-12 flex-shrink-0 shadow-lg transition-all
            ${
              mode === "announcement"
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }
            ${
              !input && !selectedImage
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100"
            }
          `}
                >
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </form>
          )}

          {/* Bottom icons (always visible) */}
          {mode !== "poll" && (
            <div className="flex justify-start items-center mt-2 w-full overflow-hidden">
              <div className="flex items-center gap-1 flex-wrap">
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="inline-flex items-center justify-center gap-2 h-10 w-10 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 h-8 w-8 md:w-10 md:h-10 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Image className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                {authUser?.trip_role === "creator" ||
                  (authUser?.trip_role === "co-admin" && (
                    <button
                      type="button"
                      onClick={() =>
                        setMode(mode === "announcement" ? "" : "announcement")
                      }
                      className={`inline-flex items-center justify-center gap-2 h-8 w-8 md:w-10 md:h-10 rounded-full transition-colors ${
                        mode === "announcement"
                          ? "bg-amber-100 text-amber-500"
                          : "bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <Megaphone className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => {
                    setMode("poll");
                    // Initialize with 2 empty options if none exist
                    if (pollOptions.length === 0) {
                      setPollOptions([{label: ""}, {label: ""}]);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 h-8 w-8 md:w-10 md:h-10 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <ChartColumn className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Chat;
