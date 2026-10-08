import type { ReactNode } from "react";

type FunnelStep = {
  title: string;
  description: string;
  emphasis?: boolean;
};

type FunnelSectionProps = {
  id: string;
  title: string;
  description: string;
  steps: readonly FunnelStep[];
  link?: ReactNode;
  actions?: ReactNode;
};

export function FunnelSection({
  id,
  title,
  description,
  steps,
  link,
  actions,
}: FunnelSectionProps) {
  return (
    <section aria-labelledby={id} className="atlas-section atlas-method">
      <div className="atlas-section__heading">
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
        {link}
      </div>
      <ol className="atlas-method-route">
        {steps.map((step, index) => (
          <li
            className={
              step.emphasis
                ? "atlas-method-stop is-diagnosis"
                : "atlas-method-stop"
            }
            key={step.title}
          >
            <span aria-hidden="true" className="atlas-method-stop__index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="atlas-method-stop__node" />
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
      {actions}
    </section>
  );
}
