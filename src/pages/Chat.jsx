"use client";

import {useState, useRef, useEffect} from "react";
import {
  Megaphone,
  X,
  Send,
  Paperclip,
  ImageIcon,
  CarIcon as ChartColumn,
  Plus,
  Check,
  FileText,
} from "lucide-react";
import {useSelector} from "react-redux";
import {io} from "socket.io-client";
import {formatTime} from "../utils/utils";
import {groupMessagesByDate, bufferToUrl, fileToBuffer} from "../utils/utils";
import ChatHeader from "./ChatHeader";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pollOptions, setPollOptions] = useState([]);
  const fileInputRef = useRef();
  const generalFileInputRef = useRef();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const tripId = useSelector((s) => s.trips.activeTripId);
  const token = useSelector((s) => s.user.token);
  const authUser = useSelector((s) => s.user.user);
  const authUerId = authUser?.id;
  const BASE_URL = import.meta.env.VITE_API_URL;

  const socketRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const scrollHeight = messagesContainerRef.current.scrollHeight;
      const height = messagesContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;

      messagesContainerRef.current.scrollTop =
        maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket connection
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
      s.emit("getMessages", {tripId});
    });

    s.on("messages", (msgs) => {
      const processedMessages = msgs.map((msg) => {
        if (msg.file && msg.file.buffer) {
          // Convert buffer data to proper file structure
          return {
            ...msg,
            file: {
              name: msg.file.name || "Unknown File",
              type: msg.file.type || "application/octet-stream",
              size: msg.file.size || 0,
              buffer: msg.file.buffer,
              url: msg.file.buffer
                ? bufferToUrl(msg.file, msg.file.type)
                : null,
            },
          };
        }
        return msg;
      });
      setMessages(processedMessages);
    });

    s.on("newMessage", (msg) => {
      let processedMessage = msg;
      if (msg.file && msg.file.buffer) {
        processedMessage = {
          ...msg,
          file: {
            name: msg.file.name || "Unknown File",
            type: msg.file.type || "application/octet-stream",
            size: msg.file.size || 0,
            buffer: msg.file.buffer,
            url: bufferToUrl(msg.file, msg.file.type),
          },
        };
      }
      setMessages((prev) => [...prev, processedMessage]);
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

  const handleSendMessage = async () => {
    if (
      !input &&
      !selectedImage &&
      !selectedFile &&
      !(mode === "poll" && pollOptions.length)
    )
      return;

    let fileBuffer = null;
    let imageBuffer = null;

    // Convert selected file to buffer if exists
    if (selectedFile) {
      fileBuffer = await fileToBuffer(selectedFile);
    }

    // Convert selected image to buffer if exists
    if (selectedImage) {
      imageBuffer = await fileToBuffer(selectedImage);
    }

    const newMessage = {
      type: mode || "text",
      content: input,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      file: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            url: URL.createObjectURL(selectedFile),
          }
        : null,
      poll: mode === "poll" ? pollOptions : null,
      timestamp: new Date().toISOString(),
      senderId: authUerId,
      sender: {name: authUser?.name || "You"},
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendMessage", {
        tripId,
        senderId: authUerId,
        content: input,
        type: mode || "text",
        timestamp: new Date().toISOString(),
        file: fileBuffer || imageBuffer || null,
      });
    } else {
      console.warn("Socket not connected yet");
    }

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSelectedImage(null);
    setSelectedFile(null);
    setMode("");
    setPollOptions([]);
  };

  const handleImageUpload = (e) => {
    if (e.target.files[0]) setSelectedImage(e.target.files[0]);
  };

  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      // Check if it's an image, if so use image handler
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, {label: "", votes: 0}]);
  };

  const handlePollChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index].label = value;
    setPollOptions(newOptions);
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <main className="flex flex-col h-screen">
      {/* Header */}
      <ChatHeader />

      {/* Messages Container with ref */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-auto p-4 space-y-4"
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex justify-center my-4">
              <div className="bmy-4 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((msg, idx) => (
              <div key={idx} className="w-full max-w-full mb-3">
                {msg.type === "announcement" && (
                  <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-yellow-100 border-l-4 border-amber-500 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                        <Megaphone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-amber-800">
                          📢 Announcement
                        </p>
                        <p className="text-xs text-amber-600">
                          from {msg?.sender?.name}
                        </p>
                      </div>
                    </div>
                    {msg.file && (
                      <img
                        src={msg.file || "/placeholder.svg"}
                        className="w-full h-auto rounded-lg mb-2"
                        alt="Announcement"
                      />
                    )}
                    {/* {msg.file && renderFileAttachment(msg.file)} */}
                    {msg.content && (
                      <p className="text-slate-800 font-semibold text-base">
                        {msg.content}
                      </p>
                    )}

                    <p className="text-xs text-amber-500 mt-2 text-right">
                      {formatTime(msg.timestamp)}
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
                              {msg?.poll?.reduce((a, b) => a + b.votes, 0)} vote
                              <span className="ml-2">
                                • Click any option to change your vote
                              </span>
                            </p>
                          </div>

                          <div className="p-6 pt-0 space-y-2">
                            {msg?.poll?.map((opt, i) => {
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
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                )}

                {msg.type === "text" && (
                  <div
                    className={`flex ${
                      msg.senderId === authUerId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 ${
                        msg.senderId === authUerId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {/* Show profile picture only for others' messages (left side) */}
                      {msg.senderId !== authUerId && (
                        <img
                          src={
                            msg?.sender?.profilePic ||
                            "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={msg?.sender?.name || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col items-start">
                        <div
                          className={`px-4 py-2 rounded-2xl max-w-xs break-words ${"bg-blue-500 text-white rounded-br-md"}`}
                        >
                          {/* Sender name (only for others' messages) */}
                          {msg.senderId !== authUerId && (
                            <p className="text-xs font-medium mb-1">
                              {msg?.sender?.name || "Unknown"}
                            </p>
                          )}

                          {/* Text content */}
                          {msg.content && (
                            <p className="text-sm">{msg.content}</p>
                          )}

                          {msg.image && (
                            <img
                              src={msg.image || "/placeholder.svg"}
                              className="mt-2 rounded-lg max-w-full h-auto"
                              alt="Message attachment"
                            />
                          )}

                          {/* {msg.file && renderFileAttachment(msg.file)} */}
                        </div>
                        <p className="text-xs text-slate-400 px-1 flex-shrink-0 mt-1">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>

                      {/* Show profile picture for current user messages (right side) */}
                      {msg.senderId === authUerId && (
                        <img
                          src={
                            msg?.sender?.Profile ||
                            "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt="Me"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Empty div to mark the end of messages for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 p-2 md:p-4 space-y-3 w-full">
        <div className="bg-white border-t border-slate-200 p-2 md:p-4 space-y-3 w-full">
          {/* Announcement Mode */}
          {mode === "announcement" && (
            <div className="bg-amber-100 text-amber-800 border border-amber-200 rounded-md p-2 flex items-center gap-2 w-full max-w-full overflow-hidden">
              <Megaphone className="w-3 h-3 flex-shrink-0" />
              <span className="text-sm flex-1 min-w-0 truncate">
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

          {(selectedImage || selectedFile) && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  {selectedImage ? "Image Preview" : "File Selected"}
                </span>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedFile(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {selectedImage && (
                <img
                  src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full h-32 object-cover rounded-lg"
                />
              )}
              {selectedFile && (
                <div className="flex items-center gap-3 p-2 bg-white rounded border">
                  <FileText className="w-6 h-6 text-slate-600" />
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Poll Mode */}
          {/* {mode === "poll" && (
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

                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder={`Option ${i + 1}`}
                      value={opt.label}
                      onChange={(e) => handlePollChange(i, e.target.value)}
                    />
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
          )} */}

          {/* Default Input */}
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
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!input && !selectedImage && !selectedFile}
                  className={`inline-flex items-center justify-center gap-2 text-sm font-medium rounded-full w-10 h-10 md:w-12 md:h-12 flex-shrink-0 shadow-lg transition-all
                    ${
                      mode === "announcement"
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }
                    ${
                      !input && !selectedImage && !selectedFile
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

          {/* Bottom icons */}
          {mode !== "poll" && (
            <div className="flex justify-start items-center mt-2 w-full overflow-hidden">
              <div className="flex items-center gap-1 flex-wrap">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={generalFileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => generalFileInputRef.current.click()}
                  className="inline-flex items-center justify-center gap-2 h-8 w-8 md:w-10 md:h-10 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="inline-flex items-center justify-center gap-2 h-8 w-8 md:w-10 md:h-10 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button> */}
                {(authUser?.trip_role === "creator" ||
                  authUser?.trip_role === "co-admin") && (
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
                )}
                {/* <button
                  type="button"
                  onClick={() => {
                    setMode("poll");
                    if (pollOptions.length === 0) {
                      setPollOptions([{label: ""}, {label: ""}]);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 h-8 w-8 md:w-10 md:h-10 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <ChartColumn className="w-4 h-4 md:w-5 md:h-5" />
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Chat;
