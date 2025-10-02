import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Bell, ActivityIcon} from "lucide-react";
const MobileNotifications = ({notifications, unreadCount}) => {
  return (
    <div className="flex items-center gap-3 md:hidden block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative inline-flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Bell className="w-3 h-3" />
            </span>
            <span className="text-sm font-medium text-slate-800">
              Recent Activity
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.map((n, idx) => (
                <div
                  key={n.id || idx}
                  className="px-4 py-3 border-b last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ActivityIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800 truncate">
                        {n.message || n.title || n.text || "Notification"}
                      </p>
                      {(n.createdAt || n.created_at) && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(
                            n.createdAt || n.created_at
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-slate-500">
                No recent activity
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileNotifications;
