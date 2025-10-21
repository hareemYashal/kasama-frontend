import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export default function ItineraryDayGroup({
  date,
  items,
  isExpanded,
  onToggle,
  isAdmin,
  onEdit,
  onDelete,
}) {
  // ✅ Helper: convert UTC timestamps to the viewer’s local timezone
  const formatToLocalTime = (timeString, timeZone) => {
    if (!timeString) return "";

    const localDate = timeZone
      ? fromZonedTime(timeString, timeZone)
      : new Date(timeString);

    return format(localDate, "h:mm a");
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader
        className="cursor-pointer hover:bg-slate-50/60 transition-colors duration-200"
        onClick={onToggle}
      >
        <CardTitle className="flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            <span>{format(parseISO(date), "EEEE, MMMM d")}</span>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            {items.length} activit{items.length !== 1 ? "ies" : "y"}
          </Badge>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-4 pr-4">
          <div className="pl-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 border-l-2 border-blue-200"
              >
                <div className="pt-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.activity_title}
                      </p>
                      {/* ✅ Time converted to local timezone */}
                      <p className="text-sm text-blue-600 font-medium">
                        {`${formatToLocalTime(
                          item.start_time,
                          item.timeZone
                        )} - ${formatToLocalTime(
                          item.end_time,
                          item.timeZone
                        )}`}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{item.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
