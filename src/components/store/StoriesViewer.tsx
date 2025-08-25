
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Story } from "@/services/storyService";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface StoriesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialStoryIndex?: number;
  stories: Story[];
}

export const StoriesViewer = ({ isOpen, onClose, initialStoryIndex = 0, stories }: StoriesViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialStoryIndex, stories.length - 1));
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialStoryIndex, stories.length]);

  useEffect(() => {
    if (!isOpen || isPaused || stories.length === 0) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return 0;
          } else {
            // Close viewer when all stories are viewed
            onClose();
            return 0;
          }
        }
        return prev + 1; // Increase by 1% every 50ms (5 seconds total)
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentIndex, stories.length, onClose]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  if (stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-full h-full sm:h-auto p-0 bg-black border-0">
        <div className="relative w-full h-full sm:h-[80vh] bg-black flex items-center justify-center">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
          >
            <X className="w-7 h-7" />
          </Button>

          {/* Story content */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{ backgroundColor: currentStory.backgroundColor }}
          >
            <img
              src={currentStory.image}
              alt={currentStory.title}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Text overlay */}
            {currentStory.content && (
              <div 
                className="absolute bottom-20 left-4 right-4 text-center"
                style={{ color: currentStory.textColor }}
              >
                <h3 className="text-xl font-bold mb-2">{currentStory.title}</h3>
                <p className="text-sm opacity-90">{currentStory.content}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="absolute inset-0 flex z-10">
            {/* Left half - previous */}
            <div 
              className="flex-1 cursor-pointer flex items-center justify-start pl-4"
              onClick={goToPrevious}
            >
              {currentIndex > 0 && (
                <ChevronLeft className="w-8 h-8 text-white/70 hover:text-white" />
              )}
            </div>
            
            {/* Right half - next */}
            <div 
              className="flex-1 cursor-pointer flex items-center justify-end pr-4"
              onClick={goToNext}
            >
              <ChevronRight className="w-8 h-8 text-white/70 hover:text-white" />
            </div>
          </div>

          {/* Pause/Play button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePause}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-white hover:bg-white/20"
          >
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
