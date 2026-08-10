import type { ReactNode } from "react";

import { DividedSection } from "../ui/divided-section";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

type ContentSectionProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function ContentSection({
  eyebrow,
  title,
  description,
  children,
}: ContentSectionProps) {
  return (
    <DividedSection className="py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-3">
          {eyebrow ? <Text as="span">{eyebrow}</Text> : null}
          <Heading>{title}</Heading>
        </div>
        <div className="flex flex-col gap-6">
          <Text tone="muted">{description}</Text>
          {children}
        </div>
      </div>
    </DividedSection>
  );
}
