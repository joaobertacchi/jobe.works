type IsometricMotifProps = {
  className?: string;
};

export function IsometricMotif({ className }: IsometricMotifProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 480 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="var(--hairline)" strokeWidth="1" fill="none">
        <path d="M0 330 L480 330" />
        <path d="M0 280 L480 280" />
        <path d="M0 230 L480 230" />
        <path d="M0 180 L480 180" />
        <path d="M0 130 L480 130" />
        <path d="M0 80 L480 80" />
        <path d="M0 30 L480 30" />
        <path d="M40 400 L40 0" />
        <path d="M120 400 L120 0" />
        <path d="M200 400 L200 0" />
        <path d="M280 400 L280 0" />
        <path d="M360 400 L360 0" />
        <path d="M440 400 L440 0" />
      </g>
      <g transform="translate(240 190)" stroke="var(--brand)" fill="none">
        <path
          d="M0 -90 L78 -45 L78 45 L0 90 L-78 45 L-78 -45 Z"
          strokeWidth="1.5"
        />
        <path d="M0 -90 L0 90" strokeWidth="1" opacity="0.5" />
        <path d="M-78 -45 L78 45" strokeWidth="1" opacity="0.5" />
        <path d="M-78 45 L78 -45" strokeWidth="1" opacity="0.5" />
        <path d="M-130 -75 L-130 75 L-52 75" strokeWidth="1" opacity="0.35" />
        <path d="M130 -75 L130 75 L52 75" strokeWidth="1" opacity="0.35" />
        <path d="M-130 -75 L130 -75" strokeWidth="1" opacity="0.35" />
        <path d="M0 90 L-130 75" strokeWidth="1" opacity="0.35" />
        <path d="M0 90 L130 75" strokeWidth="1" opacity="0.35" />
        <path d="M0 -90 L-130 -75" strokeWidth="1" opacity="0.35" />
        <path d="M0 -90 L130 -75" strokeWidth="1" opacity="0.35" />
      </g>
    </svg>
  );
}
