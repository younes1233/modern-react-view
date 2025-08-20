
import { useState, useEffect } from "react";
import { storyService, Story } from "@/services/storyService";
import { StoriesViewer } from "./StoriesViewer";

export const StoriesRing = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  useEffect(() => {
    loadStories();
    
    const handleStoriesUpdate = () => {
      loadStories();
    };
    
    window.addEventListener('storiesUpdated', handleStoriesUpdate);
    return () => window.removeEventListener('storiesUpdated', handleStoriesUpdate);
  }, []);

  const loadStories = () => {
    const activeStories = storyService.getStories().filter(story => story.isActive);
    setStories(activeStories);
  };

  const openStoryViewer = (index: number) => {
    setSelectedStoryIndex(index);
    setIsViewerOpen(true);
  };

  if (stories.length === 0) return null;

  return (
    <>
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="flex-shrink-0 cursor-pointer group"
                onClick={() => openStoryViewer(index)}
              >
                <div className="relative">
                  {/* Story ring */}
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400 max-w-[64px] truncate">
                  {story.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoriesViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        initialStoryIndex={selectedStoryIndex}
      />
    </>
  );
};
