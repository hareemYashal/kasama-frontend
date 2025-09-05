"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Search, Filter, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllRegisteredUsers } from "@/services/auth";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  addParticipantService,
  participantStatusUpdateService,
  removeParticipantService,
} from "@/services/participant";
import { toast } from "sonner";

export default function ParticipantsManagment() {
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const queryClient = useQueryClient();
  const { data: registeredUsersData, isSuccess } = useQuery({
    queryKey: ["getAllRegisteredUsers", tripId, token], // ✅ include tripId in key
    queryFn: () => getAllRegisteredUsers(tripId, token), // ✅ pass it here
    enabled: !!tripId, // ✅ only fetch if tripId is set
  });

  const users = registeredUsersData?.data || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingUsers, setLoadingUsers] = useState({});

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = users.reduce((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {});

  const { mutate: addMutate } = useMutation({
    mutationFn: ({ token, data }) => addParticipantService(token, data),
    onSuccess: async () => {
      toast.success("Invitation sent successfully");
      await queryClient.invalidateQueries({
        queryKey: ["getAllRegisteredUsers"],
      });
    },
    onError: (error) => {
      toast.error(error?.message || "An error occurred");
    },
    onSettled: (_, __, variables) => {
      const userId = variables.data.userId;
      setLoadingUsers((prev) => {
        const newPrev = { ...prev };
        delete newPrev[userId];
        return newPrev;
      });
    },
  });

  const { mutate: updateMutate } = useMutation({
    mutationFn: ({ token, userId, tripId, status }) =>
      participantStatusUpdateService(token, userId, tripId, status),
    onSuccess: async () => {
      toast.success("Status updated successfully");
      await queryClient.invalidateQueries({
        queryKey: ["getAllRegisteredUsers"],
      });
    },
    onError: (error) => {
      toast.error(error?.message || "An error occurred");
    },
    onSettled: (_, __, variables) => {
      const userId = variables.userId;
      setLoadingUsers((prev) => {
        const newPrev = { ...prev };
        delete newPrev[userId];
        return newPrev;
      });
    },
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: ({ token, userId, tripId }) =>
      removeParticipantService(token, userId, tripId),
    onSuccess: async () => {
      toast.success("Participant removed successfully");
      await queryClient.invalidateQueries({
        queryKey: ["getAllRegisteredUsers"],
      });
    },
    onError: (error) => {
      toast.error(error?.message || "An error occurred");
    },
    onSettled: (_, __, variables) => {
      const userId = variables.userId;
      setLoadingUsers((prev) => {
        const newPrev = { ...prev };
        delete newPrev[userId];
        return newPrev;
      });
    },
  });

  const handleSendInvite = (userId) => {
    setLoadingUsers((prev) => ({ ...prev, [userId]: true }));
    const data = {
      tripId: tripId,
      userId: userId,
    };
    addMutate({ token, data });
  };

  const handleAcceptTripInvitation = (userId) => {
    setLoadingUsers((prev) => ({ ...prev, [userId]: true }));
    const status = "ACCEPTED";
    updateMutate({ token, userId, tripId, status });
  };

  // const handleRejectTripInvitation = (userId) => {
  //   setLoadingUsers((prev) => ({ ...prev, [userId]: true }));
  //   const status = "REJECTED";
  //   updateMutate({ token, userId, tripId, status });
  // };

  const handleRemoveFromTrip = (userId) => {
    setLoadingUsers((prev) => ({ ...prev, [userId]: true }));
    deleteMutate({ token, userId, tripId });
  };

  const statusColors = {
    INVITED: "blue",
    "Not Invited": "pink",
    REQUESTED: "yellow",
    ACCEPTED: "green",
    REJECTED: "red",
  };

  console.log("filteredUsers", filteredUsers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Button variant="outline" className="bg-white/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/60">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <Badge className="bg-orange-100 text-orange-800">
                    Admin View
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">
                  Manage Participants
                </h1>
                <p className="text-xl text-slate-600">
                  {filteredUsers.length} users
                </p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                User List
              </CardTitle>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                      <Filter className="w-4 h-4 mr-2" />
                      {statusFilter === "all" ? "All Statuses" : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("INVITED")}
                    >
                      Invited
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("Not Invited")}
                    >
                      Not Invited
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("REQUESTED")}
                    >
                      Requested
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("ACCEPTED")}
                    >
                      Accepted
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("REJECTED")}
                    >
                      Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const color = statusColors[user.status] || "gray";
                      const isLoading = !!loadingUsers[user.id];
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                                {user.avatar ? (
                                  <img
                                    src={user?.avatar}
                                    alt={user.name}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  user.name?.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">
                                  {user.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-slate-600">
                              {user?.phoneNumber}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`bg-${color}-100 text-${color}-800`}
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-slate-600">
                              {user?.date
                                ? moment(user?.date).format(
                                    "MMMM Do YYYY, h:mm:ss a"
                                  )
                                : "N/A"}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {user?.status === "INVITED" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveFromTrip(user.id)}
                                  disabled={isLoading}
                                >
                                  {isLoading
                                    ? "Removing..."
                                    : "Remove from Trip"}
                                </Button>
                              )}
                              {user?.status === "REQUESTED" && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() =>
                                      handleAcceptTripInvitation(user.id)
                                    }
                                    disabled={isLoading}
                                  >
                                    {isLoading
                                      ? "Accepting..."
                                      : "Accept Invitation"}
                                  </Button>
                                </>
                              )}
                              {user?.status === "ACCEPTED" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveFromTrip(user.id)}
                                  disabled={isLoading}
                                >
                                  {isLoading
                                    ? "Removing..."
                                    : "Remove from Trip"}
                                </Button>
                              )}
                              {user?.status === "Not Invited" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleSendInvite(user.id)}
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Sending..." : "Send Invite"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-slate-500"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
