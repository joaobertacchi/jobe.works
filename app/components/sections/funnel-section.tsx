import type { ReactNode } from "react";

import { Container } from "../ui/container";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

type FunnelStep = {
  title: string;
  description: string;
};

type FunnelSectionProps = {
  title: string;
  description: string;
  steps: readonly FunnelStep[];
  actions?: ReactNode;
};

export function FunnelSection({
  title,
  description,
  steps,
  actions,
}: FunnelSectionProps) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <Heading level="section">{title}</Heading>
          <Text className="mt-4 max-w-2xl" tone="muted">
            {description}
          </Text>
        </div>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              className="flex flex-col gap-3 bg-background p-6 sm:p-8"
              key={step.title}
            >
              <Text
                as="span"
                className="text-sm font-semibold tabular-nums text-brand"
              >
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Heading as="h3" level="card">
                {step.title}
              </Heading>
              <Text tone="muted">{step.description}</Text>
            </li>
          ))}
        </ol>
        {actions ? <div className="mt-10">{actions}</div> : null}
      </Container>
    </section>
  );
}
