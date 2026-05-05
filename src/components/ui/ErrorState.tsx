import { cn } from "@lib/utils";

type Props = {
  className?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  className,
  title = "Something went wrong",
  message,
  onRetry,
}: Props) {
  return (
    <div
      role="alert"
      className={cn(
        "p-6 font-mono text-xs uppercase tracking-widest text-red-700 bg-red-50 border border-red-700 m-2 rounded-md flex flex-col gap-3",
        className,
      )}
    >
      <div className="font-bold text-sm normal-case tracking-normal font-serif text-red-900">
        {title}
      </div>
      {message && (
        <div className="opacity-80 normal-case tracking-normal text-[12px] font-sans">
          {message}
        </div>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start mt-2 bg-white border border-red-700 text-red-700 px-3 py-1.5 rounded-sm hover:bg-red-700 hover:text-white transition-colors text-[11px]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
