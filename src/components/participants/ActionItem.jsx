"use client";

import {
  Crown,
  Phone,
  Calendar,
  MoreHorizontal,
  Delete,
  DeleteIcon,
} from "lucide-react";
import {getAllTripsWithRole} from "@/services/trip";
import {useQueryClient} from "@tanstack/react-query";
import {removeParticipantFromTrip} from "@/services/trip";
import {useMutation} from "@tanstack/react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {useSelector} from "react-redux";
import {toast} from "sonner";
import {useState} from "react";
import RemovePart from "./RemoveParticipant";
import {QueryClient} from "@tanstack/react-query";
const ActionItem = ({tripId, participant}) => {
  const token = useSelector((state) => state.user.token);
  const [isOpen, setIsOpen] = useState(false);
  const [partId, setPartId] = useState(null);
  const queryClient = useQueryClient();

  const {mutate: removeParticipant, isPending: loading} = useMutation({
    mutationFn: async ({token, userId, tripId}) => {
      return await removeParticipantFromTrip(token, userId, tripId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["getAllTripsWithRoleQuery", token]);
      toast.success(data?.message || "Participant Removed!");
      setIsOpen(false);
    },
    onError: (error) => {
      console.log("💣 onError fired:", error);
      toast.error(error?.response?.data?.message || "Failed to delete");
    },
  });

  return (
    <div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground h-8 w-8 hover:bg-accent hover:text-accent-foreground">
            <MoreHorizontal className="w-4 h-6" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content className="bg-white rounded-md shadow-md w-auto py-1 border-0 ">
          <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
          {/* Promote to Admin */}
          <DropdownMenu.Item
            className="
                                flex items-center  px-2 py-1.5 text-sm font-semibold hover:text-accent-foreground cursor-pointer
                                bg-transparent border-0 outline-none
                                data-[highlighted]:bg-transparent data-[highlighted]:text-accent-foreground"
            onSelect={() => {
              onMakeAdmin(participant);
            }}
          >
            {participant.isHelperAdmin ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-shield w-4 h-4 mr-2"
                data-filename="components/participants/ParticipantList"
                data-linenumber="261"
                data-visual-selector-id="components/participants/ParticipantList261"
                data-source-location="components/participants/ParticipantList:261:38"
                data-dynamic-content="false"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
              </svg>
            ) : (
              <Crown className="w-4 h-4 mr-2" />
            )}
            {participant.isHelperAdmin
              ? "Demote to Participant"
              : "Promote to Admin"}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-muted my-1" />

          {/* Remove from Trip */}
          <DropdownMenu.Item
            className="
    flex items-center px-2 py-1.5 text-sm font-semibold  text-destructive cursor-pointer
    bg-transparent border-0 outline-none
    data-[highlighted]:bg-transparent data-[highlighted]:text-destructive
  "
            onSelect={() => {
              setIsOpen(true);
              setPartId(participant.user.id);

              // removeParticipant({token, userId: participant.user.id, tripId});
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-trash2 w-4 h-4 mr-2"
              data-source-location="components/participants/ParticipantList:280:36"
              data-dynamic-content="false"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
            </svg>
            Remove from Trip
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <RemovePart
        open={isOpen}
        onOpenChange={setIsOpen}
        onClick={removeParticipant}
        usrerId={partId}
        token={token}
        tripId={tripId}
        loading={loading}
        name={participant.user.name}
      />
    </div>
  );
};

export default ActionItem;
