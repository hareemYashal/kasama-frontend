import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, FileText, Users, CreditCard, AlertTriangle, Lock, Database, Cookie, Eye, Baby, Globe } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export default function Policies() {
  const [openItems, setOpenItems] = useState("");

  const policyItems = [
    {
      id: "terms",
      title: "Terms & Conditions",
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Welcome to Kasama! By using our group travel planning platform, you agree to these terms and conditions. 
            Please read them carefully as they govern your use of our service.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Eligibility</h4>
              <p className="text-slate-700">You must be at least 18 years old to create an account and use Kasama's services.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Service Description</h4>
              <p className="text-slate-700">
                Kasama is a platform that helps groups plan, organize, and fund shared travel experiences. We provide tools 
                for trip coordination, expense tracking, contribution management, and group communication.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">User Responsibilities</h4>
              <p className="text-slate-700">
                Trip administrators are solely responsible for managing their trips, including expense allocation, fund withdrawals, 
                and trip execution. Kasama serves as a coordination platform and is not responsible for actual travel arrangements, 
                bookings, or the outcome of any trip.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Platform Modifications</h4>
              <p className="text-slate-700">
                We reserve the right to modify, suspend, or discontinue any part of our service at any time with reasonable notice.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: <Lock className="w-5 h-5 text-green-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Information We Collect</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Personal details: name, email address, phone number</li>
                <li>Emergency contact information (optional)</li>
                <li>Trip-related data: contributions, expenses, chat messages</li>
                <li>Usage analytics and platform activity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">How We Use Your Data</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>To provide and improve our platform services</li>
                <li>To facilitate communication between trip members</li>
                <li>To process payments and manage financial transactions</li>
                <li>To send important updates about your trips</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Data Sharing</h4>
              <p className="text-slate-700">
                We may share anonymized, aggregated data with third parties for analytics and business insights. 
                Your personally identifiable information is never sold or shared without your explicit consent, 
                except as required by law or to provide our core services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Data Security</h4>
              <p className="text-slate-700">
                We use industry-standard encryption, secure servers, and access controls to protect your information. 
                However, no system is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "user-agreement",
      title: "User Responsibilities & Conduct",
      icon: <Users className="w-5 h-5 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Account Responsibilities</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Provide accurate and up-to-date information</li>
                <li>Keep your account credentials secure</li>
                <li>Maintain current emergency contact details</li>
                <li>Use the platform in good faith for legitimate travel planning</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Trip Administrator Duties</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Accurately set and manage trip expenses</li>
                <li>Responsibly handle group funds and withdrawals</li>
                <li>Communicate clearly with trip participants</li>
                <li>Make reasonable efforts to execute planned trips</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Participant Obligations</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Contribute funds as agreed upon</li>
                <li>Respect other group members in communications</li>
                <li>Provide feedback and updates when requested</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Prohibited Conduct</h4>
              <p className="text-slate-700">Users may not engage in:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 mt-2">
                <li>Fraudulent or deceptive behavior</li>
                <li>Harassment, abuse, or inappropriate conduct</li>
                <li>Spam, impersonation, or fake accounts</li>
                <li>Any illegal activities through our platform</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "payment-terms",
      title: "Payment Terms & Platform Fees",
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Transaction Fees</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Stripe processing fees apply to all payments (2.9% + 30¢ for cards, 0.8% capped at $5 for ACH)</li>
                <li>$1.00 Kasama platform fee per transaction</li>
                <li>All fees are clearly displayed before payment confirmation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Fund Management</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Only trip administrators can withdraw collected funds</li>
                <li>Funds are held securely through Stripe Connect</li>
                <li>Contributions are tied to specific trips and cannot be transferred</li>
                <li>Payment methods are stored securely and never visible to other users</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Refund Policy</h4>
              <p className="text-slate-700">
                Refunds are generally not available except in cases of trip cancellation by the administrator. 
                In such cases, a 10% cancellation fee may apply to cover processing and operational costs.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "cancellation",
      title: "Trip Cancellation Policy",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Cancellation Authority</h4>
              <p className="text-slate-700">
                Only trip administrators have the authority to cancel trips through the platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Cancellation Fee</h4>
              <p className="text-slate-700">
                A 10% fee is applied to the total funds collected when a trip is cancelled. This fee covers 
                operational costs and helps maintain the integrity of trip commitments on our platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Fund Distribution</h4>
              <p className="text-slate-700">
                After the cancellation fee is deducted, remaining funds are made available for withdrawal by 
                the trip administrator, who is responsible for distributing refunds to participants as appropriate.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Notification</h4>
              <p className="text-slate-700">
                All trip participants are automatically notified when a trip is cancelled through the platform.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution",
      icon: <Shield className="w-5 h-5 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Arbitration Agreement</h4>
              <p className="text-slate-700">
                By using Kasama, you agree that any disputes arising from your use of our platform will be 
                resolved through binding arbitration in the State of California, rather than in court.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Class Action Waiver</h4>
              <p className="text-slate-700">
                You waive your right to participate in class action lawsuits against Kasama. Disputes must be 
                resolved on an individual basis through the arbitration process.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Governing Law</h4>
              <p className="text-slate-700">
                These terms and any disputes will be governed by the laws of the State of California, 
                without regard to conflict of law principles.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: <Eye className="w-5 h-5 text-teal-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700">
            To maintain a safe and positive environment for all users, the following activities are prohibited:
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Prohibited Activities</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>Using the platform for fraudulent schemes or financial scams</li>
                <li>Creating fake trips or misleading other users about trip details</li>
                <li>Harassment, bullying, or abusive behavior toward other users</li>
                <li>Sending spam invitations or creating multiple fake accounts</li>
                <li>Attempting to hack, disrupt, or compromise platform security</li>
                <li>Using automated tools to scrape data or overload our systems</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Enforcement</h4>
              <p className="text-slate-700">
                Violations of this policy may result in warnings, temporary suspension, or permanent account termination. 
                We reserve the right to take appropriate action to protect our community and platform integrity.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "emergency-contact",
      title: "Emergency Contact Disclaimer",
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Emergency contact information is provided voluntarily by users for coordination purposes among trip participants.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">No Verification</h4>
              <p className="text-slate-700">
                Kasama does not verify the accuracy or validity of emergency contact information provided by users.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">No Emergency Response</h4>
              <p className="text-slate-700">
                Kasama is not an emergency response service and does not monitor or respond to emergency situations. 
                In case of emergency, contact local emergency services immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">User Responsibility</h4>
              <p className="text-slate-700">
                Users are responsible for keeping their emergency contact information current and for informing 
                their emergency contacts about their travel plans independently.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "data-security",
      title: "Data Security Measures",
      icon: <Database className="w-5 h-5 text-cyan-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Security Protocols</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure cloud infrastructure with regular security updates</li>
                <li>Encrypted storage of sensitive information</li>
                <li>Regular security audits and vulnerability assessments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Payment Security</h4>
              <p className="text-slate-700">
                All payment processing is handled through Stripe, a PCI DSS compliant payment processor. 
                Kasama never stores or has access to your full payment card details.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Account Security</h4>
              <p className="text-slate-700">
                Users are responsible for maintaining the confidentiality of their account credentials and 
                for all activities that occur under their account.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "data-retention",
      title: "Data Retention & Deletion",
      icon: <Database className="w-5 h-5 text-slate-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Active Account Data</h4>
              <p className="text-slate-700">
                Your profile information, trip data, and platform activity are retained while your account remains active.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Account Deletion</h4>
              <p className="text-slate-700">
                You may request account deletion at any time by contacting our support team. Most personal data 
                will be permanently deleted within 30 days of your request.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Legal Retention Requirements</h4>
              <p className="text-slate-700">
                Some transaction records and financial data may be retained longer for legal, regulatory, 
                or tax compliance purposes as required by law.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Anonymized Data</h4>
              <p className="text-slate-700">
                Aggregated, anonymized usage data may be retained indefinitely for analytics and platform improvement purposes.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "cookies",
      title: "Cookie Policy",
      icon: <Cookie className="w-5 h-5 text-amber-700" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700">
            Kasama uses cookies and similar technologies to provide and improve our services.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Types of Cookies</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality and security</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and customizations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Cookie Management</h4>
              <p className="text-slate-700">
                You can control cookie settings through your browser preferences. Note that disabling certain 
                cookies may affect platform functionality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Consent</h4>
              <p className="text-slate-700">
                By using Kasama, you consent to our use of cookies as described in this policy.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "accessibility",
      title: "Accessibility Commitment",
      icon: <Globe className="w-5 h-5 text-blue-700" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700">
            Kasama is committed to making our platform accessible to all users, regardless of ability or technology.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Accessibility Standards</h4>
              <p className="text-slate-700">
                We strive to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards and 
                continuously work to improve the accessibility of our platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Responsive Design</h4>
              <p className="text-slate-700">
                Our platform is designed to work across all devices and screen sizes, from mobile phones to desktop computers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Feedback</h4>
              <p className="text-slate-700">
                If you encounter accessibility barriers or have suggestions for improvement, please contact our support team. 
                We welcome feedback and are committed to making necessary improvements.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "third-party",
      title: "Third-Party Services",
      icon: <Globe className="w-5 h-5 text-green-700" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-700">
            Kasama integrates with several third-party services to provide our platform functionality.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Payment Processing</h4>
              <p className="text-slate-700">
                <strong>Stripe:</strong> Handles all payment processing, including card and bank account transactions. 
                Stripe may collect and use data according to their own privacy policy.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Analytics & Performance</h4>
              <p className="text-slate-700">
                We use analytics tools to understand platform usage and improve user experience. 
                These tools may collect anonymized usage data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">External Resources</h4>
              <p className="text-slate-700">
                Our platform may load fonts, icons, or other resources from external content delivery networks 
                to ensure optimal performance and appearance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Independent Privacy Policies</h4>
              <p className="text-slate-700">
                Each third-party service operates under its own privacy policy and terms of service. 
                We encourage you to review these policies for services you interact with through our platform.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "children-privacy",
      title: "Children's Privacy Protection",
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Age Restriction</h4>
              <p className="text-slate-700">
                Kasama is not intended for use by children under 13 years of age. We do not knowingly collect 
                personal information from children under 13.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">COPPA Compliance</h4>
              <p className="text-slate-700">
                Our platform complies with the Children's Online Privacy Protection Act (COPPA). If we discover 
                that we have collected information from a child under 13, we will delete it promptly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Parental Notice</h4>
              <p className="text-slate-700">
                If you are a parent or guardian and believe your child has created an account or provided 
                information to us, please contact our support team immediately for account removal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Teen Users (13-17)</h4>
              <p className="text-slate-700">
                Users between 13-17 years old may use the platform with parental consent, but cannot create 
                trips or handle financial transactions without adult supervision.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "platform-protection",
      title: "Platform Protection & Updates",
      icon: <Shield className="w-5 h-5 text-red-700" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Service Availability</h4>
              <p className="text-slate-700">
                While we strive for maximum uptime, Kasama reserves the right to restrict, suspend, or terminate 
                access to our platform at any time for maintenance, security, or operational reasons.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Account Suspension</h4>
              <p className="text-slate-700">
                We may suspend or terminate user accounts for violations of our terms, suspected abuse, 
                fraudulent activity, or other threats to platform integrity and user safety.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Policy Updates</h4>
              <p className="text-slate-700">
                We may update these policies from time to time to reflect changes in our practices or legal requirements. 
                Continued use of the platform after updates constitutes acceptance of the revised terms.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Force Majeure</h4>
              <p className="text-slate-700">
                Kasama is not liable for service interruptions caused by circumstances beyond our reasonable control, 
                including natural disasters, government actions, or infrastructure failures.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Limitation of Liability</h4>
              <p className="text-slate-700">
                Kasama's liability for any damages arising from platform use is limited to the amount of fees 
                paid by the user in the 12 months preceding the claim.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
         <BackButton />
      <div className="max-w-4xl mx-auto space-y-8 mt-5">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Kasama Policies</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Please review our terms, privacy practices, and policies to understand how Kasama works and your rights as a user.
          </p>
        </div>

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Last updated: January 2025
          </p>
        </div>

        {/* Policies Accordion */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800 text-center">
              Legal Information & User Agreements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion 
              type="single" 
              collapsible 
              value={openItems} 
              onValueChange={setOpenItems}
              className="space-y-4"
            >
              {policyItems.map((item) => (
                <AccordionItem 
                  key={item.id} 
                  value={item.id}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-lg font-semibold text-slate-800">{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 bg-slate-50/50">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Questions About Our Policies?</h3>
            <p className="text-slate-600 mb-4">
              If you have questions about these policies or need clarification on any terms, 
              please don't hesitate to reach out to our support team.
            </p>
            <p className="text-sm text-slate-500">
              For policy questions or concerns, contact us through the Feedback page or help center.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}