import type { HTMLAttributes } from "react";

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
  level?: "display" | "section" | "card";
};

const levelClasses = {
  display: "font-serif text-4xl font-semibold leading-tight sm:text-6xl",
  section: "font-serif text-3xl font-semibold leading-tight sm:text-4xl",
  card: "font-serif text-xl font-semibold leading-snug",
};

export function Heading({
  as: Component = "h2",
  className,
  level = "section",
  ...props
}: HeadingProps) {
  const classes = [levelClasses[level], "text-foreground", className]
    .filter(Boolean)
    .join(" ");

  return <Component className={classes} {...props} />;
}
