import type { ReactNode } from "react";

import { Container } from "../ui/container";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

type HeroSectionProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  visual?: ReactNode;
};

export function HeroSection({
  title,
  description,
  actions,
  visual,
}: HeroSectionProps) {
  return (
    <section className="py-16 sm:py-24 lg:py-28">
      <Container className="hero-enter">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex max-w-2xl flex-col gap-6">
            <Heading as="h1" level="display">
              {title}
            </Heading>
            <Text className="max-w-xl" tone="muted">
              {description}
            </Text>
            {actions ? (
              <div className="flex flex-wrap items-center gap-4">{actions}</div>
            ) : null}
          </div>
          {visual ? <div className="hidden lg:block">{visual}</div> : null}
        </div>
      </Container>
    </section>
  );
}
