import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  const classes = ["atlas-plate p-6 sm:p-8", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
