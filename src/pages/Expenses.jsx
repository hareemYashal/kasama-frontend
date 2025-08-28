import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trip } from "@/api/entities";
import { User } from "@/api/entities";
import { Expense } from "@/api/entities";
import { Contribution } from "@/api/entities";
import { TripActivity } from "@/api/entities"; // Added TripActivity import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Users,
  Calculator,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";
import ContributionOverview from "../components/expenses/ContributionOverview";
import { useQuery } from "@tanstack/react-query";
import {
  getExpenseByTripIdService,
  getExpenseListService,
} from "@/services/expense";
import { useDispatch, useSelector } from "react-redux";
import { totalParticipantsService } from "@/services/participant";
import { setExpensesList } from "@/store/expenseSlice";

export default function Expenses() {
  // const navigate = useNavigate();
  // const [user, setUser] = useState(null);
  // const [trip, setTrip] = useState(null);
  // const [expenses, setExpenses] = useState([]);
  // const [contributions, setContributions] = useState([]);
  // const [participants, setParticipants] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [editingExpense, setEditingExpense] = useState(null);

  // useEffect(() => {
  //   loadExpenseData();
  // }, []);

  // const loadExpenseData = async () => {
  //   try {
  //     const currentUser = await User.me();
  //     setUser(currentUser);

  //     if (!currentUser.current_trip_id) {
  //       navigate(createPageUrl("Home"));
  //       return;
  //     }

  //     const currentTrip = await Trip.get(currentUser.current_trip_id);
  //     setTrip(currentTrip);

  //     // Load expenses
  //     const tripExpenses = await Expense.filter({ trip_id: currentTrip.id }, "-created_date");
  //     setExpenses(tripExpenses);

  //     // Load all participants
  //     const allParticipants = await User.filter({ current_trip_id: currentTrip.id });
  //     setParticipants(allParticipants);

  //     // Load contributions
  //     const tripContributions = await Contribution.filter({ trip_id: currentTrip.id });
  //     setContributions(tripContributions);

  //     // Calculate and update contributions based on current expenses
  //     await updateContributions(tripExpenses, allParticipants, currentTrip.id);

  //   } catch (error) {
  //     console.error("Error loading expense data:", error);
  //     navigate(createPageUrl("Home"));
  //   }
  //   setLoading(false);
  // };

  // const updateContributions = async (expenseList, participantList, tripId) => {
  //   const totalAmount = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
  //   const perPersonAmount = participantList.length > 0 ? totalAmount / participantList.length : 0;

  //   // Update trip total goal
  //   await Trip.update(tripId, { total_goal_amount: totalAmount });

  //   // Update or create contributions for each participant
  //   for (const participant of participantList) {
  //     const existingContribution = await Contribution.filter({
  //       trip_id: tripId,
  //       user_id: participant.id
  //     });

  //     const contributionData = {
  //       trip_id: tripId,
  //       user_id: participant.id,
  //       goal_amount: perPersonAmount,
  //       amount_remaining: Math.max(0, perPersonAmount - (existingContribution[0]?.amount_paid || 0))
  //     };

  //     if (existingContribution.length > 0) {
  //       await Contribution.update(existingContribution[0].id, contributionData);
  //     } else {
  //       await Contribution.create({
  //         ...contributionData,
  //         amount_paid: 0
  //       });
  //     }
  //   }

  //   // Reload contributions
  //   const updatedContributions = await Contribution.filter({ trip_id: tripId });
  //   setContributions(updatedContributions);
  // };

  // const handleAddExpense = async (expenseData) => {
  //   if (user?.trip_role !== 'admin') return;

  //   try {
  //     await Expense.create({
  //       ...expenseData,
  //       trip_id: trip.id
  //     });

  //     const firstName = user.full_name.split(' ')[0];
  //     await TripActivity.create({
  //       trip_id: trip.id,
  //       user_id: user.id,
  //       user_first_name: firstName,
  //       action_type: 'ADDED_EXPENSE',
  //       description: `${firstName} added a new expense: ${expenseData.name} - $${expenseData.amount.toFixed(2)}`,
  //       metadata: { name: expenseData.name, amount: expenseData.amount }
  //     });

  //     await loadExpenseData(); // Reload to recalculate contributions
  //   } catch (error) {
  //     console.error("Error adding expense:", error);
  //     throw error; // Propagate error for UI feedback
  //   }
  // };

  // const handleStartEdit = (expense) => {
  //   setEditingExpense(expense);
  //   setIsEditModalOpen(true);
  // };

  // const handleCancelEdit = () => {
  //   setIsEditModalOpen(false);
  //   setEditingExpense(null);
  // };

  // const handleEditExpense = async (formData) => {
  //   if (user?.trip_role !== 'admin' || !editingExpense) return;

  //   try {
  //     await Expense.update(editingExpense.id, {
  //       ...formData,
  //       trip_id: trip.id
  //     });

  //     const firstName = user.full_name.split(' ')[0];
  //     await TripActivity.create({
  //       trip_id: trip.id,
  //       user_id: user.id,
  //       user_first_name: firstName,
  //       action_type: 'UPDATED_EXPENSE',
  //       description: `${firstName} updated an expense: ${formData.name}`,
  //       metadata: { name: formData.name, amount: formData.amount }
  //     });

  //     await loadExpenseData(); // Reload to recalculate contributions
  //     handleCancelEdit(); // Close modal and reset state
  //   } catch (error) {
  //     console.error("Error saving expense:", error);
  //     throw error; // Propagate error for UI feedback
  //   }
  // };

  // const handleDeleteExpense = async (expenseId) => {
  //   if (user?.trip_role !== 'admin') return;

  //   try {
  //     const expenseToDelete = expenses.find(e => e.id === expenseId);
  //     await Expense.delete(expenseId);

  //     if (expenseToDelete) {
  //       const firstName = user.full_name.split(' ')[0];
  //       await TripActivity.create({
  //         trip_id: trip.id,
  //         user_id: user.id,
  //         user_first_name: firstName,
  //         action_type: 'REMOVED_EXPENSE',
  //         description: `${firstName} removed an expense: ${expenseToDelete.name}`,
  //         metadata: { name: expenseToDelete.name }
  //       });
  //     }

  //     await loadExpenseData(); // Reload to recalculate contributions
  //   } catch (error) {
  //     console.error("Error deleting expense:", error);
  //     throw error; // Propagate error for UI feedback
  //   }
  // };

  // const getTotalAmount = () => {
  //   return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  // };

  // const getTotalContributed = () => {
  //   return contributions.reduce((sum, contrib) => sum + contrib.amount_paid, 0);
  // };

  // const getMyContribution = () => {
  //   return contributions.find(c => c.user_id === user?.id);
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // if (!trip) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold text-slate-800 mb-4">No Active Trip</h2>
  //         <Button onClick={() => navigate(createPageUrl("Home"))}>
  //           Go Home
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  // const isAdmin = user?.trip_role === 'admin';
  // const totalAmount = getTotalAmount();
  // const totalContributed = getTotalContributed();
  // const myContribution = getMyContribution();

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const dispatch = useDispatch();
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);

  // first Query
  const { data: tripExpenseData } = useQuery({
    queryKey: ["getExpenseByTripIdService", tripId],
    queryFn: () => getExpenseByTripIdService(token, tripId),
    enabled: !!token && !!tripId,
  });
  const tripData = tripExpenseData?.data?.data;

  console.log("hey i am the Trip Data", tripData);
  console.log("Hey Iiiiaiaiaiaiaia", tripExpenseData);
  // SecondQuery
  const { data: participantsData } = useQuery({
    queryKey: ["totalParticipantsService"],
    queryFn: () => totalParticipantsService(token, tripId),
    enabled: !!token && !!tripId,
  });
  let tripParticipantsNumber = participantsData?.data?.participants.length || 0;

  // third Query
  const { data: expenseDataList, isSuccess: expenseListSuccess } = useQuery({
    queryKey: ["getExpenseListQuery", tripId],
    queryFn: () => getExpenseListService(tripId, token),
    enabled: !!tripId && !!token,
  });

  const tripExpensesList = expenseDataList?.expenses;
  useEffect(() => {
    if (expenseListSuccess && expenseDataList) {
      dispatch(setExpensesList(tripExpensesList));
    }
  }, [expenseListSuccess, expenseDataList, dispatch]);

  console.log(tripExpensesList);
  console.log(expenseDataList?.expenses, "Hhahahahahahahahah");
  const totalAmount = expenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      let currentUser;
      try {
        currentUser = await User.me();
      } catch {
        currentUser = {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          current_trip_id: 1,
          trip_role: "admin",
        };
      }
      setUser(currentUser);

      if (!currentUser.current_trip_id) {
        navigate(createPageUrl("MyTrips"));
        return;
      }

      let currentTrip;
      try {
        currentTrip = await Trip.get(currentUser.current_trip_id);
      } catch {
        currentTrip = {
          id: 1,
          occasion: "Beach Vacation",
          destination: "Maldives",
          invite_code: "XYZ123",
        };
      }
      setTrip(currentTrip);

      let tripExpenses, tripContributions, allUsers;
      try {
        [tripExpenses, tripContributions, allUsers] = await Promise.all([
          Expense.filter({ trip_id: currentTrip.id }),
          Contribution.filter({ trip_id: currentTrip.id }),
          User.filter({ current_trip_id: currentTrip.id }),
        ]);
      } catch {
        tripExpenses = [
          { id: 1, description: "Hotel", amount: 200 },
          { id: 2, description: "Food", amount: 150 },
        ];
        tripContributions = [
          { id: 1, user_id: 1, amount_paid: 250 },
          { id: 2, user_id: 2, amount_paid: 100 },
        ];
        allUsers = [
          { id: 1, name: "John Doe" },
          { id: 2, name: "Jane Smith" },
        ];
      }

      setExpenses(tripExpenses);
      setContributions(tripContributions);
      setParticipants(allUsers);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  };

  const handleShareInvite = async () => {
    if (!trip) return;

    const inviteUrl = `${window.location.origin}/functions/tripInvitePreview?trip_id=${trip.id}&code=${trip.invite_code}`;

    const fallbackShare = async (urlToCopy) => {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${trip.occasion}`,
          text: `You're invited to join our trip to ${trip.destination}!`,
          url: inviteUrl,
        });
        setCopied(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          fallbackShare(inviteUrl);
        }
      }
    } else {
      fallbackShare(inviteUrl);
    }
  };

  const getTotalContributed = () => {
    return contributions.reduce((sum, contrib) => sum + contrib.amount_paid, 0);
  };

  const getMyContribution = () => {
    return contributions.find((c) => c.user_id === user?.id);
  };

  const handleStartEdit = (expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setIsEditModalOpen(false);
  };

  const handleEditExpense = (updatedExpense) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
    );
    handleCancelEdit();
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [...prev, newExpense]);
  };

  const isAdmin = user?.trip_role === "admin";
  const totalContributed = getTotalContributed();
  const myContribution = getMyContribution();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            No Active Trip
          </h2>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back to Dashboard Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/60">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
                <Badge
                  className={`${
                    isAdmin
                      ? "bg-coral-100 text-coral-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {isAdmin ? "Admin - Can Manage" : "Participant - View Only"}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Trip Expenses
              </h1>
              <p className="text-xl text-slate-600">
                {tripParticipantsNumber} participants
              </p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <Calculator className="w-5 h-5 text-green-600" />
                Total Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                ${tripData?.total_goal}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Contributed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                ${tripData?.contributed}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {totalAmount > 0
                  ? `${((totalContributed / totalAmount) * 100).toFixed(
                      1
                    )}% of goal`
                  : "0% of goal"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <Users className="w-5 h-5 text-purple-600" />
                Per Person
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                ${tripData?.per_person}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Split {participants.length} ways
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <DollarSign className="w-5 h-5 text-coral-600" />
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-coral-600">
                ${tripData?.remaining}
              </p>
              <p className="text-sm text-slate-500 mt-1">Still needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Group Progress */}
        {tripData?.total_goal > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Group Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Contributed</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${tripData?.contributed.toFixed(2)} / $
                    {tripData?.total_goal.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={
                    tripData?.total_goal > 0
                      ? (tripData?.contributed / tripData?.total_goal) * 100
                      : 0
                  }
                  className="h-4"
                />
                <p className="text-sm text-slate-500">
                  {((totalContributed / totalAmount) * 100).toFixed(1)}% of
                  total goal reached
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content: Expenses List */}
        <div>
          {tripExpensesList && (
            <ExpenseList
              expenses={tripExpensesList}
              isAdmin={isAdmin}
              onEdit={handleStartEdit}
              onDelete={handleDeleteExpense}
              onAdd={handleAddExpense}
            />
          )}
        </div>

        {/* Edit Expense Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                Edit Expense
              </DialogTitle>
            </DialogHeader>
            {editingExpense && (
              <ExpenseForm
                expense={editingExpense}
                onSubmit={handleEditExpense}
                onCancel={handleCancelEdit}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
