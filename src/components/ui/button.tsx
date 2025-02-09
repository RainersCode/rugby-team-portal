import { cn } from "@/lib/utils";
import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg",
  {
    variants: {
      variant: {
        primary: "bg-rugby-teal hover:bg-rugby-teal/90 text-white",
        secondary: "bg-rugby-yellow hover:bg-rugby-yellow/90 text-gray-900",
        outline: "border-2 border-rugby-teal text-rugby-teal hover:bg-rugby-teal hover:text-white",
        ghost: "bg-gray-100 hover:bg-gray-200 text-gray-900",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
    const styles = cn(
      buttonVariants({ variant, size }),
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
