import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { toast } from "sonner";
import { CameraPreset } from "../types/camera";

export const useCameraUrl = (initialUrl: string = "") => {
  const [cameraUrl, setCameraUrl] = useState(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<CameraPreset | null>(null);

  const validateUrl = async (url: string) => {
    try {
      new URL(url);
      setIsValidUrl(true);
      return true;
    } catch {
      setIsValidUrl(false);
      return false;
    }
  };

  const handleUrlChange = async (url: string) => {
    setCameraUrl(url);
    await validateUrl(url);
  };

  const handleScanNetwork = async () => {
    try {
      setIsScanning(true);
      const cameras = await invoke<string[]>("scan_network");
      setAvailableCameras(cameras);

      if (cameras.length > 0) {
        setCameraUrl(cameras[0]);
        toast.success("Camera found!", {
          description: `Found ${cameras.length} camera${
            cameras.length > 1 ? "s" : ""
          } on your network`,
        });
      } else {
        toast.error("No cameras found", {
          description:
            "Make sure your camera is connected to the same WiFi network",
        });
      }
    } catch (error) {
      toast.error("Error scanning network", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return {
    cameraUrl,
    setCameraUrl: handleUrlChange,
    isValidUrl,
    selectedPreset,
    setSelectedPreset,
    availableCameras,
    isScanning,
    handleScanNetwork,
  };
};
