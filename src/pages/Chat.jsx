"use client";

import {useState, useRef, useEffect} from "react";
import {
  Megaphone,
  X,
  Send,
  Paperclip,
  ImageIcon,
  ChartColumn,
  Check,
  FileText,
  User,
  Plus,
} from "lucide-react";
import {useSelector} from "react-redux";
import {io} from "socket.io-client";
import {formatTime, normalizePoll} from "../utils/utils";
import {RenderAttachments} from "@/components/chat/ChatAttachments";
import WelcomeChat from "@/components/chat/WelcomeChat";
import {
  groupMessagesByDate,
  uploadToS3,
  availableReactions,
} from "../utils/utils";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatLoader from "@/components/chat/ChatLoader";
import ModalChatGIF from "@/components/chat/ModalChatGIF";
import {ChatAnnouncement} from "@/components/chat/ChatAnnouncement";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("");
  const [isOpen, setIsOpenGif] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pollOptions, setPollOptions] = useState([]);
  const [loadingState, setLoadingState] = useState(null);
  const [reactions, setReactions] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readStatus, setReadStatus] = useState({});
  const generalFileInputRef = useRef();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const tripId = useSelector((s) => s.trips.activeTripId);
  const token = useSelector((s) => s.user.token);
  const authUser = useSelector((s) => s.user.user);
  const authUerId = authUser?.id;
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  console.log(authUser, "k");
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

  // Mark messages as read when they come into view
  useEffect(() => {
    const markMessagesAsRead = () => {
      if (
        messages.length > 0 &&
        socketRef.current &&
        socketRef.current.connected
      ) {
        const unreadMessageIds = messages
          .filter((msg) => msg.senderId !== authUerId && !readStatus[msg.id])
          .map((msg) => msg.id);

        if (unreadMessageIds.length > 0) {
          socketRef.current.emit("markMessagesAsRead", {
            tripId,
            userId: authUerId,
            messageIds: unreadMessageIds,
          });

          // Update local read status
          const newReadStatus = {...readStatus};
          unreadMessageIds.forEach((id) => {
            newReadStatus[id] = true;
          });
          setReadStatus(newReadStatus);
        }
      }
    };

    // Mark messages as read when component mounts or messages change
    const timer = setTimeout(markMessagesAsRead, 1000); // Small delay to ensure messages are rendered

    return () => clearTimeout(timer);
  }, [messages, tripId, authUerId, readStatus]);

  const getFileUrl = async (fileKey) => {
    const endpoint = `${BASE_URL}/files/signed-url/${fileKey}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();

    if (json?.success && json?.data?.url) {
      const result = json.data.url;
      return result;
    }
    return null;
  };

  const handleAddReaction = (messageId, reactionType) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("addReaction", {
        messageId,
        userId: authUerId,
        type: reactionType,
      });
    }
    setShowReactionPicker(null);
  };

  const handleRemoveReaction = (messageId, reactionType) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("removeReaction", {
        messageId,
        userId: authUerId,
        type: reactionType,
      });
    }
  };

  const getUserReaction = (messageId) => {
    const messageReactions = reactions[messageId] || [];
    return messageReactions.find((r) => r.userId === authUerId);
  };

  const getReactionCounts = (messageId) => {
    const messageReactions = reactions[messageId] || [];
    const counts = {};
    messageReactions.forEach((reaction) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });
    return counts;
  };

  const normalizeMessage = (m) => {
    const msg = {...m};
    let rawPoll =
      msg.poll ??
      msg.pollOptions ??
      msg.options ??
      msg.choice ??
      msg.poll_data ??
      msg.data?.poll ??
      msg.data?.options ??
      msg.meta?.poll ??
      msg.meta?.options ??
      msg.metadata?.poll ??
      msg.metadata?.options ??
      null;

    // If still missing, try to parse JSON embedded in content
    if (!rawPoll && typeof msg.content === "string") {
      try {
        const parsed = JSON.parse(msg.content);
        rawPoll =
          parsed?.poll ??
          parsed?.pollOptions ??
          parsed?.options ??
          parsed?.choices ??
          null;
      } catch {
        // content isn't JSON - ignore
      }
    }

    const normalized = normalizePoll(rawPoll);
    if (normalized) msg.poll = normalized;
    return msg;
  };
  console.log(authUerId, "id");
  useEffect(() => {
    if (!tripId || !token) return;

    const processMessages = async (msgs) => {
      const processed = await Promise.all(
        msgs.map(async (orig) => {
          const msg = normalizeMessage(orig);

          if (msg.reactions && msg.reactions.length > 0) {
            setReactions((prev) => ({
              ...prev,
              [msg.id]: msg.reactions,
            }));
          }

          if (msg.attachments && msg.attachments.length > 0) {
            try {
              const attachmentUrls = await Promise.all(
                msg.attachments.map(async (attachment) => {
                  const fileUrl = await getFileUrl(attachment);
                  return fileUrl;
                })
              );
              const processedMsg = {
                ...msg,
                attachmentUrls: attachmentUrls.filter((url) => url !== null),
                files:
                  msg.files ||
                  msg.attachments.map((attachment, index) => ({
                    name: `attachment-${index + 1}`,
                    type: "application/octet-stream",
                    url: attachmentUrls[index],
                    key: attachment,
                  })),
              };
              return processedMsg;
            } catch (error) {
              console.error("[v0] Error getting attachment URLs:", error);
              return msg;
            }
          }

          return msg;
        })
      );
      console.log("[v0] Final processed messages:", processed);
      setMessages(processed);
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("joinTripChat", {tripId, userId: authUerId});
      socketRef.current.emit("getMessages", {tripId});
      socketRef.current.emit("getUnreadCount", {tripId, userId: authUerId});
      return;
    }

    const s = io(BASE_URL, {auth: {token}});
    socketRef.current = s;

    s.on("connect", () => {
      s.emit("joinTripChat", {tripId, userId: authUerId});
      s.emit("getMessages", {tripId});
      s.emit("getUnreadCount", {tripId, userId: authUerId});
    });

    s.on("messages", processMessages);
    s.on("newMessage", async (incoming) => {
      const msg = normalizeMessage(incoming);
      console.log("[v0] Received new message:", msg);
      if (msg.reactions && msg.reactions.length > 0) {
        setReactions((prev) => ({
          ...prev,
          [msg.id]: msg.reactions,
        }));
      } else {
        setReactions((prev) => ({
          ...prev,
          [msg.id]: [],
        }));
      }

      if (msg.attachments && msg.attachments.length > 0) {
        try {
          const attachmentUrls = await Promise.all(
            msg.attachments.map(async (attachment) => {
              const fileUrl = await getFileUrl(attachment);
              return fileUrl;
            })
          );
          const processedMsg = {
            ...msg,
            attachmentUrls: attachmentUrls.filter((url) => url !== null),
            files:
              msg.files ||
              msg.attachments.map((attachment, index) => ({
                name: `attachment-${index + 1}`,
                type: "application/octet-stream",
                url: attachmentUrls[index],
                key: attachment,
              })),
          };
          setMessages((prev) => [...prev, processedMsg]);
        } catch (error) {
          console.error(
            "[v0] Error processing new message attachments:",
            error
          );
          setMessages((prev) => [...prev, msg]);
        }
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    });

    s.on("messageDelivered", async (delivered) => {
      const serverMsg = normalizeMessage(delivered);
      console.log("[v0] Message delivered from server:", serverMsg);

      if (serverMsg.reactions && serverMsg.reactions.length > 0) {
        setReactions((prev) => ({
          ...prev,
          [serverMsg.id]: serverMsg.reactions,
        }));
      } else {
        setReactions((prev) => ({
          ...prev,
          [serverMsg.id]: [],
        }));
      }

      // Resolve signed URLs for attachments so images/files render immediately
      let processedDelivered = serverMsg;
      if (serverMsg.attachments && serverMsg.attachments.length > 0) {
        try {
          const attachmentUrls = await Promise.all(
            serverMsg.attachments.map(async (attachment) => {
              const fileUrl = await getFileUrl(attachment);
              return fileUrl;
            })
          );

          processedDelivered = {
            ...serverMsg,
            attachmentUrls: attachmentUrls.filter((url) => url !== null),
            files:
              serverMsg.files && serverMsg.files.length > 0
                ? serverMsg.files
                : serverMsg.attachments.map((attachment, index) => ({
                    name: `attachment-${index + 1}`,
                    type: "application/octet-stream",
                    url: attachmentUrls[index],
                    key: attachment,
                  })),
          };
        } catch (error) {
          console.error(
            "[v0] Error processing delivered message attachments:",
            error
          );
        }
      }

      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (lastIndex >= 0 && !prev[lastIndex].id) {
          const updated = [...prev];
          const tempMsg = updated[lastIndex];
          // Preserve any client-side poll data, and keep client files/URLs if server didn't include them
          updated[lastIndex] = normalizeMessage({
            ...processedDelivered,
            poll: processedDelivered.poll ?? tempMsg.poll,
            files: processedDelivered.files ?? tempMsg.files,
            attachmentUrls:
              processedDelivered.attachmentUrls ?? tempMsg.attachmentUrls,
          });
          return updated;
        }
        return prev;
      });
    });

    s.on("reactionUpdated", ({messageId, reactions: updatedReactions}) => {
      console.log("[v0] Reaction updated:", {messageId, updatedReactions});
      setReactions((prev) => ({
        ...prev,
        [messageId]: updatedReactions,
      }));
    });

    s.on("pollUpdated", ({messageId, poll}) => {
      console.log("[v0] Poll updated:", {messageId, poll});
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? normalizeMessage({...m, poll}) : m
        )
      );
    });

    s.on("disconnect", (reason) => {
      console.log("socket disconnect:", reason);
    });

    s.on("messageReadStatus", ({messageIds, readBy, readAt}) => {
      console.log("[v0] Message read status updated:", {
        messageIds,
        readBy,
        readAt,
      });
      // Update read status for messages
      setReadStatus((prev) => {
        const newStatus = {...prev};
        messageIds.forEach((id) => {
          newStatus[id] = true;
        });
        return newStatus;
      });
    });

    s.on("unreadCount", ({unreadCount, tripId: countTripId}) => {
      if (countTripId === tripId) {
        console.log("[v0] Unread count updated:", unreadCount);
        setUnreadCount(unreadCount);
      }
    });

    s.on("unreadCountError", ({error}) => {
      console.error("[v0] Error getting unread count:", error);
    });

    return () => {
      s.off("messages");
      s.off("newMessage");
      s.off("messageDelivered"); // Clean up messageDelivered listener
      s.off("reactionUpdated"); // Clean up reaction listener
      s.off("pollUpdated");
      s.off("messageReadStatus"); // Clean up read status listener
      s.off("unreadCount"); // Clean up unread count listener
      s.off("unreadCountError"); // Clean up unread count error listener
      s.disconnect();
      socketRef.current = null;
    };
  }, [tripId, token, authUerId, BASE_URL]);

  const handleSendMessage = async () => {
    setIsLoading(true);

    if (selectedFiles?.length > 0) {
      setLoadingState("file");
    } else if (mode === "announcement") {
      setLoadingState("announcement");
    } else if (mode === "poll") {
      setLoadingState("poll");
    } else if (mode === "gif") {
      setLoadingState("gif");
    } else {
      setLoadingState("text");
    }

    if (
      !input &&
      selectedFiles.length === 0 &&
      !(mode === "poll" && pollOptions.length)
    )
      return;

    const uploadedFiles = [];
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        const uploaded = await uploadToS3({
          file: file,
          BASE_URL,
          token,
          folder: "chat-uploads",
        });
        if (uploaded) uploadedFiles.push(uploaded);
      }
    }

    // normalize poll options on send
    const normalizedOutgoingPoll =
      mode === "poll"
        ? normalizePoll(
            pollOptions.map((o) => ({
              label: o.label ?? "",
              votes: Number(o.votes ?? 0),
            }))
          ) ?? []
        : null;

    const newMessage = {
      type: mode || "text",
      content: input,
      attachments: uploadedFiles.map((file) => file.key),
      attachmentUrls: uploadedFiles.map((file) => file.url),
      files: uploadedFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        key: file.key,
      })),
      poll: normalizedOutgoingPoll,
      timestamp: new Date().toISOString(),
      senderId: authUerId,
      sender: {name: authUser?.name || "You"},
      reactions: [],
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendMessage", {
        tripId,
        senderId: authUerId,
        content: input,
        type: mode || "text",
        timestamp: new Date().toISOString(),
        attachments: uploadedFiles.map((file) => file.key),
        files: uploadedFiles.map((file) => ({
          url: file.url,
          key: file.key,
          name: file.name,
          type: file.type,
          size: file.size,
        })),
        poll: normalizedOutgoingPoll,
      });
    } else {
      console.warn("Socket not connected yet");
    }

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSelectedFiles([]);
    setMode("");
    setPollOptions([]);
    setIsLoading(false);
    setLoadingState(null);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = selectedFiles.length + newFiles.length;

      // Limit to 10 files maximum
      if (totalFiles > 10) {
        alert("You can only attach up to 10 files at once.");
        return;
      }

      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const truncateFileName = (fileName, maxLength = 15) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const truncatedName =
      nameWithoutExt.substring(0, maxLength - extension.length - 4) + "...";
    return `${truncatedName}.${extension}`;
  };

  const isImageFile = (fileName, fileUrl) => {
    if (!fileName && !fileUrl) return false;
    const fileToCheck = fileName || fileUrl;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileToCheck);
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, {label: "", votes: 0}]);
  };

  const handlePollChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index].label = value;
    setPollOptions(newOptions);
  };

  const handleGifSelect = async (gif) => {
    setLoadingState("gif");
    setIsLoading(true);

    const gifUrl = gif.images.original.url;
    const gifTitle = gif.title || "GIF";

    const newMessage = {
      type: "gif",
      content: gifTitle,
      fileUrl: gifUrl,
      attachments: [],
      attachmentUrls: [],
      files: [],
      timestamp: new Date().toISOString(),
      senderId: authUerId,
      sender: {name: authUser?.name || "You"},
      reactions: [], // Initialize empty reactions array
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("sendMessage", {
        tripId,
        senderId: authUerId,
        content: gifTitle,
        type: "gif",
        fileUrl: gifUrl,
        timestamp: new Date().toISOString(),
        attachments: [],
      });
    } else {
      console.warn("Socket not connected yet");
    }

    setMessages((prev) => [...prev, normalizeMessage(newMessage)]);
    setIsLoading(false);
    setLoadingState(null);
    setIsOpenGif(false);
  };

  const handleVote = (messageId, optionIndex) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("voteOnPoll", {
        messageId,
        userId: authUerId,
        optionIndex, // server also supports optionId, but index maps to rendered order
      });
    }
  };

  const renderReactions = (messageId) => {
    const reactionCounts = getReactionCounts(messageId);
    const userReaction = getUserReaction(messageId);

    if (Object.keys(reactionCounts).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(reactionCounts).map(([reactionType, count]) => (
          <button
            key={reactionType}
            onClick={() => {
              if (userReaction && userReaction.type === reactionType) {
                handleRemoveReaction(messageId, reactionType);
              } else {
                handleAddReaction(messageId, reactionType);
              }
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors bg-blue-100 hover:bg-gray-200

            `}
          >
            <span>{reactionType}</span>
            <span className="font-medium">{count}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderReactionPicker = (messageId, sender) => {
    if (showReactionPicker !== messageId) return null;

    return (
      <div
        className={`absolute bottom-full mb-2  bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10 ${
          sender ? "right-0" : "left-0"
        }`}
      >
        {availableReactions.map((reaction) => (
          <button
            key={reaction}
            onClick={() => handleAddReaction(messageId, reaction)}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-lg"
          >
            {reaction}
          </button>
        ))}
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <main
      className="flex flex-col h-screen w-full max-w-full overflow-x-hidden"
      style={{maxWidth: "100vw", overflowX: "hidden"}}
    >
      {/* Header */}
      <ChatHeader />
      <ModalChatGIF
        open={isOpen}
        onOpenChange={setIsOpenGif}
        onSelectGif={handleGifSelect}
      />

      {/* Messages Container with ref */}
      <div
        ref={messagesContainerRef}
        className="flex flex-col flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto p-2 md:p-4 space-y-4 bg-[#F1F5F9] min-w-0"
        style={{maxWidth: "100vw", overflowX: "hidden"}}
      >
        {messages.length === 0 ? (
          <WelcomeChat />
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex justify-center my-4 w-full max-w-full">
                  <div className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200 max-w-full truncate">
                    {date}
                  </div>
                </div>

                {dateMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="w-full max-w-full mb-3 px-1 min-w-0"
                    style={{maxWidth: "100%", overflow: "hidden"}}
                  >
                    {msg.type === "announcement" && (
                      <div
                        className="w-full max-w-full overflow-hidden"
                        style={{maxWidth: "100%", overflow: "hidden"}}
                      >
                        <ChatAnnouncement msg={msg} />
                      </div>
                    )}

                    {msg.type === "poll" && (
                      <div
                        key={msg.id}
                        className={`flex w-full max-w-full min-w-0 ${
                          msg.senderId === authUerId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                        style={{maxWidth: "100%", overflow: "hidden"}}
                      >
                        <div
                          className={`flex items-start gap-2 w-full max-w-full min-w-0 ${
                            msg.senderId === authUerId
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {/* Show profile picture only for others' messages (left side) */}
                          {msg.senderId !== authUerId &&
                            (msg?.sender?.Profile?.profile_photo_url ? (
                              <img
                                src={`${BASE_URL}${msg?.sender?.Profile.profile_photo_url}`}
                                alt={msg?.sender?.name || "User"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-slate-600 font-semibold text-sm leading-none bg-gray-300 p-3 rounded-full flex items-center justify-center w-10 h-10">
                                <User className="w-4 h-4" />
                              </span>
                            ))}

                          <div
                            className={`flex flex-col ${
                              msg.senderId === authUerId
                                ? "items-end"
                                : "items-start"
                            }`}
                          >
                            <div
                              className="max-w-[90%] sm:max-w-[85%] md:max-w-xs lg:max-w-md relative group/message shadow-sm w-full rounded-2xl px-4 py-3 bg-blue-500 text-white rounded-br-md min-w-0"
                              style={{maxWidth: "90%", overflow: "hidden"}}
                            >
                              {/* Keep poll bubble UI unchanged */}
                              <p className="text-sm font-medium leading-relaxed break-words mb-3">
                                {"📊 "}
                                {msg.content}
                              </p>

                              <div
                                className="w-full max-w-full min-w-0"
                                style={{maxWidth: "100%", overflow: "hidden"}}
                              >
                                <div
                                  className="rounded-lg bg-blue-100/80 backdrop-blur-sm p-4 w-full max-w-full min-w-0"
                                  style={{maxWidth: "100%", overflow: "hidden"}}
                                >
                                  <div className="mb-3">
                                    <h3 className="font-semibold tracking-tight flex items-center gap-2 text-base text-slate-800 mb-1">
                                      <ChartColumn className="w-4 h-4 text-blue-600" />
                                      {msg.content}
                                    </h3>
                                    <p className="text-xs text-slate-600">
                                      {msg?.poll?.reduce(
                                        (a, b) => a + (Number(b.votes) || 0),
                                        0
                                      )}{" "}
                                      vote
                                      {msg?.poll?.reduce(
                                        (a, b) => a + (Number(b.votes) || 0),
                                        0
                                      ) !== 1
                                        ? "s"
                                        : ""}
                                      <span className="mx-1">•</span>
                                      Click any option to change your vote
                                    </p>
                                  </div>

                                  <div
                                    className="space-y-2 w-full max-w-full min-w-0"
                                    style={{
                                      maxWidth: "100%",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {(Array.isArray(msg?.poll)
                                      ? msg.poll
                                      : []
                                    ).map((opt, i, arr) => {
                                      const totalVotes = arr.reduce(
                                        (a, b) => a + (Number(b.votes) || 0),
                                        0
                                      );
                                      const percent =
                                        totalVotes > 0
                                          ? ((Number(opt.votes) || 0) /
                                              totalVotes) *
                                            100
                                          : 0;
                                      const hasVotes =
                                        (Number(opt.votes) || 0) > 0;

                                      return (
                                        <div key={i}>
                                          <button
                                            onClick={() =>
                                              handleVote(msg.id, i)
                                            }
                                            className={`w-full max-w-full p-3 rounded-lg border transition-all text-left min-w-0 ${
                                              hasVotes
                                                ? "border-blue-300 bg-blue-50"
                                                : "border-slate-200 bg-white hover:bg-slate-50"
                                            }`}
                                            style={{
                                              maxWidth: "100%",
                                              overflow: "hidden",
                                            }}
                                          >
                                            <div className="flex justify-between items-center mb-2 w-full max-w-full min-w-0">
                                              <span className="text-sm font-medium text-slate-800 flex items-center gap-2 min-w-0 flex-1">
                                                <span className="truncate">
                                                  {opt.label}
                                                </span>
                                                {hasVotes && (
                                                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                )}
                                              </span>
                                              <span className="text-xs text-slate-600 flex-shrink-0 ml-2">
                                                {Number(opt.votes) || 0} (
                                                {Math.round(percent)}%)
                                              </span>
                                            </div>
                                            <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                              <div
                                                className="absolute left-0 top-0 h-full bg-slate-800 rounded-full transition-all duration-300"
                                                style={{width: `${percent}%`}}
                                              />
                                            </div>
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              {msg.senderId !== authUerId && (
                                <p className="text-xs text-slate-400 flex-shrink-0">
                                  {formatTime(msg.timestamp)}
                                </p>
                              )}
                              <div className="relative flex items-center gap-1">
                                {renderReactions(msg.id)}
                                {renderReactionPicker(
                                  msg.id,
                                  msg.senderId === authUerId
                                )}
                                <button
                                  onClick={() =>
                                    setShowReactionPicker(
                                      showReactionPicker === msg.id
                                        ? null
                                        : msg.id
                                    )
                                  }
                                  className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              {msg.senderId === authUerId && (
                                <p className="text-xs text-slate-400 flex-shrink-0">
                                  {formatTime(msg.timestamp)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Show profile picture for current user messages (right side) */}
                          {msg.senderId === authUerId &&
                            (msg?.sender?.Profile?.profile_photo_url ? (
                              <img
                                src={`${BASE_URL}${msg?.sender?.Profile.profile_photo_url}`}
                                alt={msg?.sender?.name || "User"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-slate-600 font-semibold text-sm leading-none bg-gray-300 p-3 rounded-full flex items-center justify-center w-10 h-10">
                                <User className="w-4 h-4" />
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {msg.type === "gif" && (
                      <div
                        className={`flex w-full max-w-full min-w-0 ${
                          msg.senderId === authUerId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                        style={{maxWidth: "100%", overflow: "hidden"}}
                      >
                        <div
                          className={`flex items-start gap-2 w-full max-w-full min-w-0 ${
                            msg.senderId === authUerId
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {/* Show profile picture only for others' messages (left side) */}
                          {msg.senderId !== authUerId &&
                            (msg?.sender?.Profile?.profile_photo_url ? (
                              <img
                                src={`${BASE_URL}${msg?.sender?.Profile.profile_photo_url}`}
                                alt={msg?.sender?.name || "User"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-slate-600 font-semibold text-sm leading-none bg-gray-300 p-3 rounded-full flex items-center justify-center w-10 h-10">
                                <User className="w-4 h-4" />
                              </span>
                            ))}
                          <div
                            className={`flex flex-col ${
                              msg.senderId === authUerId
                                ? "items-end"
                                : "items-start"
                            }`}
                          >
                            <div
                              className="px-4 py-2 rounded-2xl max-w-[90%] sm:max-w-xs md:max-w-sm break-words bg-blue-500 text-white rounded-br-md min-w-0"
                              style={{maxWidth: "90%", overflow: "hidden"}}
                            >
                              {/* Sender name (only for others' messages) */}
                              {msg.senderId !== authUerId && (
                                <p className="text-xs font-medium mb-1">
                                  {msg?.sender?.name || "Unknown"}
                                </p>
                              )}

                              {/* GIF content */}
                              <div
                                className="rounded-lg overflow-hidden w-full max-w-full min-w-0"
                                style={{maxWidth: "100%", overflow: "hidden"}}
                              >
                                <img
                                  src={msg.fileUrl || "/placeholder.svg"}
                                  alt={msg.content || "GIF"}
                                  className="w-full h-auto max-w-full rounded-lg"
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "200px",
                                    objectFit: "contain",
                                    width: "100%",
                                    height: "auto",
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {msg.senderId !== authUerId && (
                                <p className="text-xs text-slate-400 flex-shrink-0">
                                  {formatTime(msg.timestamp)}
                                </p>
                              )}
                              <div className="relative flex items-center gap-1">
                                {renderReactions(msg.id)}
                                {renderReactionPicker(
                                  msg.id,
                                  msg.senderId === authUerId
                                )}
                                <button
                                  onClick={() =>
                                    setShowReactionPicker(
                                      showReactionPicker === msg.id
                                        ? null
                                        : msg.id
                                    )
                                  }
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <div className="group relative px-3">
                                    <Plus className="w-4 h-4 absolute top-0  -mt-2 right-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                  </div>{" "}
                                </button>
                              </div>
                              {msg.senderId === authUerId && (
                                <p className="text-xs text-slate-400 flex-shrink-0">
                                  {formatTime(msg.timestamp)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Show profile picture for current user messages (right side) */}
                          {msg.senderId === authUerId &&
                            (msg?.sender?.Profile?.profile_photo_url ? (
                              <img
                                src={`${BASE_URL}${msg?.sender?.Profile.profile_photo_url}`}
                                alt={msg?.sender?.name || "User"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-slate-600 font-semibold text-sm leading-none bg-gray-300 p-3 rounded-full flex items-center justify-center w-10 h-10">
                                <User className="w-4 h-4" />
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {msg.type === "text" && (
                      <div
                        className={`flex w-full max-w-full min-w-0 ${
                          msg.senderId === authUerId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                        style={{maxWidth: "100%", overflow: "hidden"}}
                      >
                        <div
                          className={`flex items-start gap-2 w-full max-w-full min-w-0 ${
                            msg.senderId === authUerId
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {/* Show profile picture only for others' messages (left side) */}
                          {msg.senderId !== authUerId &&
                            (msg?.sender?.Profile?.profile_photo_url ? (
                              <img
                                src={`${BASE_URL}${msg?.sender?.Profile.profile_photo_url}`}
                                alt={msg?.sender?.name || "User"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-slate-600 font-semibold text-sm leading-none bg-gray-300 p-3 rounded-full flex items-center justify-center w-10 h-10">
                                <User className="w-4 h-4" />
                              </span>
                            ))}
                          <div
                            className={`flex flex-col ${
                              msg.senderId === authUerId
                                ? "items-end"
                                : "items-start"
                            }`}
                          >
                            <div
                              className={`relative px-4 py-2 rounded-2xl break-words bg-blue-500 text-white ${
                                msg.senderId === authUerId
                                  ? "rounded-br-md"
                                  : "rounded-bl-md"
                              } w-auto max-w-[80vw] md:max-w-xl`}
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

                              {/* Attachments */}
                              {msg.attachments && (
                                <div className="mt-2 w-full">
                                  <RenderAttachments msg={msg} />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              {msg.senderId !== authUerId && (
                                <p className="text-xs text-slate-400 flex-shrink-0">
                                  {formatTime(msg.timestamp)}
                                </p>
                              )}
                              <div className="relative flex items-center gap-1">
                                {renderReactions(msg.id)}
                                {renderReactionPicker(
                                  msg.id,
                                  msg.senderId === authUerId
                                )}
                                <button
                                  onClick={() =>
                                    setShowReactionPicker(
                                      showReactionPicker === msg.id
                                        ? null
                                        : msg.id
                                    )
                                  }
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <div className="group relative px-3">
                                    <Plus className="w-4 h-4 absolute top-0  -mt-2 right-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                  </div>{" "}
                                </button>
                              </div>
                              {msg.senderId === authUerId && (
                                <p className="text-xs text-slate-400 flex-shrink-0">
                                  {formatTime(msg.timestamp)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Show profile picture for current user messages (right side) */}
                          {msg.senderId === authUerId &&
                            (msg?.sender?.Profile?.profile_photo_url ? (
                              <img
                                src={`${BASE_URL}${msg?.sender?.Profile.profile_photo_url}`}
                                // alt={`http://localhost:4000/${msg?.sender?.Profile.profile_photo_url}`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-slate-600 font-semibold text-sm leading-none bg-gray-300 p-3 rounded-full flex items-center justify-center w-10 h-10">
                                <User className="w-4 h-4" />
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Empty div to mark the end of messages for scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div
        className="flex-shrink-0 bg-white border-t border-slate-200 p-2 md:p-4 space-y-3 w-full max-w-full overflow-hidden min-w-0"
        style={{maxWidth: "100vw", overflowX: "hidden"}}
      >
        <div
          className="bg-white p-2 md:p-4 space-y-3 w-full max-w-full overflow-hidden min-w-0"
          style={{maxWidth: "100%", overflow: "hidden"}}
        >
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

          {selectedFiles.length > 0 && (
            <div className="w-full">
              <div className="flex flex-wrap gap-1 mb-2 max-h-20 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center gap-1.5 py-1 px-2 flex-shrink-0 text-xs"
                  >
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <span className="truncate flex-1 min-w-0" title={file.name}>
                      {truncateFileName(file.name)}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {selectedFiles.length >= 10 && (
                <p className="text-xs text-amber-600 mb-2">
                  Maximum 10 files allowed
                </p>
              )}
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
          )}

          {/* Default Input */}
          {mode !== "poll" && (
            <form
              className="w-full max-w-full min-w-0"
              style={{maxWidth: "100%", overflow: "hidden"}}
            >
              <div
                className="flex items-end gap-2 md:gap-3 w-full max-w-full min-w-0"
                style={{maxWidth: "100%", overflow: "hidden"}}
              >
                <div
                  className="flex-1 min-w-0 max-w-full"
                  style={{maxWidth: "100%", overflow: "hidden"}}
                >
                  <textarea
                    className={`flex border px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none w-full max-w-full min-w-0 min-h-[40px] md:min-h-[48px] max-h-32 rounded-2xl transition-colors text-sm md:text-base
                      ${
                        mode === "announcement"
                          ? "bg-amber-50 border-amber-400 focus:border-amber-500 focus:ring-amber-500"
                          : "bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    style={{maxWidth: "100%", overflow: "hidden"}}
                    placeholder={
                      mode === "announcement"
                        ? "Share an important announcement..."
                        : "Type your message..."
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
                  disabled={
                    (!input && selectedFiles.length === 0) ||
                    isLoading ||
                    loadingState !== null
                  }
                  className={`inline-flex items-center justify-center gap-2 text-sm font-medium rounded-full w-10 h-10 md:w-12 md:h-12 flex-shrink-0 shadow-lg transition-all
                    ${
                      mode === "announcement"
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }
                    ${
                      !input && selectedFiles.length === 0
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
            <div
              className="flex justify-start items-center mt-2 w-full max-w-full overflow-hidden min-w-0"
              style={{maxWidth: "100%", overflow: "hidden"}}
            >
              <div
                className="flex items-center gap-1 flex-wrap max-w-full min-w-0"
                style={{maxWidth: "100%", overflow: "hidden"}}
              >
                <input
                  type="file"
                  multiple
                  ref={generalFileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {loadingState === "file" ? (
                  <ChatLoader />
                ) : (
                  <button
                    type="button"
                    onClick={() => generalFileInputRef.current.click()}
                    disabled={selectedFiles.length >= 10}
                    className={`inline-flex items-center justify-center gap-2 h-8 w-8 md:w-10 md:h-10 rounded-full transition-colors ${
                      selectedFiles.length >= 10
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}

                {loadingState === "gif" ? (
                  <ChatLoader />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsOpenGif(true)}
                    className="inline-flex items-center justify-center gap-2 h-8 w-8 md:w-10 md:h-10 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
                {(authUser?.trip_role === "creator" ||
                  authUser?.trip_role === "co-admin") &&
                  (loadingState === "announcement" ? (
                    <ChatLoader />
                  ) : (
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
                    if (pollOptions.length === 0) {
                      setPollOptions([
                        {label: "", votes: 0},
                        {label: "", votes: 0},
                      ]);
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
