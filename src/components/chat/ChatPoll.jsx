import React from "react";
import {ChartColumn, Check} from "lucide-react";

const ChatPoll = ({msg, handleVote}) => {
  return (
    <div className="max-w-[80%] md:max-w-xs lg:max-w-md items-end flex flex-col min-w-0 ml-auto">
      <div className="rounded-2xl px-4 py-3 relative group/message shadow-sm w-full bg-blue-500 text-white rounded-br-md">
        <p className="text-sm font-medium leading-relaxed break-words mb-3">
          📊 {msg.content}
        </p>

        <div className="max-w-full">
          <div className="rounded-lg bg-blue-100/80 backdrop-blur-sm p-4">
            <div className="mb-3">
              <h3 className="font-semibold tracking-tight flex items-center gap-2 text-base text-slate-800 mb-1">
                <ChartColumn className="w-4 h-4 text-blue-600" />
                {msg.content}
              </h3>
              <p className="text-xs text-slate-600">
                {msg?.poll?.reduce((a, b) => a + (Number(b.votes) || 0), 0)}{" "}
                vote
                {msg?.poll?.reduce((a, b) => a + (Number(b.votes) || 0), 0) !==
                1
                  ? "s"
                  : ""}
                <span className="mx-1">•</span>
                Click any option to change your vote
              </p>
            </div>

            <div className="space-y-2">
              {(Array.isArray(msg?.poll) ? msg.poll : []).map((opt, i, arr) => {
                const totalVotes = arr.reduce(
                  (a, b) => a + (Number(b.votes) || 0),
                  0
                );
                const percent =
                  totalVotes > 0
                    ? ((Number(opt.votes) || 0) / totalVotes) * 100
                    : 0;
                const hasVotes = (Number(opt.votes) || 0) > 0;

                return (
                  <div key={i}>
                    <button
                      onClick={() => handleVote(msg.id, i)}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        hasVotes
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-800 flex items-center gap-2">
                          {opt.label}
                          {hasVotes && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </span>
                        <span className="text-xs text-slate-600">
                          {Number(opt.votes) || 0} ({Math.round(percent)}%)
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-slate-800 rounded-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                          }}
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
    </div>
  );
};

export default ChatPoll;
