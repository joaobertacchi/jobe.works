import { Link } from "react-router";

type AtlasActionProps = {
  children: React.ReactNode;
  className?: string;
  index?: string;
  onClick?: () => void;
  to: string;
  variant?: "primary" | "secondary" | "light";
};

export function AtlasAction({
  children,
  className,
  index,
  onClick,
  to,
  variant,
}: AtlasActionProps) {
  const classes = [
    "atlas-action",
    variant ? `atlas-action--${variant}` : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={classes} onClick={onClick} to={to}>
      {index ? (
        <span aria-hidden="true" className="atlas-action__index">
          {index}
        </span>
      ) : null}
      <span>{children}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 12h14m-5-5 5 5-5 5" />
      </svg>
    </Link>
  );
}
