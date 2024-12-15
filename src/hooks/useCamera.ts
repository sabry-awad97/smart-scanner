import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StreamUpdate } from "@/types/camera";

export const useCamera = (cameraUrl: string) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentImageData, setCurrentImageData] = useState<string | null>(null);

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
              if (isStreaming && imageData === event.payload.image_data) {
                setCurrentImageData(`data:image/jpeg;base64,${imageData}`);
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
      setCurrentImageData(null);
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
      if (currentImageData) {
        setCapturedImages((prev) => [...prev, currentImageData]);
      }
      toast.success("Success", {
        description: result,
      });
    } catch (error) {
      toast.error("Error", {
        description: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveImage = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<string>("save_image");
      toast.success("Success", {
        description: result,
      });
    } catch (error) {
      toast.error("Error", {
        description: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isStreaming,
    isLoading,
    processingTime,
    capturedImages,
    currentImageData,
    startStream,
    stopStream,
    captureImage,
    saveImage,
  };
};
