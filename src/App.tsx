import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
  Camera,
  History,
  Loader2,
  Pause,
  Play,
  Save,
  Settings,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface StreamUpdate {
  error: string | null;
  processing_time_ms: number;
  image_data?: string;
}

function App() {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const cameraUrl = "http://192.168.1.11:8080/shot.jpg";
  const previewRef = useRef<HTMLImageElement>(null);
  const nextImageRef = useRef<HTMLImageElement>(null);
  const currentImageDataRef = useRef<string | null>(null);

  useEffect(() => {
    const hiddenImage = document.createElement("img");
    hiddenImage.style.display = "none";
    document.body.appendChild(hiddenImage);
    nextImageRef.current = hiddenImage;

    return () => {
      document.body.removeChild(hiddenImage);
    };
  }, []);

  useEffect(() => {
    const unlisten = listen<StreamUpdate>("stream-update", (event) => {
      if (event.payload.error) {
        toast.error("Error", {
          description: event.payload.error,
        });
        setIsStreaming(false);
      } else {
        setProcessingTime(event.payload.processing_time_ms);
        if (
          event.payload.image_data &&
          event.payload.image_data !== currentImageDataRef.current
        ) {
          const imageData = event.payload.image_data;
          if (nextImageRef.current) {
            nextImageRef.current.onload = () => {
              if (
                isStreaming &&
                previewRef.current &&
                imageData === event.payload.image_data
              ) {
                previewRef.current.src = nextImageRef.current?.src || "";
                currentImageDataRef.current = imageData;
              }
            };
            nextImageRef.current.src = `data:image/jpeg;base64,${imageData}`;
          }
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [isStreaming]);

  const startStream = async () => {
    try {
      setIsStreaming(true);
      await invoke("start_stream", { url: cameraUrl });
    } catch (error) {
      console.error("Failed to start stream:", error);
      setIsStreaming(false);
      toast.error("Error", {
        description: String(error),
      });
    }
  };

  const stopStream = async () => {
    try {
      await invoke("stop_stream");
      setIsStreaming(false);
      setProcessingTime(null);
      if (previewRef.current) {
        previewRef.current.src = "";
      }
      currentImageDataRef.current = null;
    } catch (error) {
      console.error("Failed to stop stream:", error);
      toast.error("Error", {
        description: String(error),
      });
    }
  };

  const captureImage = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<string>("capture_image", { url: cameraUrl });
      setStatus(result);
      if (previewRef.current?.src) {
        setCapturedImages((prev) => [...prev, previewRef.current!.src]);
      }
      toast.success("Success", {
        description: result,
      });
    } catch (error) {
      const errorMessage = `Error: ${error}`;
      setStatus(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveImage = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<string>("save_image");
      setStatus(result);
      toast.success("Success", {
        description: result,
      });
    } catch (error) {
      const errorMessage = `Error: ${error}`;
      setStatus(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Preview Card */}
          <Card className="flex-1 bg-black/20 backdrop-blur border-gray-800">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Smart Scanner
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>

              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-950 border border-gray-800">
                <img
                  ref={previewRef}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt="Camera preview"
                />
                {!isStreaming && !previewRef.current?.src && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Click Start Stream to preview camera
                  </div>
                )}
                {processingTime && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-gray-300 px-2 py-1 rounded text-sm backdrop-blur-sm">
                    {processingTime}ms
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={isStreaming ? stopStream : startStream}
                  variant={isStreaming ? "destructive" : "default"}
                  className="w-full transition-all duration-200 hover:scale-105"
                >
                  {isStreaming ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Stop Stream
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Stream
                    </>
                  )}
                </Button>

                <Button
                  onClick={captureImage}
                  disabled={isLoading || !isStreaming}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  Capture
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-4">
            {/* History Card */}
            <Card className="bg-black/20 backdrop-blur border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-3">
                  <History className="h-4 w-4" />
                  <span className="text-sm font-medium">Recent Captures</span>
                </div>
                <div className="space-y-3">
                  {capturedImages
                    .slice(-3)
                    .reverse()
                    .map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-video rounded-md overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
                      >
                        <img
                          src={src}
                          alt={`Capture ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  {capturedImages.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No captures yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="bg-black/20 backdrop-blur border-gray-800">
              <CardContent className="p-4">
                <Button
                  onClick={saveImage}
                  disabled={isLoading || capturedImages.length === 0}
                  variant="secondary"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-200 hover:scale-105"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Image
                </Button>
              </CardContent>
            </Card>

            {/* Status Card */}
            {status && (
              <Card className="bg-black/20 backdrop-blur border-gray-800">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-400">{status}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
