import { Link, type LinkProps } from "react-router";

type TextLinkVariant = "primary" | "secondary" | "inverse" | "nav" | "wordmark";

type TextLinkProps = Omit<LinkProps, "className" | "to"> &
  ({ href: string; to?: never } | { href?: never; to: LinkProps["to"] }) & {
    className?: string;
    variant?: TextLinkVariant;
  };

const baseClasses =
  "inline-flex items-center justify-center gap-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const variantClasses: Record<TextLinkVariant, string> = {
  primary: "ui-action min-h-11 px-5 py-3",
  secondary:
    "min-h-11 w-fit font-medium text-foreground underline decoration-border underline-offset-4 hover:text-brand",
  inverse:
    "ui-action ui-action--inverse min-h-11 px-5 py-3 focus-visible:outline-brand-foreground",
  nav: "text-sm font-medium text-foreground hover:text-brand",
  wordmark:
    "font-display text-2xl font-bold uppercase tracking-tight text-foreground hover:text-brand",
};

export function TextLink({
  className,
  variant = "primary",
  ...props
}: TextLinkProps) {
  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  if ("href" in props) {
    const { href, ...anchorProps } = props;
    return <a className={classes} href={href} {...anchorProps} />;
  }

  const { to, ...linkProps } = props;
  return <Link className={classes} to={to} {...linkProps} />;
}
