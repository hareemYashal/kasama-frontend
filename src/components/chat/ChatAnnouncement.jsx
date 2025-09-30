import {Megaphone} from "lucide-react";
import { RenderAttachments } from "./ChatAttachments";
import { formatTime } from "@/utils/utils";
export const ChatAnnouncement = ({msg}) => {
  return (
    <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-yellow-100 border-l-4 border-amber-500 shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-amber-800">📢 Announcement</p>
          <p className="text-xs text-amber-600">from {msg?.sender?.name}</p>
        </div>
      </div>
      <RenderAttachments msg={msg} />

      {msg.content && (
        <p className="text-slate-800 font-semibold text-base">{msg.content}</p>
      )}

      <p className="text-xs text-amber-500 mt-2 text-right">
        {formatTime(msg.timestamp)}
      </p>
    </div>
  );
};
