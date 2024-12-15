import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CameraPreset, cameraPresets } from "@/types/camera";
import { Settings } from "lucide-react";

interface CameraPresetSelectorProps {
  urlInputRef: React.RefObject<HTMLInputElement | null>;
  onPresetSelect?: (preset: CameraPreset) => void;
  selectedPreset: CameraPreset | null;
}

export function CameraPresetSelector({
  urlInputRef,
  onPresetSelect,
  selectedPreset,
}: CameraPresetSelectorProps) {
  const handlePresetSelect = (preset: CameraPreset) => {
    onPresetSelect?.(preset);
    if (urlInputRef.current) {
      urlInputRef.current.focus();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-black/40 border-gray-700 hover:bg-black/60 hover:border-gray-600"
        >
          {selectedPreset?.icon ? (
            <selectedPreset.icon className="h-4 w-4 text-gray-400" />
          ) : (
            <Settings className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-black/90 backdrop-blur border-gray-800"
      >
        {cameraPresets.map((preset) => (
          <DropdownMenuItem
            key={preset.name}
            onClick={() => handlePresetSelect(preset)}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white focus:text-white hover:bg-white/10 focus:bg-white/10"
          >
            <preset.icon className="h-4 w-4" />
            <span>{preset.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
