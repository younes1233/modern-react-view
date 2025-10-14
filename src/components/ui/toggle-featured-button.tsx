import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToggleFeaturedButtonProps {
  isFeatured: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
}

export function ToggleFeaturedButton({
  isFeatured,
  onToggle,
  disabled = false,
  size = "sm",
}: ToggleFeaturedButtonProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={onToggle}
      disabled={disabled}
      title={isFeatured ? "Featured on store page" : "Not featured"}
      className={
        isFeatured
          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
          : "text-red-600 hover:text-red-700 hover:bg-red-50"
      }
    >
      {isFeatured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </Button>
  );
}
