import type { ReactNode } from "react";

import { Container } from "./container";

type DividedSectionProps = {
  className?: string;
  children: ReactNode;
};

export function DividedSection({ className, children }: DividedSectionProps) {
  return (
    <section className={className}>
      <Container>
        <div className="border-t border-border pt-10">{children}</div>
      </Container>
    </section>
  );
}
