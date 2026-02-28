import Image from "next/image";
import { cn } from "@/shared/lib/cn";

export function Avatar({
  src,
  alt,
  size = 44,
  className,
}: {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-soft",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt ?? ""}
        width={size}
        height={size}
        unoptimized
        className="h-full w-full object-cover"
      />
    </div>
  );
}
