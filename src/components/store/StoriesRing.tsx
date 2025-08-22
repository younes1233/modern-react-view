
import { useState } from "react";
import { StoriesViewer } from "./StoriesViewer";
import { useStories } from "@/hooks/useStories";
import { Skeleton } from "@/components/ui/skeleton";

export const StoriesRing = () => {
  const { stories, loading } = useStories();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  const openStoryViewer = (index: number) => {
    setSelectedStoryIndex(index);
    setIsViewerOpen(true);
  };

  const activeStories = stories.filter(story => story.isActive);

  if (loading) {
    return (
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-3 w-12 mt-2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeStories.length === 0) return null;

  return (
    <>
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {activeStories.map((story, index) => (
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
        stories={activeStories}
      />
    </>
  );
};
