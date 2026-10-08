import type { HTMLAttributes, Ref } from "react";

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  ref?: Ref<HTMLHeadingElement>;
  as?: "h1" | "h2" | "h3";
  level?: "display" | "section" | "card" | "eyebrow";
  tone?: "default" | "brand" | "inverse";
};

const levelClasses = {
  display:
    "font-display text-[clamp(2.75rem,5vw,5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-balance",
  section:
    "font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold uppercase leading-none tracking-[-0.02em] text-balance",
  card: "font-display text-[clamp(1.4rem,2.2vw,2rem)] font-semibold uppercase leading-[1.05] tracking-[-0.02em]",
  eyebrow: "font-display text-sm font-semibold uppercase tracking-[0.09em]",
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
