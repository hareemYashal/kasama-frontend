import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, CheckCircle, ExternalLink } from "lucide-react";

export default function PoliciesAgreement() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAgree = async () => {
    if (!agreed) return;
    
    setLoading(true);
    try {
      // Update user's agreement status
      await User.updateMyUserData({
        agreed_to_terms: true,
        terms_agreed_at: new Date().toISOString()
      });

      // Navigate to trip creation or dashboard
      navigate(createPageUrl("TripCreation"));
    } catch (error) {
      console.error("Error updating user agreement:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-screen">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Welcome to Kasama!</CardTitle>
                <p className="text-blue-100 text-lg">Group Travel Planning Made Simple</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                Before You Get Started
              </h2>
              <p className="text-slate-600 leading-relaxed">
                To create your account and start planning amazing trips with friends, 
                please review and accept our terms and privacy policy.
              </p>
            </div>

            {/* Quick Policy Overview */}
            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Key Points:
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>You must be 18+ to use Kasama and manage trip finances</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Trip admins are responsible for managing group funds and trip execution</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>We use your data to provide services and may share anonymized analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Platform fees apply: Stripe processing fees + $1 Kasama fee per transaction</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Trip cancellations include a 10% fee to cover operational costs</span>
                </li>
              </ul>
            </div>

            {/* Agreement Checkbox */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 border-2 border-slate-200 rounded-xl">
                <Checkbox
                  id="terms-agreement"
                  checked={agreed}
                  onCheckedChange={setAgreed}
                  className="mt-1"
                />
                <label htmlFor="terms-agreement" className="text-slate-700 leading-relaxed cursor-pointer">
                  I have read and agree to the{" "}
                  <button
                    onClick={() => window.open(createPageUrl("Policies"), '_blank')}
                    className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                  >
                    Terms & Conditions and Privacy Policy
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  . I understand that Kasama is a coordination platform and that trip admins are responsible for trip execution and fund management.
                </label>
              </div>
              
              <Button
                onClick={handleAgree}
                disabled={!agreed || loading}
                className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <>
                    Accept & Continue
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-slate-500">
              <p>
                By clicking "Accept & Continue", you acknowledge that you have read, 
                understood, and agree to be bound by our terms of service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}