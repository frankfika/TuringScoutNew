import { cn } from "../../lib/utils";

type Props = {
  className?: string;
  message?: string;
  rows?: number;
};

export function LoadingState({ className, message = "Loading...", rows = 3 }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex flex-col gap-3 p-6", className)}
    >
      <span className="sr-only">{message}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-white/60 border border-[#141414] rounded-md animate-pulse opacity-70"
        />
      ))}
    </div>
  );
}

export function InlineLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div role="status" aria-live="polite" className="p-12 font-mono text-sm tracking-widest text-[#141414] flex flex-col items-center justify-center w-full">
      <span className="animate-spin text-4xl mb-6 opacity-30" aria-hidden="true">⏳</span>
      {message}
    </div>
  );
}
