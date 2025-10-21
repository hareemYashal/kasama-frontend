import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Users, CreditCard, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);

  // ✅ Auto redirect if logged in
  useEffect(() => {
    if (user) {
      navigate("/DashboardHome");
    }
  }, [user, navigate]);

  const slides = [
    {
      headline: "Travel Plans Made Simple, TOGETHER!",
      subheadline: "Set goals and track each other's progress.",
      description:
        "Kasama brings your travel group together in one shared space where everyone can see the progress and contribute toward your dream trip.",
      icon: Users,
    },
    {
      headline: "Invite Your Crew and Start Planning",
      subheadline: "One click brings everyone together.",
      description:
        "Generate a unique invite link and watch your friends join instantly. No more endless group chats or scattered planning across different apps.",
      icon: MapPin,
    },
    {
      headline: "Contribute with Ease",
      subheadline: "Admins manage bookings.",
      description:
        "Track contributions transparently while trip admins handle all the logistics. Everyone knows exactly where the group stands financially.",
      icon: CreditCard,
    },
  ];

  const handleGetStarted = () => {
    navigate("/register"); // Always go to register
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  // Auto slide change every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex-[2]"></div>
            <div className="text-center mb-8 md:mb-12 flex-[6]">
              <div className="flex justify-center mb-6">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1a2d053ba_fa5be6e8-a9dd-4d0c-bc53-217d1bdfa693.png"
                  alt="Kasama Logo"
                  className="w-20 h-20 rounded-full"
                />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Kasama</h1>
              <p className="text-base md:text-lg text-blue-200">
                Group Travel Planning Made Simple
              </p>
            </div>
            <div className="flex gap-4 flex-[2]">
              <Link to="/login">
                <button className="bg-gradient-to-r from-coral-500 to-pink-500 hover:from-coral-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="bg-white text-coral-500 font-semibold py-2 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all duration-300">
                  Register
                </button>
              </Link>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-12 shadow-2xl border border-white/20">
            <div
              className="relative overflow-hidden"
              onTouchStart={(e) => {
                const touchStart = e.touches[0].clientX;
                e.currentTarget.setAttribute("data-touch-start", touchStart.toString());
              }}
              onTouchEnd={(e) => {
                const touchStart = parseFloat(e.currentTarget.getAttribute("data-touch-start") || "0");
                if (isNaN(touchStart)) return;
                const touchEnd = e.changedTouches[0].clientX;
                const diff = touchStart - touchEnd;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) nextSlide();
                  else prevSlide();
                }
              }}
            >
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0 text-center px-2">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
                        <slide.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{slide.headline}</h2>
                    <p className="text-lg sm:text-xl md:text-2xl text-blue-200 mb-6 font-medium">{slide.subheadline}</p>
                    <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">{slide.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full items-center justify-center transition-all duration-200 backdrop-blur-sm hidden md:flex"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full items-center justify-center transition-all duration-200 backdrop-blur-sm hidden md:flex"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide ? "bg-coral-500 scale-125" : "bg-white/40 hover:bg-white/60"}`}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 md:mt-12 text-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-coral-500 to-pink-500 hover:from-coral-600 hover:to-pink-600 text-white px-8 py-4 text-lg md:px-12 md:py-6 md:text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={handleGetStarted}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </>
                )}
              </Button>
              <p className="text-sm text-blue-200 mt-4">Join thousands planning their next adventure together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
