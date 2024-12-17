import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Camera,
  Maximize2,
  Minimize2,
  RefreshCw,
  Save,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Separator } from "./separator";

interface ToolbarProps {
  onCapture?: () => void;
  onSettings?: () => void;
  onSave?: () => void;
  onRefresh?: () => void;
  isStreaming?: boolean;
}

export function Toolbar({
  onCapture,
  onSettings,
  onSave,
  onRefresh,
  isStreaming = false,
}: ToolbarProps) {
  const appWindow = getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    };
    checkMaximized();
  }, []);

  const handleMaximizeToggle = async () => {
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => appWindow.close();

  return (
    <div className="relative overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
      <div className="relative flex items-center h-12 px-2">
        {/* App controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCapture}
            disabled={!isStreaming}
            className="hover:bg-white/5 hover:text-purple-400 transition-colors"
            title="Capture"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className="hover:bg-white/5 hover:text-purple-400 transition-colors"
            title="Save"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="hover:bg-white/5 hover:text-purple-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Separator
          orientation="vertical"
          className="mx-2 h-5 bg-purple-500/20"
        />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="hover:bg-white/5 hover:text-purple-400 transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Window controls */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMaximizeToggle}
            className="hover:bg-white/5 hover:text-purple-400 transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
