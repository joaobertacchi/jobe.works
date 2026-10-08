import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "link";
  size?: "sm" | "lg";
};

const variantClasses = {
  primary: "ui-action",
  secondary: "ui-action ui-action--secondary",
  link: "font-medium text-foreground underline decoration-border underline-offset-4 hover:text-brand",
};

const sizeClasses = {
  sm: "ui-action--sm min-h-9 px-3 py-2 text-sm",
  lg: "min-h-11 px-5 py-3 text-base",
};

const linkSizeClasses = {
  sm: "min-h-9 text-sm",
  lg: "min-h-11 text-base",
};

export function Button({
  children,
  className,
  size = "lg",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    variantClasses[variant],
    variant === "link" ? linkSizeClasses[size] : sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
