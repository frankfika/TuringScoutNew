import { cn } from "../../lib/utils";

type Props = {
  className?: string;
  title?: string;
  message?: string;
};

export function EmptyState({ className, title = "Nothing here yet", message }: Props) {
  return (
    <div
      className={cn(
        "p-12 text-center text-sm font-serif opacity-70 bg-white border border-[#141414] rounded-md flex flex-col items-center gap-2",
        className,
      )}
    >
      <div className="font-bold text-base">{title}</div>
      {message && <div className="font-sans text-[13px] opacity-80 max-w-md">{message}</div>}
    </div>
  );
}
