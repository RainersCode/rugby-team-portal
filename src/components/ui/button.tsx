import { cn } from "@/lib/utils";
import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-rugby-teal hover:bg-rugby-teal-dark text-white shadow-md hover:shadow-lg focus:ring-rugby-teal/50",
        secondary: "bg-rugby-yellow hover:bg-rugby-yellow/90 text-gray-900 shadow-md hover:shadow-lg focus:ring-rugby-yellow/50",
        outline: "border-2 border-rugby-teal text-rugby-teal hover:bg-rugby-teal/10 focus:ring-rugby-teal/30",
        ghost: "bg-white/90 hover:bg-white text-rugby-teal shadow-sm hover:shadow-md border border-gray-200 hover:border-rugby-teal/30",
        danger: "bg-rugby-red hover:bg-rugby-red-dark text-white shadow-md hover:shadow-lg focus:ring-rugby-red/50",
        subtle: "bg-rugby-teal/10 hover:bg-rugby-teal/20 text-rugby-teal hover:text-rugby-teal-dark",
      },
      size: {
        xs: "px-2.5 py-1.5 text-xs rounded",
        sm: "px-4 py-2 text-sm rounded-md",
        md: "px-5 py-2.5 text-base rounded-md",
        lg: "px-6 py-3 text-lg rounded-md",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "md",
    },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  href?: string;
  className?: string;
  isLoading?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      rounded = "md",
      href,
      className,
      isLoading,
      disabled,
      ...props
    },
    ref
  ) => {
    const styles = cn(
      buttonVariants({ variant, size, rounded }),
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

export { Button, buttonVariants };
