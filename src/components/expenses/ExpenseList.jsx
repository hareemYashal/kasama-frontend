import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Edit, Trash2, Receipt, Plus, Save, X } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createExpenseService, deleteExpenseService } from "@/services/expense";
import { useDispatch, useSelector } from "react-redux";
import { deleteExpenseRed } from "@/store/expenseSlice";
import { toast } from "sonner";

export default function ExpenseList({
  expenses,
  isAdmin,
  onEdit,
  onDelete,
  onAdd,
  totalAmount,
}) {
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();
  let expenseMain = useSelector((state) => state.expenses.expensesList);
  console.log("totalAmount....", totalAmount);
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);

  const { mutate: addExpenseMutate } = useMutation({
    mutationFn: (data) => createExpenseService(token, data),
    onSuccess: (data) => {
      console.log(data);
      toast.success(data.message);
      queryClient.invalidateQueries(["getExpenseListQuery"]);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error);
    },
  });

  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newExpense = {
        expense_name: formData.name,
        expense_amount: parseFloat(formData.amount),
        description: formData.description, // ✅ required
        tripId,
      };

      const res = await createExpenseService(token, newExpense);

      const success = onAdd(res.data); // ✅ handleAddExpense runs
      if (success) {
        // ✅ Reset form
        setFormData({ name: "", amount: "", description: "" });
        // ✅ Close inline form
        setShowInlineForm(false);
      }
    } catch (error) {
      console.error("Error creating expense:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInlineCancel = () => {
    setFormData({ name: "", amount: "", description: "" });
    setShowInlineForm(false);
  };

  const getTotalAmount = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };
  const expensesList = useSelector((state) => state.expenses.expensesList);
  console.log(expensesList, "Hshshshshshsh");
  const dispatch = useDispatch();
  const { mutate } = useMutation({
    mutationFn: (expenseId) => deleteExpenseService(token, expenseId),
    onSuccess: (data, variables) => {
      dispatch(deleteExpenseRed(Number(variables)));
      console.log(variables, "000000");
      toast.success(data.message || "Expense deleted successfully!");
      setFormData({ name: "", amount: "" });
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    },
  });

  const handleDeleteExpense = (expenseId) => {
    console.log("Deleting expense:", expenseId);
    mutate(expenseId);
  };
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="justify-between text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-slate-800">
            <Receipt className="w-6 h-6 text-green-600" />
            Trip Expenses
          </CardTitle>
          {totalAmount > 0 && (
            <Badge
              variant="outline"
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-green-50 text-green-700 border-green-200 ml-2 text-xs sm:text-sm flex-shrink-0"
            >
              ${totalAmount.toFixed(2)} total
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {/* Expenses List */}
          {expenseMain &&
            expenseMain.map((expense, index) => (
              <div
                key={expense.id}
                className={`p-6 border-l-4 border-l-green-400 hover:bg-slate-50/60 transition-colors duration-200 ${
                  index < expenses.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-slate-800">
                        {expense?.expense_name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        ${expense?.expense_amount.toFixed(2)}
                      </Badge>
                    </div>

                    {expense.description && (
                      <div className="bg-slate-50 rounded-lg p-3 mt-3">
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {expense.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(expense)}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          handleDeleteExpense(expense.id);
                        }}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* Add Expense Section - Inline Toggle */}
          {isAdmin && (
            <div
              className={`border-l-4 border-l-blue-400 ${
                expenses.length > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              {!showInlineForm ? (
                <div className="p-6">
                  <Button
                    onClick={() => setShowInlineForm(true)}
                    variant="outline"
                    className="w-full border-dashed border-2 border-slate-300 hover:border-green-400 hover:bg-green-50 text-slate-600 hover:text-green-700 py-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Expense
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <form onSubmit={handleInlineSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Expense name (e.g., Flights, Hotel)"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="border-slate-300"
                        autoFocus
                      />
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          className="pl-10 border-slate-300"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <Input
                          placeholder="Description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleInlineCancel}
                        disabled={submitting}
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          !formData.name.trim() ||
                          !formData.amount ||
                          parseFloat(formData.amount) <= 0 ||
                          !formData.description?.trim() ||
                          submitting
                        }
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-1" />
                        )}
                        Add
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {expenses.length === 0 && !isAdmin && (
            <div className="py-16 text-center">
              <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No expenses added yet
              </h3>
              <p className="text-slate-500">
                The trip admin hasn't added any expenses yet
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
