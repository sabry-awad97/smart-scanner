import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SaveImageButtonProps {
  onSave: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function SaveImageButton({
  onSave,
  isLoading,
  disabled,
}: SaveImageButtonProps) {
  return (
    <Button
      onClick={onSave}
      disabled={isLoading || disabled}
      className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
    >
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer opacity-0 group-hover:opacity-100" />
      <div className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>Save Image</span>
          </>
        )}
      </div>
    </Button>
  );
}
