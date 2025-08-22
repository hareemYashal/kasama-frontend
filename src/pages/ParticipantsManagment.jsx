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
import {
  Users,
  Search,
  Send,
  Check,
  X,
  Clock,
  ArrowLeft,
  Filter,
} from "lucide-react";

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "09012345678",
    status: "invited",
    invitedDate: "2024-01-15",
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "09087654321",
    status: "pending_request",
    requestDate: "2024-01-14",
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "09011223344",
    status: "not_invited",
    avatar: "ER",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "09055667788",
    status: "accepted",
    acceptedDate: "2024-01-13",
    avatar: "DK",
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.wang@email.com",
    phone: "09099887766",
    status: "declined",
    declinedDate: "2024-01-12",
    avatar: "LW",
  },
  {
    id: 6,
    name: "Alex Thompson",
    email: "alex.thompson@email.com",
    phone: "09033445566",
    status: "not_invited",
    avatar: "AT",
  },
];

const mockTrip = {
  id: 1,
  occasion: "Beach Vacation",
  destination: "Maldives",
  startDate: "2024-02-15",
  endDate: "2024-02-22",
};

export default function ParticipantsManagment() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      invited: {
        label: "Invited",
        variant: "default",
        color: "bg-blue-100 text-blue-800",
      },
      pending_request: {
        label: "Pending Request",
        variant: "secondary",
        color: "bg-yellow-100 text-yellow-800",
      },
      not_invited: {
        label: "Not Invited",
        variant: "outline",
        color: "bg-gray-100 text-gray-800",
      },
      accepted: {
        label: "Accepted",
        variant: "default",
        color: "bg-green-100 text-green-800",
      },
      declined: {
        label: "Declined",
        variant: "destructive",
        color: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status] || statusConfig.not_invited;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleSendInvite = async (userId) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: "invited",
                invitedDate: new Date().toISOString().split("T")[0],
              }
            : user
        )
      );
      setLoading(false);
    }, 1000);
  };

  const handleAcceptRequest = async (userId) => {
    setLoading(true);
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: "accepted",
                acceptedDate: new Date().toISOString().split("T")[0],
              }
            : user
        )
      );
      setLoading(false);
    }, 1000);
  };

  const handleDeclineRequest = async (userId) => {
    setLoading(true);
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: "declined",
                declinedDate: new Date().toISOString().split("T")[0],
              }
            : user
        )
      );
      setLoading(false);
    }, 1000);
  };

  const getActionButtons = (user) => {
    switch (user.status) {
      case "not_invited":
        return (
          <Button
            size="sm"
            onClick={() => handleSendInvite(user.id)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-1" />
            Send Invite
          </Button>
        );

      case "pending_request":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAcceptRequest(user.id)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeclineRequest(user.id)}
              disabled={loading}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        );

      case "invited":
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            Waiting for response
          </div>
        );

      case "accepted":
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="w-4 h-4" />
            Participating
          </div>
        );

      case "declined":
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <X className="w-4 h-4" />
            Declined
          </div>
        );

      default:
        return null;
    }
  };

  const statusCounts = users.reduce((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}

      {/* Main Content */}
      <div className=" p-4 md:p-8">
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
                  {filteredUsers.length} users • {statusCounts.accepted || 0}{" "}
                  participating
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
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {user.avatar}
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
                        <p className="text-sm text-slate-600">{user.phone}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">
                          {user.invitedDate && `Invited: ${user.invitedDate}`}
                          {user.requestDate && `Requested: ${user.requestDate}`}
                          {user.acceptedDate &&
                            `Accepted: ${user.acceptedDate}`}
                          {user.declinedDate &&
                            `Declined: ${user.declinedDate}`}
                          {!user.invitedDate &&
                            !user.requestDate &&
                            !user.acceptedDate &&
                            !user.declinedDate &&
                            "-"}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {getActionButtons(user)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
