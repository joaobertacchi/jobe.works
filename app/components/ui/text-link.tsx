import { Link, NavLink, type LinkProps } from "react-router";

type TextLinkVariant = "primary" | "secondary" | "nav" | "wordmark";

type TextLinkProps = Omit<LinkProps, "className"> & {
  activeClassName?: string;
  className?: string;
  end?: boolean;
  variant?: TextLinkVariant;
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const variantClasses: Record<TextLinkVariant, string> = {
  primary:
    "min-h-11 px-5 py-3 font-medium bg-brand text-brand-foreground hover:opacity-90",
  secondary:
    "min-h-11 px-5 py-3 font-medium text-foreground underline decoration-border underline-offset-4 hover:text-brand",
  nav: "text-sm font-medium text-foreground hover:text-brand",
  wordmark:
    "font-display text-2xl font-bold uppercase tracking-tight text-foreground hover:text-brand",
};

export function TextLink({
  activeClassName,
  className,
  end,
  variant = "primary",
  ...props
}: TextLinkProps) {
  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  if (activeClassName) {
    return (
      <NavLink
        className={({ isActive }) =>
          isActive ? [classes, activeClassName].join(" ") : classes
        }
        end={end}
        {...props}
      />
    );
  }

  return <Link className={classes} {...props} />;
}
