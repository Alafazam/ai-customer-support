import { cn } from "@/lib/utils";

interface SpeakingIconProps {
  isActive: boolean;
  className?: string;
}

export const SpeakingIcon = ({ isActive, className }: SpeakingIconProps) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(
      "transition-all duration-300",
      isActive ? "text-primary" : "text-muted-foreground",
      className
    )}
  >
    {/* Microphone base */}
    <path
      d="M16 20V20C13.7909 20 12 18.2091 12 16V8C12 5.79086 13.7909 4 16 4V4C18.2091 4 20 5.79086 20 8V16C20 18.2091 18.2091 20 16 20Z"
      strokeWidth="2"
      className={cn(
        "transition-colors duration-300",
        isActive && "fill-primary/20"
      )}
    />
    <path
      d="M9 16C9 19.866 12.134 23 16 23C19.866 23 23 19.866 23 16"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn(
        "transition-all duration-500",
        isActive && "animate-pulse"
      )}
    />
    <path
      d="M16 23V28M16 28H12M16 28H20"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Animated sound waves */}
    <g 
      className={cn(
        "transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-0"
      )}
    >
      <path
        d="M8 13C7 13 4 14 4 16"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-[wave_1.5s_ease-in-out_infinite]"
      />
      <path
        d="M24 13C25 13 28 14 28 16"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-[wave_1.5s_ease-in-out_infinite_0.2s]"
      />
    </g>
  </svg>
); 