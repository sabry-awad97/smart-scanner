import { Button } from "@/components/ui/button";
import { Camera, Loader2, Pause, Play } from "lucide-react";

interface CameraControlsProps {
  isStreaming: boolean;
  isLoading: boolean;
  onStreamToggle: () => void;
  onCapture: () => void;
}

export function CameraControls({
  isStreaming,
  isLoading,
  onStreamToggle,
  onCapture,
}: CameraControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        onClick={onStreamToggle}
        variant={isStreaming ? "destructive" : "default"}
        className="relative group overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer opacity-0 group-hover:opacity-100" />
        <div className="relative flex items-center justify-center gap-2">
          {isStreaming ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Stop Stream</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Start Stream</span>
            </>
          )}
        </div>
      </Button>

      <Button
        onClick={onCapture}
        disabled={isLoading || !isStreaming}
        className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer opacity-0 group-hover:opacity-100" />
        <div className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Capturing...</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Capture</span>
            </>
          )}
        </div>
      </Button>
    </div>
  );
}
