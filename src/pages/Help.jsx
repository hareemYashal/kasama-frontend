import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InvokeLLM } from "@/api/integrations";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HelpCircle, Send, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import BackButton from "@/components/ui/BackButton";

const KASAMA_KNOWLEDGE_BASE = `
You are Kasama, an AI assistant for a group travel planning app. Your goal is to answer user questions based on the app's features.

**Key Features:**
- **Trip Creation:** An admin creates a trip, setting the occasion, destination, and dates. They receive an invite link.
- **Roles:**
  - **Admin:** Full control. Manages expenses, itinerary, participants, and settings.
  - **Participant:** View-only access for most things. Can contribute money, chat, and view itinerary/expenses.
- **Invite System:** Admins share a unique link to invite participants. Joining is automatic upon accepting the invite.
- **Dashboard:** A central hub showing trip details, a welcome message from the admin, a countdown, and an activity feed.
- **Itinerary:** Admins build a day-by-day schedule. Participants can only view it.
- **Expenses & Contributions:** Admins add expenses, which are then split equally among all participants. This creates a 'goal amount' for each person.
- **Payments:** Users can make one-time payments or set up auto-payments to cover their contribution goal. We use Stripe for processing, which includes a standard processing fee.
- **Pay for a Friend:** Users can make payments on behalf of another participant in the trip.
- **Chat:** A group chat for all trip members.
- **Activity Feed:** A log of important actions, like joining, making payments, or itinerary updates.
- **Profile:** Users can update their personal info and emergency contacts.
`;

export default function Help() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock user for now
    const fetchUser = async () => {
      try {
        // Replace this with your actual API call if available
        const currentUser = {
          id: "123",
          name: "John Doe",
          trip_role: "participant", // or 'admin'
        };
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse("");

    try {
      const userRole = user?.trip_role === "creator" || user?.trip_role === "co-admin" || "participant";
      const prompt = `
        ${KASAMA_KNOWLEDGE_BASE}
        ---
        The user has the role: **${userRole}**.
        Based on all the information above, please answer the following question clearly and concisely.
        If you suggest an action, you can add a link like this: [Link Text](PageName). For example: [Go to Payments](Payments).

        User Question: "${question}"
      `;

      const aiResponse = await InvokeLLM({ prompt });
      setResponse(aiResponse);
    } catch (err) {
      console.error("Error invoking LLM:", err);
      setError(
        "Sorry, the AI assistant is currently unavailable. Please try again later."
      );
    }

    setIsLoading(false);
  };

  const handleLinkClick = (e) => {
    if (e.target.tagName === "A") {
      e.preventDefault();
      const pageName = e.target.getAttribute("href");
      if (pageName) navigate(createPageUrl(pageName));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <BackButton />

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-800">Help Center</h1>
          <p className="text-xl text-slate-600 mt-2">
            How can we help you today?
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask a question about using Kasama..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
            className="text-lg py-6"
            disabled={isLoading}
          />
          <Button
            onClick={handleAskQuestion}
            disabled={isLoading || !question.trim()}
            className="py-6 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="text-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-slate-600">Finding an answer for you...</p>
          </div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-600">{error}</CardContent>
          </Card>
        )}

        {response && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none" onClick={handleLinkClick}>
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        {...props}
                      />
                    ),
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {!response && !isLoading && !error && (
          <Card className="bg-white/80 backdrop-blur-sm text-center py-12">
            <CardContent>
              <p className="text-slate-500">
                Ask a question to get started. For example: "How do I pay for my
                trip?" or "How do I add an expense?"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
