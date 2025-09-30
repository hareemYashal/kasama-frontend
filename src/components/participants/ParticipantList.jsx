import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button"; // ✅ using your shadcn/ui button
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getAllTripsWithRole } from "@/services/trip";

export default function ParticipantList({
  participants,
  isAdmin,
  onMakeAdmin,
  tripId,
}) {
  const [participantToRemove, setParticipantToRemove] = useState(null);
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);

  const { data: tripsData } = useQuery({
    queryKey: ["getAllTripsWithRoleQuery", token],
    queryFn: () => getAllTripsWithRole(token),
    enabled: !!token,
  });

  const activeTrip = tripsData?.data?.trips?.find((t) => t.id === tripId);
  const creatorId = activeTrip?.creatorId;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-card-foreground">
          <Users className="w-6 h-6 text-primary" />
          Participant Roster
        </CardTitle>
      </CardHeader>

      <CardContent>
        {participants?.length > 0 ? (
          participants.map((participant) => {
            const profile = participant?.user?.Profile;

            return (
              <div
                key={participant.id}
                className="px-3 md:px-6 py-4 md:py-5 hover:bg-muted/50 transition-colors duration-200 border-b last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  {/* Profile Image */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-md">
                    {profile?.profile_photo_url ? (
                      <img
                        src={profile?.profile_photo_url}
                        alt={participant?.user?.name || "Participant"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML = `
                            <span class='w-full h-full flex items-center justify-center bg-purple-500 text-white font-semibold'>
                              ${(
                              participant?.user?.name?.[0] || "P"
                            ).toUpperCase()}
                            </span>`;
                        }}
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center bg-purple-500 text-white font-semibold">
                        {(participant?.user?.name?.[0] || "P").toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-2">
                      <div className="flex items-center gap-x-3 flex-wrap">
                        <h3 className="font-bold text-card-foreground text-base truncate">
                          {participant?.user?.name || "Unnamed"}
                        </h3>

                        {/* Badges */}
                        <div className="flex items-center gap-x-1.5">
                          {/* Crown badge only for creator */}
                          {participant?.userId === creatorId  && (
                            <div className="inline-flex items-center rounded-full border px-2.5 bg-amber-100 text-amber-800 border-amber-200 font-medium text-xs py-0.5">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </div>
                          )}

                          {/* Co-Admin badge */}
                          {participant.isHelperAdmin && (
                            <div className="inline-flex items-center rounded-full border px-2.5 bg-amber-100 text-amber-800 border-amber-200 font-medium text-xs py-0.5">
                              {/* <Crown className="w-3 h-3 mr-1" /> */}
                              Co-Admin
                            </div>
                          )}

                          {/* “You” badge */}
                          {participant?.user?.id === user?.id && (
                            <div className="inline-flex items-center rounded-full border px-2.5 font-semibold text-foreground text-xs py-0.5">
                              You
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 👉 Make Co-Admin button (only creator can assign) */}
                      {isAdmin &&
                        user?.id === creatorId &&
                        participant?.user?.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMakeAdmin?.(participant)}
                          >
                            {/* <Crown className="w-4 h-4 mr-1 text-amber-600" /> */}
                            {participant.isHelperAdmin
                              ? "Remove Co-Admin"
                              : "Make Co-Admin"}
                          </Button>
                        )}
                    </div>

                    {/* Email */}
                    {isAdmin && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {participant?.user?.email || "No email provided"}
                      </p>
                    )}

                    {/* DOB */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-medium">DOB:</span>
                        <span className="truncate">
                          {profile?.birthday
                            ? new Date(profile?.birthday).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                            : "Not provided"}
                        </span>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">Emergency Contact:</span>
                        <div className="break-words text-xs leading-relaxed">
                          {profile?.emergency_contact_name ||
                            profile?.emergency_contact_phone ||
                            profile?.emergency_contact_relationship ? (
                            <>
                              {profile?.emergency_contact_name || "N/A"} •{" "}
                              {profile?.emergency_contact_phone || "N/A"} •{" "}
                              {profile?.emergency_contact_relationship || "N/A"}
                            </>
                          ) : (
                            "Not provided"
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Travel Document */}
                    {isAdmin && (
                      <>
                        <div className="mt-3 pt-3 border-t border-border/60">
                          {profile?.passport_country &&
                            profile?.passport_expiration &&
                            profile?.passport_number ? (
                            <div className="space-y-1">
                              <p className="text-xs text-slate-400 italic">
                                {profile?.travelDocument ||
                                  "Travel document details available"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">
                                  Passport Number:
                                </span>{" "}
                                {profile?.passport_number}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              No travel document submitted.
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          {profile?.passport_expiration &&
                            profile?.passport_number && (
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">
                                  Passport Expiry:
                                </span>{" "}
                                {new Date(
                                  profile?.passport_expiration
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No participants yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
