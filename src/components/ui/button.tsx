import { cn } from "@/lib/utils";
import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      href,
      className,
      isLoading,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg";
    
    const variants = {
      primary: "bg-rugby-teal hover:bg-rugby-teal/90 text-white",
      secondary: "bg-rugby-yellow hover:bg-rugby-yellow/90 text-gray-900",
      outline: "border-2 border-rugby-teal text-rugby-teal hover:bg-rugby-teal/10",
      ghost: "bg-white/10 backdrop-blur-sm border border-white/30 hover:border-white text-white hover:bg-white/20",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const styles = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      isLoading && "opacity-70 cursor-not-allowed",
      disabled && "opacity-50 cursor-not-allowed",
      className
    );

    if (href) {
      return (
        <Link href={href} className={styles}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={styles}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
