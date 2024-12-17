import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { CameraControls } from "./components/camera/CameraControls";
import { CameraPreview } from "./components/camera/CameraPreview";
import { CameraUrlInput } from "./components/camera/CameraUrlInput";
import { CaptureHistory } from "./components/camera/CaptureHistory";
import { SaveImageButton } from "./components/camera/SaveImageButton";
import { Toolbar } from "./components/ui/Toolbar";
import { useCamera } from "./hooks/useCamera";
import { useCameraUrl } from "./hooks/useCameraUrl";

function App() {
  const {
    cameraUrl,
    setCameraUrl,
    isValidUrl,
    selectedPreset,
    setSelectedPreset,
    availableCameras,
    isScanning,
    handleScanNetwork,
  } = useCameraUrl();

  const {
    isStreaming,
    isLoading,
    processingTime,
    capturedImages,
    currentImageData,
    startStream,
    stopStream,
    captureImage,
    saveImage,
  } = useCamera(cameraUrl);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-gray-900">
      <div className="relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-[100%] opacity-50">
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 right-1/2 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </div>
        </div>

        {/* Main content */}
        <div className="relative min-h-screen">
          <div className="absolute inset-0 backdrop-blur-3xl" />
          <div className="relative flex flex-col h-screen">
            <Toolbar
              onCapture={captureImage}
              onSave={saveImage}
              onRefresh={() => {
                stopStream();
                startStream();
              }}
              isStreaming={isStreaming}
            />
            <div className="flex-1 p-2 overflow-y-auto">
              <div className="min-h-full max-w-7xl mx-auto grid grid-cols-12 gap-3">
                {/* Main Content Area */}
                <div className="col-span-8 flex flex-col space-y-2">
                  {/* Header */}
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur shadow-lg">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
                        Smart Scanner
                      </h1>
                    </div>
                    <p className="text-sm text-gray-400 max-w-lg mx-auto">
                      Connect and capture from any camera on your network
                    </p>
                  </div>

                  {/* Camera Card */}
                  <Card className="flex-1 relative group overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="h-full relative p-3 flex flex-col space-y-2">
                      {/* Camera URL Input */}
                      <div className="space-y-1.5">
                        <CameraUrlInput
                          cameraUrl={cameraUrl}
                          onUrlChange={setCameraUrl}
                          isValidUrl={isValidUrl}
                          availableCameras={availableCameras}
                          isScanning={isScanning}
                          onScanNetwork={handleScanNetwork}
                          selectedPreset={selectedPreset}
                          setSelectedPreset={setSelectedPreset}
                        />
                      </div>

                      {/* Camera Preview */}
                      <div className="flex-1">
                        <CameraPreview
                          isStreaming={isStreaming}
                          currentImageData={currentImageData}
                          processingTime={processingTime}
                        />
                      </div>

                      {/* Camera Controls */}
                      <div className="flex items-center justify-between gap-4">
                        <CameraControls
                          isStreaming={isStreaming}
                          isLoading={isLoading}
                          onStreamToggle={isStreaming ? stopStream : startStream}
                          onCapture={captureImage}
                        />
                        <SaveImageButton
                          onSave={saveImage}
                          isLoading={isLoading}
                          disabled={capturedImages.length === 0}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-4 flex flex-col space-y-3">
                  {/* Capture History with Scroll */}
                  <Card className="flex-1 relative overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl min-h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
                    <CardContent className="relative h-full flex flex-col p-3">
                      <h3 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
                        Capture History
                      </h3>
                      <div className="flex-1 overflow-y-auto">
                        <CaptureHistory capturedImages={capturedImages} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Card */}
                  <Card className="relative overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
                    <CardContent className="relative p-3">
                      <h3 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
                        Status
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Connection
                          </span>
                          <span
                            className={`text-xs ${
                              isStreaming ? "text-green-400" : "text-gray-500"
                            }`}
                          >
                            {isStreaming ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            Captures
                          </span>
                          <span className="text-xs text-gray-300">
                            {capturedImages.length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
