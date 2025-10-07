import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, User, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useSelector } from "react-redux";

export default function ContributionBreakdown({
  participantContributionData,
  contributions,
  participants,
  totalAmount,
}) {
  const getParticipantInfo = (userId) => {
    return participants.find((p) => p.id === userId);
  };

  const getProgressPercentage = (contribution) => {
    if (!contribution || contribution.goal === 0) return 0;
    return Math.min(
      100,
      (contribution.amountPaid / contribution.goal) * 100
    ).toFixed(2);
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

  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  console.log("contributions----->", contributions);
  const isCreator =
    user?.trip_role === "creator" || user?.trip_role === "co-admin";

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-1.5 border-b border-slate-100 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 font-semibold tracking-tight text-amber-700 text-base sm:text-lg">
          <Users className="w-5 h-5 text-amber-600" />
          All Participants
          {isCreator && (
            <Badge
              variant="outline"
              className="inline-flex items-center rounded-full !mx-0 border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-slate-50 text-slate-700 border-slate-200 ml-2 text-xs sm:text-sm flex-shrink-0"
            >
              {participantContributionData?.participants?.length}
            </Badge>
          )}
        </CardTitle>

        {isCreator && (
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-9 rounded-md flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4 bg-amber-600 hover:bg-amber-700 text-white"
            data-filename="pages/Dashboard"
            data-linenumber="464"
            data-visual-selector-id="pages/Dashboard464"
            data-source-location="pages/Dashboard:464:18"
            data-dynamic-content="false"
            onClick={() => navigate(createPageUrl("participants"))}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-users w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"
              data-filename="pages/Dashboard"
              data-linenumber="469"
              data-visual-selector-id="pages/Dashboard469"
              data-source-location="pages/Dashboard:469:20"
              data-dynamic-content="false"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span
              data-filename="pages/Dashboard"
              data-linenumber="470"
              data-visual-selector-id="pages/Dashboard470"
              data-source-location="pages/Dashboard:470:20"
              data-dynamic-content="false"
              className="hidden sm:inline"
            >
              Manage All Participants
            </span>
            <span
              data-filename="pages/Dashboard"
              data-linenumber="471"
              data-visual-selector-id="pages/Dashboard471"
              data-source-location="pages/Dashboard:471:20"
              data-dynamic-content="false"
              className="sm:hidden"
            >
              Manage
            </span>
          </button>
        )}
        {/* {(contribution?.user.email === user?.email && isCreator) && (
          <Badge
            variant="outline"
            className="inline-flex items-center rounded-full !mx-0 border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-slate-50 text-slate-700 border-slate-200 ml-2 text-xs sm:text-sm flex-shrink-0"
          >
            {participantContributionData?.participants?.length}
          </Badge>
        )} */}
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {contributions?.map((contribution) => (
          <div
            key={contribution.id}
            className="p-4 rounded-lg border border-amber-200 bg-amber-50/50"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 flex items-center gap-2 truncate">
                  {contribution?.user.name}
                  {contribution?.user.email === user?.email && isCreator && (
                    <>
                      <Crown
                        className="w-4 h-4 text-amber-500"
                        title="Trip Admin"
                      />
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-amber-100 text-amber-700 border-amber-300 text-xs">
                        You
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-600">
                  ${contribution.amountPaid} / ${(contribution.goal).toFixed(2)}
                </div>
              </div>
            </div>

            <Progress
              value={getProgressPercentage(contribution)}
              indicatorClassName="bg-gradient-to-r from-emerald-500 to-green-500"
              className="h-2 mb-2"
            />

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{getProgressPercentage(contribution)}% paid</span>
              <span>
                ${(contribution.goal - contribution.amountPaid).toFixed(2) } remaining
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
