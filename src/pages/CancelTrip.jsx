import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useQuery, useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {createPageUrl} from "@/utils";
import {deleteTripService} from "@/services/trip";
import {deleteTrip} from "@/store/tripSlice";
import {getExpenseByTripIdService} from "@/services/expense";
import {getTripService} from "@/services/trip";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Trash2,
} from "lucide-react";

export default function CancelTrip() {
  const navigate = useNavigate();
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();
  const [open, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const {data: tripExpenseDetails, isLoading: loadingExpense} = useQuery({
    queryKey: ["getExpenseByTripIdService", tripId],
    queryFn: () => getExpenseByTripIdService(token, tripId),
    enabled: !!token && !!tripId,
  });

  const {data: activeTripData, isLoading: loadingActiveTrip} = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  const {mutate: deleteTripData, isLoading: deleting} = useMutation({
    mutationFn: () => deleteTripService(token, tripId),
    onSuccess: (data) => {
      setSuccess(
        data?.message ||
          "The trip was successfully deleted and all associated payments were refunded."
      );
      toast.success(
        data?.message ||
          "The trip was successfully deleted and all associated payments were refunded."
      );

      setTimeout(() => navigate(createPageUrl("MyTrips")), 3000);
      setIsOpen(false);
      setIsDeleting(false);

      //   createPageUrl("MyTrips");
      dispatch(deleteTrip(tripId));
    },
    onError: (err) => {
      setError(err?.response?.data?.message || "Failed to delete the trip.");
      etIsDeleting(false);
    },
  });

  if (loadingExpense || loadingActiveTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  const tripData = tripExpenseDetails?.data?.data;
  const baseAmount = tripData?.baseAmountContributed || 0;
  const cancellationFee = baseAmount * 0.1;
  const refundAmount = baseAmount - cancellationFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="bg-white/80"
        >
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
            {tripId && (
              <p className="text-xl text-slate-700">
                You are about to cancel the trip:{" "}
                <strong className="font-semibold">
                  {activeTripData?.data?.activeTrip?.trip_occasion}
                </strong>
              </p>
            )}

            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">
                Warning: This Action is Irreversible
              </AlertTitle>
              <AlertDescription>
                Canceling this trip will permanently end it for all
                participants. Any contributed funds will be processed for
                withdrawal, minus a 10% cancellation fee.
              </AlertDescription>
            </Alert>

            <div className="text-center px-4">
              <p className="text-sm text-slate-600 italic leading-relaxed">
                We created Kasama to help people actually go on their trips —
                not just talk about them. The cancellation fee helps cover
                operational costs and keeps trip commitments real for everyone
                involved.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800 mb-4">
                Refund Calculation
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">
                    Total Funds Contributed:
                  </span>
                  <span className="font-semibold text-slate-800">
                    ${baseAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">
                    Cancellation Fee (10%):
                  </span>
                  <span className="font-semibold text-red-600">
                    -${cancellationFee.toFixed(2)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-800">
                    Estimated Net Refund:
                  </span>
                  <span className="font-bold text-green-600">
                    ${refundAmount.toFixed(2)}
                  </span>
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
            <AlertDialog open={open} onOpenChange={setIsOpen}>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg"
                onClick={() => setIsOpen(true)}
              >
                Proceed with Cancellation
              </Button>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently cancel
                    the trip.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting || isDeleting}>
                    Go Back
                  </AlertDialogCancel>
                  <Button
                    className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    onClick={() => {
                      setIsDeleting(true);
                      deleteTripData();
                    }}
                    disabled={deleting || isDeleting}
                  >
                    {(deleting || isDeleting) && (
                      <Loader2 className="animate-spin w-5 h-5" />
                    )}
                    Yes, Cancel This Trip
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
