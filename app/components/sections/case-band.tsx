import type { ReactNode } from "react";

import { Container } from "../ui/container";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

type CaseBandProps = {
  label: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function CaseBand({
  label,
  title,
  description,
  actions,
}: CaseBandProps) {
  return (
    <section className="border-y border-border bg-surface">
      <Container className="py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div className="flex flex-col gap-4">
            <Text
              as="span"
              className="text-sm font-semibold uppercase tracking-widest text-brand"
            >
              {label}
            </Text>
            <Heading level="section">{title}</Heading>
            <Text className="max-w-xl" tone="muted">
              {description}
            </Text>
          </div>
          {actions ? (
            <div className="lg:justify-self-end">{actions}</div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
