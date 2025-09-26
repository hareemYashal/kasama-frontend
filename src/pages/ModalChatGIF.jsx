"use client";
import {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Search, X} from "lucide-react";

const ModalChatGIF = ({open, onOpenChange}) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" p-0 overflow-hidden w-full">
        <DialogHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-semibold">
            Choose a GIF
          </DialogTitle>
         
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="relative">
            <Input
              placeholder="Search for GIFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-muted hover:bg-muted/80"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Search for the perfect GIF to share!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalChatGIF;
