import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShieldCheck,
  Shield,
  Trash2,
  MoreVertical,
  User as UserIcon,
  Crown,
  Phone,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ParticipantList({ participants, onRemove }) {
  const [participantToRemove, setParticipantToRemove] = useState(null);

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Users className="w-5 h-5 text-purple-600" />
            Participant Roster
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {participants.map((participant) => {
              return (
                <div
                  key={participant.id}
                  className="px-4 md:px-6 py-4 md:py-5 hover:bg-slate-50/50 transition-colors duration-200"
                >
                  <div className="flex items-start md:items-center gap-3 md:gap-4">
                    {/* Profile Picture */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white shadow-md">
                      {participant.profile_photo_url ? (
                        <img
                          src={participant.profile_photo_url}
                          alt={participant.full_name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-600 font-semibold text-sm md:text-lg">
                          {participant?.user.name.charAt(0) || "U"}
                        </span>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name and badges - Stack on mobile */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-800 text-base md:text-lg">
                            {participant?.user.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs px-2 py-1"
                            >
                              {participant?.user?.role}
                            </Badge>
                          }
                        </div>
                      </div>

                      {/* Emergency contact - Always visible, wrapping text */}
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="break-words">
                          Emergency Contact: {participant.user.phoneNumber}
                        </span>
                      </div>
                    </div>

                    {/* Role Badge and Actions - Stack on mobile */}
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-3 shrink-0">
                      <div className="order-2 md:order-1">
                        {participant.user.role === "admin" ? (
                          <Badge className="bg-coral-100 text-coral-800 border-coral-200 font-medium text-xs">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 font-medium text-xs"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Participant
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
