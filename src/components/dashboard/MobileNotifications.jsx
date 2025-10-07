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
              <div className="relative"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bell w-4 h-4" data-source-location="layout:299:30" data-dynamic-content="false"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg><span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border border-white"></span></div>
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
