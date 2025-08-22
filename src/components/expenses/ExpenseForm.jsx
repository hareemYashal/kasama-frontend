import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Save, X } from "lucide-react";

export default function ExpenseForm({ expense, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name || "",
        amount: expense.amount?.toString() || "",
        description: expense.description || "",
      });
    } else {
      setFormData({
        name: "",
        amount: "",
        description: "",
      });
    }
  }, [expense]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Expense name is required";
    }

    if (
      !formData.amount ||
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Valid amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
    }
  };
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <DollarSign className="w-5 h-5 text-green-600" />
          {expense ? "Edit Expense" : "Add New Expense"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="name"
                className="text-base font-semibold text-slate-700"
              >
                Expense Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Flights, Hotel, Car Rental"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className={`mt-2 ${
                  errors.name ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="amount"
                className="text-base font-semibold text-slate-700"
              >
                Amount *
              </Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => updateFormData("amount", e.target.value)}
                  className={`pl-10 ${
                    errors.amount ? "border-red-500" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="description"
              className="text-base font-semibold text-slate-700"
            >
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add details about this expense..."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              className="mt-2 border-slate-200 min-h-24"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {expense ? "Update Expense" : "Add Expense"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
