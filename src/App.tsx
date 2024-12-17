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
          <div className="relative space-y-8">
            <Toolbar
              onCapture={captureImage}
              onSave={saveImage}
              onRefresh={() => {
                stopStream();
                startStream();
              }}
              isStreaming={isStreaming}
            />
            <div className="max-w-6xl mx-auto px-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur shadow-lg">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
                    Smart Scanner
                  </h1>
                </div>
                <p className="text-gray-400 max-w-lg mx-auto">
                  Connect and capture from any camera on your network with our
                  intelligent scanning system
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="relative group overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="relative p-6 space-y-6">
                      {/* Camera URL Input */}
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

                      {/* Camera Preview */}
                      <CameraPreview
                        isStreaming={isStreaming}
                        currentImageData={currentImageData}
                        processingTime={processingTime}
                      />

                      {/* Camera Controls */}
                      <CameraControls
                        isStreaming={isStreaming}
                        isLoading={isLoading}
                        onStreamToggle={isStreaming ? stopStream : startStream}
                        onCapture={captureImage}
                      />
                    </CardContent>
                  </Card>

                  {/* Capture History */}
                  <CaptureHistory capturedImages={capturedImages} />

                  {/* Save Image Button */}
                  <SaveImageButton
                    onSave={saveImage}
                    isLoading={isLoading}
                    disabled={capturedImages.length === 0}
                  />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Tips Card */}
                  <Card className="relative overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
                    <CardContent className="relative p-6">
                      <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                        Quick Tips
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <span className="text-purple-400">1</span>
                          </span>
                          <p className="text-sm text-gray-400">
                            Use the scan button to automatically find cameras on
                            your network
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/10 flex items-center justify-center">
                            <span className="text-pink-400">2</span>
                          </span>
                          <p className="text-sm text-gray-400">
                            Select a camera preset to quickly fill in common URL
                            patterns
                          </p>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
                            <span className="text-cyan-400">3</span>
                          </span>
                          <p className="text-sm text-gray-400">
                            Start streaming to preview the camera feed in
                            real-time
                          </p>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Status Card */}
                  <Card className="relative overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
                    <CardContent className="relative p-6">
                      <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                        Status
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Connection
                          </span>
                          <span
                            className={`text-sm ${
                              isStreaming ? "text-green-400" : "text-gray-500"
                            }`}
                          >
                            {isStreaming ? "Connected" : "Disconnected"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Captures
                          </span>
                          <span className="text-sm text-gray-300">
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
