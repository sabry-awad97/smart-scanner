import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CameraPreset } from "@/types/camera";
import { Link2 } from "lucide-react";
import { useRef } from "react";
import { CameraPresetSelector } from "./CameraPresetSelector";
import { NetworkScanner } from "./NetworkScanner";

interface CameraUrlInputProps {
  cameraUrl: string;
  onUrlChange: (url: string) => void;
  isValidUrl: boolean | null;
  availableCameras: string[];
  isScanning: boolean;
  onScanNetwork: () => void;
  selectedPreset: CameraPreset | null;
  setSelectedPreset: (preset: CameraPreset | null) => void;
}

export function CameraUrlInput({
  cameraUrl,
  onUrlChange,
  isValidUrl,
  availableCameras,
  isScanning,
  onScanNetwork,
  selectedPreset,
  setSelectedPreset,
}: CameraUrlInputProps) {
  const urlInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Camera URL</span>
      </div>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={urlInputRef}
            type="text"
            value={cameraUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={selectedPreset?.pattern || "Enter camera URL..."}
            className={cn(
              "bg-black/40 border text-white placeholder:text-gray-500",
              isValidUrl === true &&
                "border-green-500/50 focus-visible:ring-green-500/20",
              isValidUrl === false &&
                "border-red-500/50 focus-visible:ring-red-500/20",
              !isValidUrl && "border-gray-700 focus-visible:ring-blue-500/20"
            )}
          />
        </div>
        <CameraPresetSelector 
          urlInputRef={urlInputRef} 
          selectedPreset={selectedPreset}
          onPresetSelect={(preset) => {
            setSelectedPreset(preset);
            urlInputRef.current?.focus();
          }}
        />
        <NetworkScanner isScanning={isScanning} onScan={onScanNetwork} />
      </div>

      {selectedPreset && (
        <div className="mt-2">
          <div className="text-xs text-gray-500">
            Example: {selectedPreset.examples[0]}
          </div>
        </div>
      )}

      {availableCameras.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {availableCameras.map((camera, index) => (
            <Button
              key={camera}
              onClick={() => onUrlChange(camera)}
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full h-7",
                camera === cameraUrl
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600"
              )}
            >
              Camera {index + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
