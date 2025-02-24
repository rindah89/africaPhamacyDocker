import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading POS...</p>
      </div>
    </div>
  );
} 