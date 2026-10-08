import type { ReactNode } from "react";

type AtlasCtaBandProps = {
  id: string;
  title: string;
  description: string;
  actions: ReactNode;
};

export function AtlasCtaBand({
  id,
  title,
  description,
  actions,
}: AtlasCtaBandProps) {
  return (
    <section aria-labelledby={id} className="atlas-section atlas-cta-band">
      <div className="atlas-cta-band__copy">
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="atlas-cta-band__actions">{actions}</div>
    </section>
  );
}
