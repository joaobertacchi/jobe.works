import { Link, type LinkProps } from "react-router";

type TextLinkProps = Omit<LinkProps, "className"> & {
  className?: string;
  variant?: "primary" | "secondary";
};

const variantClasses = {
  primary: "bg-brand text-brand-foreground hover:opacity-90",
  secondary:
    "text-foreground underline decoration-border underline-offset-4 hover:text-brand",
};

export function TextLink({
  className,
  variant = "primary",
  ...props
}: TextLinkProps) {
  const classes = [
    "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <Link className={classes} {...props} />;
}
