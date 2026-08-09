import type { HTMLAttributes } from "react";

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span";
  tone?: "default" | "muted";
};

const toneClasses = {
  default: "text-foreground",
  muted: "text-muted-foreground",
};

export function Text({
  as: Component = "p",
  className,
  tone = "default",
  ...props
}: TextProps) {
  const classes = ["text-base leading-relaxed", toneClasses[tone], className]
    .filter(Boolean)
    .join(" ");

  return <Component className={classes} {...props} />;
}
