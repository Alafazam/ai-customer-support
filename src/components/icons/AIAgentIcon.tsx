import { cn } from "@/lib/utils";

interface AIAgentIconProps {
  isActive?: boolean;
  className?: string;
}

export function AIAgentIcon({ isActive = false, className }: AIAgentIconProps) {
  return (
    <div className={cn("relative w-full aspect-square", className)}>
      {/* Emitting Waves Animation */}
      {isActive && (
        <>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 rounded-full border-4",
                "animate-emit-waves",
                "opacity-0",
                i === 0 && "animation-delay-0",
                i === 1 && "animation-delay-1000",
                i === 2 && "animation-delay-2000",
                isActive ? "border-emerald-400/30" : "border-gray-400/30"
              )}
            />
          ))}
        </>
      )}

      {/* Outer Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-4",
        isActive ? "border-emerald-200/50" : "border-gray-200/50",
        "animate-[spin_3s_linear_infinite]"
      )}>
        <div className={cn(
          "absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
          isActive ? "bg-emerald-400" : "bg-gray-400"
        )} />
      </div>

      {/* Middle Ring */}
      <div className={cn(
        "absolute inset-2 rounded-full border-2",
        isActive ? "border-emerald-300/70" : "border-gray-300/70",
        "animate-[spin_4s_linear_infinite_reverse]"
      )}>
        <div className={cn(
          "absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
          isActive ? "bg-emerald-500" : "bg-gray-500"
        )} />
      </div>

      {/* Inner Circle with Pulse */}
      <div className={cn(
        "absolute inset-4 rounded-full",
        isActive 
          ? "bg-gradient-to-br from-emerald-400 to-green-500" 
          : "bg-gradient-to-br from-gray-400 to-gray-500",
        isActive && "animate-pulse"
      )}>
        {/* Sound Wave Animation */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          isActive && "opacity-100",
          !isActive && "opacity-0",
          "transition-opacity duration-200"
        )}>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-0.5 rounded-full bg-white",
                  "animate-soundwave" + (i + 1),
                  i === 0 && "w-3",
                  i === 1 && "w-4",
                  i === 2 && "w-3"
                )}
              />
            ))}
          </div>
        </div>
        
        {/* AI Symbol */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          !isActive && "opacity-100",
          isActive && "opacity-0",
          "transition-opacity duration-200"
        )}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Orbital Particles */}
      {isActive && (
        <>
          <div className="absolute inset-0 animate-[spin_2s_linear_infinite]">
            <div className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
              isActive ? "bg-green-400" : "bg-gray-400"
            )} />
          </div>
          <div className="absolute inset-0 animate-[spin_2.5s_linear_infinite_reverse]">
            <div className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
              isActive ? "bg-emerald-400" : "bg-gray-400"
            )} />
          </div>
        </>
      )}
    </div>
  );
} 