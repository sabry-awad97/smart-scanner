interface CameraPreviewProps {
  isStreaming: boolean;
  currentImageData: string | null;
  processingTime: number | null;
}

export function CameraPreview({
  isStreaming,
  currentImageData,
  processingTime,
}: CameraPreviewProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-950 border border-gray-800">
        {currentImageData ? (
          <img
            src={currentImageData}
            alt="Camera preview"
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            {isStreaming ? "Waiting for camera feed..." : "Click Start Stream to preview camera"}
          </div>
        )}
        {processingTime && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-gray-300 px-2 py-1 rounded text-sm backdrop-blur-sm">
            {processingTime}ms
          </div>
        )}
      </div>
    </div>
  );
}
