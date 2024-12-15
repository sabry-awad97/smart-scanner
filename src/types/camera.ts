import { Camera, Globe, Wifi } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface StreamUpdate {
  error: string | null;
  processing_time_ms: number;
  image_data?: string;
}

export interface CameraPreset {
  name: string;
  pattern: string;
  examples: string[];
  icon: LucideIcon;
}

export const cameraPresets: CameraPreset[] = [
  {
    name: "IP Camera",
    pattern: "http://{ip}:{port}/video",
    examples: ["http://192.168.1.100:8080/video"],
    icon: Camera,
  },
  {
    name: "DroidCam",
    pattern: "http://{ip}:4747/video",
    examples: ["http://192.168.1.100:4747/video"],
    icon: Wifi,
  },
  {
    name: "WebCam",
    pattern: "http://{ip}/video",
    examples: ["http://192.168.1.100/video"],
    icon: Globe,
  },
];
