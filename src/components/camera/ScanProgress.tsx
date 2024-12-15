import { Progress } from "@/components/ui/progress";
import { listen } from "@tauri-apps/api/event";
import { Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ScanProgressProps {
  isScanning: boolean;
}

interface ScanProgress {
  ip: string;
  port: number;
  total_scanned: number;
  total_to_scan: number;
}

interface PortFound {
  ip: string;
  port: number;
  service_hint: string;
}

export function ScanProgress({ isScanning }: ScanProgressProps) {
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [foundPorts, setFoundPorts] = useState<PortFound[]>([]);

  useEffect(() => {
    if (!isScanning) {
      setFoundPorts([]);
    }
  }, [isScanning]);

  useEffect(() => {
    const unsubscribeProgress = listen<ScanProgress>(
      "scan-progress",
      (event) => {
        setProgress(event.payload);
      }
    );

    const unsubscribePort = listen<PortFound>("port-found", (event) => {
      const port = event.payload;
      setFoundPorts((prev) => [...prev, port]);
      toast.success("Port Found!", {
        description: `Found ${port.service_hint} at ${port.ip}:${port.port}`,
      });
    });

    return () => {
      unsubscribeProgress.then((fn) => fn());
      unsubscribePort.then((fn) => fn());
    };
  }, []);

  if (!isScanning && !foundPorts.length) return null;

  const progressPercentage = progress
    ? (progress.total_scanned / progress.total_to_scan) * 100
    : 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {isScanning && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">
                  {progress
                    ? `Scanning ${progress.ip}:${progress.port}`
                    : "Initializing scan..."}
                </span>
                <span className="text-sm text-gray-400 font-medium">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-1" />
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">
              Scanning network for open ports...
            </span>
            {progress && (
              <span className="text-gray-500">
                {progress.total_scanned} / {progress.total_to_scan} addresses
              </span>
            )}
          </div>
        </div>
      )}

      {foundPorts.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Found Ports</div>
          <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2">
            {foundPorts.map((port) => (
              <div
                key={`${port.ip}:${port.port}`}
                className="flex items-center justify-between bg-black/20 rounded-lg p-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-300">
                    {port.ip}:{port.port}
                  </span>
                </div>
                <span className="text-gray-400">{port.service_hint}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
