import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  User,
  Target
} from "lucide-react";

export default function ContributionOverview({ 
  contributions, 
  participants, 
  myContribution, 
  totalAmount 
}) {
  const getParticipantName = (userId) => {
    const participant = participants.find(p => p.id === userId);
    return participant?.full_name || 'Unknown User';
  };

  const getProgressPercentage = (contribution) => {
    if (contribution.goal_amount === 0) return 0;
    return Math.min(100, (contribution.amount_paid / contribution.goal_amount) * 100);
  };

  if (totalAmount === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Users className="w-5 h-5 text-blue-600" />
            Contribution Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="py-16 text-center">
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">
            No contributions to track yet
          </h3>
          <p className="text-slate-500">
            Add expenses first to see individual contribution goals
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* My Contribution (if exists) */}
      {myContribution && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <User className="w-5 h-5 text-blue-600" />
              My Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Amount Paid</span>
              <span className="text-2xl font-bold text-blue-600">
                ${myContribution.amount_paid }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">My Goal</span>
              <span className="text-xl font-semibold text-slate-800">
                ${myContribution.goal_amount }
              </span>
            </div>
            <Progress 
              value={getProgressPercentage(myContribution)} 
              className="h-3"
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">
                {getProgressPercentage(myContribution) }% complete
              </span>
              <span className="text-slate-500">
                ${myContribution.amount_remaining } remaining
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Contributions */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Users className="w-5 h-5 text-purple-600" />
            All Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contributions.map((contribution, index) => (
            <div 
              key={contribution.id}
              className={`p-4 rounded-lg border ${
                contribution.user_id === myContribution?.user_id 
                  ? 'border-blue-200 bg-blue-50/50' 
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    {getParticipantName(contribution.user_id)}
                  </span>
                  {contribution.user_id === myContribution?.user_id && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600">
                    ${contribution.amount_paid } / ${contribution.goal_amount }
                  </div>
                </div>
              </div>
              
              <Progress 
                value={getProgressPercentage(contribution)} 
                className="h-2 mb-2"
              />
              
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{getProgressPercentage(contribution) }% paid</span>
                <span>${contribution.amount_remaining } remaining</span>
              </div>
            </div>
          ))}
          
          {contributions.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No participants found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}