import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, User, Crown } from "lucide-react";

export default function ContributionBreakdown({
  participantContributionData,
  contributions,
  participants,
  currentUserId,
  totalAmount,
}) {
  const getParticipantInfo = (userId) => {
    return participants.find((p) => p.id === userId);
  };

  const getProgressPercentage = (contribution) => {
    if (!contribution || contribution.goal_amount === 0) return 0;
    return Math.min(
      100,
      (contribution.amount_paid / contribution.goal_amount) * 100
    );
  };

  // if (participantContributionData?.participants.length === 0) {
  //   return (
  //     <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
  //       <CardHeader>
  //         <CardTitle className="flex items-center gap-2 text-slate-800">
  //           <Users className="w-5 h-5 text-purple-600" />
  //           All Participants
  //         </CardTitle>
  //       </CardHeader>
  //       <CardContent className="py-8 text-center">
  //         <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
  //         <p className="text-slate-500">No participants found</p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Users className="w-5 h-5 text-purple-600" />
          All Participants
        </CardTitle>
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          {participantContributionData?.participants?.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {participantContributionData.participants.map((contribution) => {
          // const participant = getParticipantInfo(contribution.user_id);
          // if (!participant) return null; // Don't render if participant data is missing

          return (
            <div key={contribution.id} className={`p-4 rounded-lg border  `}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    {contribution.user.name}
                    {contribution.user.role === "admin" && (
                      <Crown
                        className="w-4 h-4 text-amber-500"
                        title="Trip Admin"
                      />
                    )}
                  </span>
                  {/* {contribution.user.id === currentUserId && (
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-700 border-blue-300 text-xs"
                    >
                      You
                    </Badge>
                  )} */}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600">
                    ${contribution?.paidAmount} / ${contribution?.mygoal}
                  </div>
                </div>
              </div>

              <Progress
                value={getProgressPercentage(contribution)}
                className="h-2 mb-2"
              />

              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{getProgressPercentage(contribution)}% paid</span>
                <span>
                  ${contribution.mygoal - contribution?.paidAmount} remaining
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
