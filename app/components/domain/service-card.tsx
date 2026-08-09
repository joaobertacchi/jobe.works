import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

type ServiceCardProps = {
  title: string;
  description: string;
};

export function ServiceCard({ title, description }: ServiceCardProps) {
  return (
    <article className="h-full">
      <Card className="flex h-full flex-col gap-3">
        <Heading as="h2" level="card">
          {title}
        </Heading>
        <Text tone="muted">{description}</Text>
      </Card>
    </article>
  );
}
