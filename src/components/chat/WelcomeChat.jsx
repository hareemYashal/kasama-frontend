import {MessageCircle} from "lucide-react";
const WelcomeChat = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-8 overflow-hidden gap-4">
      <MessageCircle className="w-20 h-20 text-slate-400" strokeWidth={1.5} />

      <h2
        data-filename="pages/Chat"
        data-linenumber="347"
        data-visual-selector-id="pages/Chat347"
        data-source-location="pages/Chat:347:10"
        data-dynamic-content="false"
        class="text-lg md:text-2xl font-semibold text-slate-700"
      >
        Welcome to the Chat!
      </h2>
      <p
        data-filename="pages/Chat"
        data-linenumber="348"
        data-visual-selector-id="pages/Chat348"
        data-source-location="pages/Chat:348:10"
        data-dynamic-content="false"
        class="text-slate-500 mt-2 max-w-sm text-sm md:text-base"
      >
        Be the first to send a message. Share ideas, coordinate plans, and get
        excited for the trip together.
      </p>
    </div>
  );
};

export default WelcomeChat;
