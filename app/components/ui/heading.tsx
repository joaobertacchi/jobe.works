import type { HTMLAttributes } from "react";

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
  level?: "display" | "section" | "card";
};

const levelClasses = {
  display: "text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl",
  section: "text-3xl font-bold leading-tight tracking-tight sm:text-4xl",
  card: "text-xl font-semibold leading-snug tracking-tight",
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
