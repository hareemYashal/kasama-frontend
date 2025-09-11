"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmailVerifiedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-serif font-black text-foreground">
            Email Verified 🎉
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your email has been successfully verified. You can now login to your
            account.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <div
            onClick={() => {
              localStorage.removeItem("inviteData");
              navigate("/login");
            }}
            className="w-full"
          >
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
