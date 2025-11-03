import React from "react";

// Simple spinner compatible with shadcn/ui styling conventions
function Loader({
  className = "h-5 w-5",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      aria-label="loading"
      className={`flex flex-col items-center justify-center ${className}`}
      {...props}
    >
      <svg className="animate-spin" width="48" height="48" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="#3b82f6"
          strokeWidth="4"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M24 4 a 20 20 0 1 1 0 40"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export { Loader };
