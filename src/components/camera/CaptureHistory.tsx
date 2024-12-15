import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image } from "lucide-react";

interface CaptureHistoryProps {
  capturedImages: string[];
}

export function CaptureHistory({ capturedImages }: CaptureHistoryProps) {
  if (capturedImages.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
        <CardContent className="relative p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Captures Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Start capturing images from your camera. They will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-black/20 backdrop-blur border-white/5 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />
      <CardContent className="relative p-6">
        <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
          Captured Images
        </h3>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-3 gap-4">
            {capturedImages.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/5"
              >
                <img
                  src={image}
                  alt={`Capture ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 text-xs text-white font-medium">
                    Capture {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
