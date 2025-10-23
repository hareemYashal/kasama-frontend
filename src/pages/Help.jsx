import React, { useState } from "react";
import {
  ChevronDown,
  CircleHelp,
  User,
  Calendar,
  CreditCard,
  Bell,
  HelpCircle,
  Lock,
  MoreHorizontal,
  MapPin,
  Wrench,
  Shield,
  Archive,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/ui/BackButton";

// Single Category Component
function FaqCategory({ title, faqs, Icon, iconColor }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full space-y-2">
      <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-3">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        {title}
      </h2>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="flex">
            <button
              type="button"
              onClick={() => toggleIndex(index)}
              className={`flex flex-1 items-center justify-between transition-all px-6 py-4 text-left font-medium text-slate-800 hover:no-underline ${
                openIndex === index ? "open" : ""
              }`}
            >
              {faq.question}
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
          </h3>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-4 pt-0 text-slate-600 leading-relaxed text-sm">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Help Component with multiple categories
export default function Help() {
  const categories = [
    {
      title: "General Questions",
      faqs: [
        {
          question: "What is Kasama?",
          answer:
            "Kasama is an all-in-one platform that helps you plan, save, and organize group trips — whether with friends, family, or coworkers. You can create a trip, invite people with one link, set goals, track contributions, and manage everything together.",
        },
        {
          question: "How is Kasama different from other travel apps?",
          answer:
            "Unlike sites like Expedia or Splitwise, Kasama combines group planning, budgeting, saving, and coordination into one simple space. You can track who paid, chat with your group, and stay fully transparent.",
        },
        {
          question: "What does “Kasama” mean?",
          answer:
            "“Kasama” means together or companion in Filipino — representing unity, connection, and shared experiences.",
        },
        {
          question: "Do I need to download the app?",
          answer:
            "Not yet — Kasama is currently a web app that’s fully mobile-friendly. The iOS and Android versions are coming soon.",
        },
      ],
      Icon: CircleHelp,
      iconColor: "text-blue-600",
    },
    {
      title: "Account & Profile",
      faqs: [
        {
          question: "How do I create an account?",
          answer:
            ".Click Sign Up on the homepage and fill out your details to start planning or joining trips.",
        },
        {
          question: "Can I edit my profile later?",
          answer:
            "Yes. Go to My Profile to update your information, photo, and emergency contact.",
        },
        {
          question: "What if I forget my password?",
          answer:
            "Click Forgot Password on the login page and follow the email instructions.",
        },
        {
          question: "Why do you ask for an emergency contact?",
          answer:
            "It’s optional but helpful for safety during trips. Admins can access it in emergencies.",
        },
      ],
      Icon: User,
      iconColor: "text-purple-600",
    },
    {
      title: "Trip Planning",
      faqs: [
        {
          question: "How do I start a trip?",
          answer:
            "Click Start a Trip, fill out your destination, travel dates, and budget. Once created, your trip dashboard will appear.",
        },
        {
          question: "How do I invite others?",
          answer:
            "Share your unique invite link with your friends — once they join, they’ll show up automatically in your participant list.",
        },
        {
          question: "Can I edit trip details later?",
          answer:
            "Yes. Admins can update trip details, itinerary, or budget anytime.",
        },
        {
          question: "Can I assign a co-admin?",
          answer:
            "Yes, the trip admin can assign a Co-Admin to help manage details and participants.",
        },
        {
          question: "What happens in the group chat?",
          answer:
            "You can chat, post polls, and make announcements. Everyone can react with emojis and vote.",
        },
      ],
      Icon: MapPin,
      iconColor: "text-green-600",
    },
    {
      title: "Savings & Payments",
      faqs: [
        {
          question: "How does contributing work?",
          answer:
            "Each trip has its own wallet. Members can make one-time or recurring payments via debit, credit, or ACH.",
        },
        {
          question: "Who can withdraw funds?",
          answer:
            "Only the Trip Admin can withdraw money. This keeps the process organized and secure.",
        },
        {
          question: "Are payments secure?",
          answer:
            "Yes. All transactions are processed through Stripe for safe, encrypted payments.",
        },
        {
          question: "What happens if someone leaves the trip?",
          answer:
            "If a participant cancels after contributing, a $10 flaker fee applies. The trip admin handles refunding their remaining balance.",
        },
        {
          question: "What if the entire group cancels?",
          answer:
            "If the group cancels, a $5 cancellation fee is charged to the trip wallet. The admin will process refunds for everyone.",
        },
        {
          question: "Who handles refunds?",
          answer:
            "Refunds are handled manually by the trip admin to ensure each person gets the correct amount back.",
        },
        {
          question: "Can I contribute to a specific expense?",
          answer: "Can I contribute to a specific expense?",
        },
      ],
      Icon: CreditCard,
      iconColor: "text-orange-600",
    },
    {
      title: "Communication & Notifications",
      faqs: [
        {
          question: "How do we stay connected?",
          answer:
            "Each trip has its own group chat where you can post updates, polls, and announcements.",
        },
        {
          question: "Do we get notifications?",
          answer:
            "Yes. You’ll receive notifications for: New members joining, Payments made, Poll votes, Announcements, Itinerary changes, Goal progress, Refunds.",
        },
        {
          question: "Can I mute notifications?",
          answer:
            "Yes. You can turn notifications on or off in your profile settings.",
        },
      ],
      Icon: Bell,
      iconColor: "text-red-600",
    },
    {
      title: "Support & Troubleshooting",
      faqs: [
        {
          question: "I found a bug. What should I do?",
          answer:
            "Go to the Help Center or email support@kasama.com with screenshots or details.",
        },
        {
          question: "How long does support take?",
          answer: "Usually 24–48 hours depending on the issue.",
        },
        {
          question: "My payment failed — what now?",
          answer:
            "Double-check your payment info or contact support to help resolve it.",
        },
      ],
      Icon: Wrench,
      iconColor: "text-slate-600",
    },
    {
      title: "Privacy & Security",
      faqs: [
        {
          question: "Is my data safe?",
          answer:
            "Yes. Kasama uses encrypted systems and secure infrastructure to protect your data.",
        },
        {
          question: "Does Kasama share my info?",
          answer:
            "No — your information is private and only used for your trips.",
        },
        {
          question: "Where can I read your terms?",
          answer:
            "The Terms of Service and Privacy Policy are at the bottom of the homepage and inside your dashboard.",
        },
      ],
      Icon: Shield,
      iconColor: "text-indigo-600",
    },
    {
      title: "Miscellaneous",
      faqs: [
        {
          question: "Is there a mobile app?",
          answer:
            "Not yet — the mobile app is in development. For now, the web app works seamlessly on any phone browser.",
        },
        {
          question: "Can I suggest new features?",
          answer:
            "Yes! Send feedback through your dashboard or contact support.",
        },
        {
          question: "What happens if the group cancels last minute?",
          answer:
            "A $5 group cancellation fee is applied. The admin refunds everyone from the remaining balance.",
        },
        {
          question: "What if I personally back out?",
          answer:
            "A $10 flaker fee applies. The trip admin refunds your remaining balance manually.",
        },
        {
          question: "What if someone leaves mid-trip?",
          answer:
            "The system marks them as “canceled,” applies the $10 fee, and the admin handles refunds accordingly.",
        },
      ],
      Icon: Archive,
      iconColor: "text-pink-600",
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <BackButton />
      <div className="max-w-4xl mx-auto space-y-8 mt-5">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-circle-help w-16 h-16 text-blue-600 mx-auto mb-4"
          >
            <circle cx={12} cy={12} r={10} />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <h1 className="text-4xl font-bold text-slate-800">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-600 mt-2">
            Find answers to common questions below.
          </p>
        </div>
        {categories.map((category, index) => (
          <FaqCategory
            key={index}
            title={category.title}
            faqs={category.faqs}
            Icon={category.Icon}
            iconColor={category.iconColor}
          />
        ))}
        <div className="text-center pt-8">
          <h3 className="text-xl font-semibold text-slate-700">
            Still have questions?
          </h3>
          <p className="text-slate-500 mt-2 mb-4">
            Our team is here to help. Submit your feedback or bug report.
          </p>
          <button
            onClick={() => navigate("/feedback")}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
