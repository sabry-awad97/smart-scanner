import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Camera, Loader2, Pause, Play, Save } from "lucide-react";
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
  const cameraUrl = "http://192.168.1.11:8080/shot.jpg";
  const previewRef = useRef<HTMLImageElement>(null);
  const nextImageRef = useRef<HTMLImageElement>(null);
  const currentImageDataRef = useRef<string | null>(null);

  useEffect(() => {
    // Create a hidden image element for preloading
    const hiddenImage = document.createElement("img");
    hiddenImage.style.display = "none";
    document.body.appendChild(hiddenImage);
    nextImageRef.current = hiddenImage;

    return () => {
      document.body.removeChild(hiddenImage);
    };
  }, []);

  useEffect(() => {
    // Listen for stream updates from Rust
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
          // Preload the next image
          const imageData = event.payload.image_data;
          if (nextImageRef.current) {
            nextImageRef.current.onload = () => {
              // Only update if we're still streaming and this is still the latest image
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
      unlisten.then((fn) => fn()); // Cleanup listener
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
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Smart Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              ref={previewRef}
              className="absolute inset-0 w-full h-full object-contain"
              alt="Camera preview"
            />
            {!isStreaming && !previewRef.current?.src && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Click Start Stream to preview camera
              </div>
            )}
            {processingTime && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {processingTime}ms
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button
                onClick={isStreaming ? stopStream : startStream}
                variant="secondary"
                className="flex-1"
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
            </div>

            <Button
              onClick={captureImage}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              Capture Image
            </Button>

            <Button
              onClick={saveImage}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Image
            </Button>
          </div>

          {status && (
            <div className="mt-4 p-3 rounded-lg bg-muted text-sm">{status}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
