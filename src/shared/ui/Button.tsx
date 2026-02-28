"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "default" | "primary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-4 py-2 text-sm rounded-2xl",
  lg: "px-5 py-3 text-base rounded-2xl",
};

const variantClasses: Record<Variant, string> = {
  default: "btn",
  primary: "btn btn-primary",
  danger: "btn btn-danger",
  ghost: "btn btn-ghost",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      leftIcon,
      rightIcon,
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          variantClasses[variant],
          sizeClasses[size],
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {leftIcon ? <span className="text-base">{leftIcon}</span> : null}
        <span className={cn(loading && "opacity-70")}>{children}</span>
        {loading ? (
          <span
            className="ml-1 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white/90"
            aria-hidden
          />
        ) : rightIcon ? (
          <span className="text-base">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);
Button.displayName = "Button";
