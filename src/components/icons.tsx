import { cn } from "@/lib/utils";

export const AppLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 20"
    className={cn("text-foreground", className)}
    fill="currentColor"
  >
    <text
      x="0"
      y="15"
      fontFamily="Inter, sans-serif"
      fontSize="16"
      fontWeight="bold"
    >
      FreshMart
    </text>
  </svg>
);
