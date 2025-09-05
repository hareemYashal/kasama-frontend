import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import StarRating from "../components/feedback/StarRating";

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback_type: "",
    message: "",
  });
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Dummy user
  useEffect(() => {
    const currentUser = {
      id: "123",
      full_name: "John Doe",
      email: "johndoe@example.com",
      current_trip_id: "trip_001",
    };
    setUser(currentUser);
    setFormData((prev) => ({
      ...prev,
      name: currentUser.full_name,
      email: currentUser.email,
    }));
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, feedback_type: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.feedback_type || !formData.message.trim()) {
      setError("Please select a feedback type and write a message.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // MOCK: simulate saving feedback
      console.log("Feedback saved:", {
        ...formData,
        rating,
        user_id: user?.id,
        trip_id: user?.current_trip_id,
      });

      // MOCK: simulate sending email
      console.log("Email sent to support@kasama.com", {
        ...formData,
        rating,
      });

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Sorry, something went wrong. Please try again later.");
    }

    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center bg-white/80 backdrop-blur-sm shadow-xl p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-800">Thank you!</h1>
          <p className="text-slate-600 mt-2 mb-8">
            Your feedback has been submitted successfully. Our team will review it shortly.
          </p>
          <Button onClick={() => navigate(createPageUrl("mytrips"))}>
            Back to Trips
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Have a bug to report or a feature to request? We'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="feedback_type">Feedback Type *</Label>
                <Select
                  onValueChange={handleSelectChange}
                  value={formData.feedback_type}
                >
                  <SelectTrigger id="feedback_type">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug Report">Bug Report</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Payment Issue">Payment Issue</SelectItem>
                    <SelectItem value="General Feedback">General Feedback</SelectItem>
                    <SelectItem value="Account/Login Problem">Account/Login Problem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Feedback Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe the issue or your suggestion in detail."
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  required
                />
              </div>

              {/* Star Rating Section */}
              <div className="pt-4 border-t border-slate-200/60">
                <Label className="font-semibold text-slate-700">
                  How would you rate your experience with Kasama?
                </Label>
                <div className="mt-2">
                  <StarRating onRatingChange={setRating} />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-slate-500">
                  Still need help?{" "}
                  <a
                    href="mailto:support@kasama.com"
                    className="text-blue-600 hover:underline"
                  >
                    Contact Support
                  </a>
                </p>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Feedback
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
