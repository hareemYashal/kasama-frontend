"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "../ui/button";

const RemovePart = ({
  open,
  onOpenChange,
  onClick,
  token,
  usrerId,
  tripId,
  loading,
  name,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[80vh]  overflow-y-auto flex flex-col p-4 justify-start items-left">
        <DialogHeader className="px-6 pt-6 pb-4  flex flex-col">
          <DialogTitle className="text-xl font-semibold ">
            Are you absolutely sure?
          </DialogTitle>

          <p className="text-sm text-muted-foreground">
            This will remove
            <span className="font-bold"> {name} </span>
            from the trip. Their access will be revoked, and this action cannot
            be undone.
          </p>
        </DialogHeader>
        <DialogFooter className="flex justify-end">
          <Button variant="outline" className="w-fit">
            {"Cancel"}
          </Button>
          <Button
            variant={"destructive"}
            onClick={() => {
              onClick({token, userId: usrerId, tripId});
            }}
            className="w-fit"
          >
            {"Yes, Remove Participant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemovePart;
