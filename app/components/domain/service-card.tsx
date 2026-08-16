import type { ReactNode } from "react";

import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

type ServiceCardProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ServiceCard({ title, description, action }: ServiceCardProps) {
  return (
    <article className="h-full">
      <Card className="flex h-full flex-col gap-3">
        <Heading as="h3" level="card">
          {title}
        </Heading>
        <Text tone="muted">{description}</Text>
        {action ? <div className="mt-auto pt-2">{action}</div> : null}
      </Card>
    </article>
  );
}
