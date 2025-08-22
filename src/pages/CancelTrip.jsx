
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { Trip } from '@/api/entities';
import { Contribution } from '@/api/entities';
import { cancelTrip } from '@/api/functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft, Trash2 } from 'lucide-react';

export default function CancelTrip() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [trip, setTrip] = useState(null);
    const [totalContributed, setTotalContributed] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);

                if (!currentUser.current_trip_id) {
                    setError("No active trip selected.");
                    setLoading(false);
                    return;
                }
                
                if (currentUser.trip_role !== 'admin') {
                    setError("Only the trip admin can access this page.");
                    navigate(createPageUrl('Dashboard'));
                    return;
                }

                const currentTrip = await Trip.get(currentUser.current_trip_id);
                setTrip(currentTrip);
                
                if (currentTrip.status === 'cancelled') {
                    setSuccess("This trip has already been cancelled.");
                }

                const contributions = await Contribution.filter({ trip_id: currentTrip.id });
                const total = contributions.reduce((sum, c) => sum + c.amount_paid, 0);
                setTotalContributed(total);

            } catch (err) {
                setError("Failed to load trip data.");
                console.error(err);
            }
            setLoading(false);
        };

        loadData();
    }, [navigate]);

    const handleCancelTrip = async () => {
        if (!trip || !user) return;
        setIsCancelling(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await cancelTrip({ tripId: trip.id });

            if (response.data?.success) {
                setSuccess('Trip has been successfully cancelled. All participants have been notified and funds will be processed for refund.');
                setTimeout(() => {
                    navigate(createPageUrl('MyTrips'));
                }, 3000);
            } else {
                throw new Error(response.data?.error || 'Failed to cancel the trip.');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }
    
    const cancellationFee = totalContributed * 0.10;
    const refundAmount = totalContributed - cancellationFee;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <Button variant="outline" onClick={() => navigate(createPageUrl("Dashboard"))} className="bg-white/80">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Safety
                </Button>

                <Card className="bg-white/90 backdrop-blur-sm border-red-200/60 shadow-2xl shadow-red-500/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-3xl font-bold text-red-800">
                            <AlertCircle className="w-8 h-8" />
                            Cancel Trip
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {trip && <p className="text-xl text-slate-700">You are about to cancel the trip: <strong className="font-semibold">{trip.occasion}</strong></p>}

                        <Alert variant="destructive" className="bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold">Warning: This Action is Irreversible</AlertTitle>
                            <AlertDescription>
                                Canceling this trip will permanently end it for all participants. Any contributed funds will be processed for withdrawal, minus a 10% cancellation fee.
                            </AlertDescription>
                        </Alert>

                        <div className="text-center px-4">
                            <p className="text-sm text-slate-600 italic leading-relaxed">
                                We created Kasama to help people actually go on their trips — not just talk about them. The cancellation fee helps cover operational costs and keeps trip commitments real for everyone involved.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <h3 className="font-semibold text-lg text-slate-800 mb-4">Refund Calculation</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Total Funds Contributed:</span>
                                    <span className="font-semibold text-slate-800">${totalContributed.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Cancellation Fee (10%):</span>
                                    <span className="font-semibold text-red-600">-${cancellationFee.toFixed(2)}</span>
                                </div>
                                <hr/>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold text-slate-800">Estimated Net Refund:</span>
                                    <span className="font-bold text-green-600">${refundAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="bg-green-50 border-green-200 text-green-800">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    size="lg" 
                                    className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                                    disabled={isCancelling || success}
                                >
                                    {isCancelling ? (
                                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                    ) : (
                                        <Trash2 className="w-5 h-5 mr-2" />
                                    )}
                                    Proceed with Cancellation
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently cancel the trip <strong className="font-semibold">{trip?.occasion}</strong> and notify all participants.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCancelTrip} className="bg-red-600 hover:bg-red-700">
                                        Yes, Cancel This Trip
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
