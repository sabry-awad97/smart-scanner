import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Wifi } from "lucide-react";

interface NetworkScannerProps {
  isScanning: boolean;
  onScan: () => void;
}

export function NetworkScanner({ isScanning, onScan }: NetworkScannerProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onScan}
            disabled={isScanning}
            className="hover:bg-gray-800/50"
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <p className="text-sm">Scan network for open ports</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
