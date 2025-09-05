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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExpenseByIdService,
  getExpenseByTripIdService,
  getExpenseListService,
  updateExpenseService,
} from "@/services/expense";
import { useDispatch, useSelector } from "react-redux";
import { totalParticipantsService } from "@/services/participant";
import { setExpensesList } from "@/store/expenseSlice";
import { toast } from "sonner";

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
  // const [user, setUser] = useState(null);
  const trip = useSelector((state) => state.trips.myTrips || []);

  // const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const user = useSelector((state) => state.user.user);

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
  const queryClient = useQueryClient();

  const getTotalContributed = () => {
    return contributions.reduce((sum, contrib) => sum + contrib.amount_paid, 0);
  };

  const getMyContribution = () => {
    return contributions.find((c) => c.user_id === user?.id);
  };

  const handleStartEdit = async (expense) => {
    try {
      const res = await getExpenseByIdService(token, expense.id);
      setEditingExpense(res.data);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch expense by id:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setIsEditModalOpen(false);
  };

  const handleEditExpense = async (formData) => {
    if (!editingExpense) return;
    try {
      await updateExpenseService(token, editingExpense.id, {
        ...formData, // ✅ includes description now
        tripId,
      });

      // ✅ Invalidate queries after update
      queryClient.invalidateQueries(["getExpenseByTripIdService", tripId]);
      queryClient.invalidateQueries(["getExpenseListQuery", tripId]);
      queryClient.invalidateQueries(["totalParticipantsService"]);

      toast.success("Expense updated successfully!");
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [...prev, newExpense]);

    // ✅ Invalidate react-query caches so data is fresh
    queryClient.invalidateQueries(["getExpenseByTripIdService", tripId]);
    queryClient.invalidateQueries(["getExpenseListQuery", tripId]);

    // ✅ Also return success so ExpenseList knows to reset/close form
    return true;
  };
  console.log("user?.trip_role", user?.trip_role);

  const isAdmin = user?.trip_role === "creator";
  const totalContributed = getTotalContributed();
  const myContribution = getMyContribution();
  console.log("EpenrIsAdmin", isAdmin);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

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

  console.log("tripData", tripData);

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

          {/* Contributed Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Contributed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-blue-600">
                Base: ${(tripData?.baseAmountContributed ?? 0).toFixed(2)}
              </p>
              <p className="text-2xl font-semibold text-green-600">
                Total Paid: $
                {(tripData?.totalChargeContributed ?? 0).toFixed(2)}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {tripData?.total_goal > 0
                  ? `${(
                      (tripData?.baseAmountContributed / tripData?.total_goal) *
                      100
                    ).toFixed(1)}% of goal`
                  : "0% of goal"}
              </p>
            </CardContent>
          </Card>

          {/* Remaining Card */}
          {/* <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-700">
                <DollarSign className="w-5 h-5 text-coral-600" />
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tripData?.remaining > 0 ? (
                <>
                  <p className="text-3xl font-bold text-coral-600">
                    ${(tripData?.remaining ?? 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Still needed</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-green-600">Paid ✅</p>
              )}
            </CardContent>
          </Card> */}

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
                    ${(tripData?.baseAmountContributed ?? 0).toFixed(2)} / $
                    {(tripData?.total_goal ?? 0).toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={
                    tripData?.total_goal > 0
                      ? ((tripData?.baseAmountContributed ?? 0) /
                          (tripData?.total_goal ?? 1)) *
                        100
                      : 0
                  }
                  className="h-4"
                />
                <p className="text-sm text-slate-500">
                  {tripData?.total_goal > 0
                    ? (
                        ((tripData?.baseAmountContributed ?? 0) /
                          (tripData?.total_goal ?? 1)) *
                        100
                      ).toFixed(1)
                    : 0}
                  % of total goal reached
                </p>
                {tripData?.totalChargeContributed > 0 && (
                  <p className="text-sm text-slate-400">
                    Including platform fees: $
                    {(tripData?.totalChargeContributed ?? 0).toFixed(2)}
                  </p>
                )}
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
