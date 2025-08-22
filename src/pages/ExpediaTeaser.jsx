import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ExpediaTeaser() {
  const navigate = useNavigate();

  const goBack = () => {
    // This will attempt to go back to the previous page in history, 
    // or navigate to a safe default if history isn't available.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(createPageUrl('MyTrips'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center bg-white/80 backdrop-blur-sm p-8 md:p-16 rounded-3xl shadow-2xl border border-slate-200/60">
        
        <div className="mb-8">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1a2d053ba_fa5be6e8-a9dd-4d0c-bc53-217d1bdfa693.png" alt="Kasama Logo" className="w-20 h-20 rounded-full mx-auto mb-4 shadow-lg" />
            <div className="flex items-center justify-center gap-4 text-slate-400">
                <span className="font-bold text-2xl text-slate-800">Kasama</span>
                <span className="text-xl">+</span>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Expedia_Group_logo.svg/1280px-Expedia_Group_logo.svg.png" alt="Expedia Logo" className="h-6" />
            </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6">
          Kasama x Expedia is Coming Soon
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
          Soon you’ll be able to use your saved contributions to book hotels, flights, and activities directly through our partnership with Expedia — all without leaving Kasama.
        </p>

        <Button
          disabled
          size="lg"
          className="bg-slate-300 text-slate-500 cursor-not-allowed w-full md:w-auto px-12 py-7 text-lg"
        >
          Coming Soon
        </Button>
      </div>
      
      <div className="mt-8">
        <Button variant="ghost" onClick={goBack} className="text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}