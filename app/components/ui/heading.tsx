import type { HTMLAttributes, Ref } from "react";

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  ref?: Ref<HTMLHeadingElement>;
  as?: "h1" | "h2" | "h3";
  level?: "display" | "section" | "card" | "eyebrow";
  tone?: "default" | "brand" | "inverse";
};

const levelClasses = {
  display: "text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl",
  section: "text-3xl font-bold leading-tight tracking-tight sm:text-4xl",
  card: "text-xl font-semibold leading-snug tracking-tight",
  eyebrow: "text-sm font-semibold uppercase tracking-[0.2em]",
};

const toneClasses = {
  default: "text-foreground",
  brand: "text-brand",
  inverse: "text-brand-foreground",
};

export function Heading({
  as: Component = "h2",
  className,
  level = "section",
  tone = "default",
  ...props
}: HeadingProps) {
  const classes = [levelClasses[level], toneClasses[tone], className]
    .filter(Boolean)
    .join(" ");

  return <Component className={classes} {...props} />;
}
