import { Container } from "../ui/container";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";

type HeroSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function HeroSection({ eyebrow, title, description }: HeroSectionProps) {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <Container>
        <div className="flex max-w-3xl flex-col gap-6">
          <Text as="span">{eyebrow}</Text>
          <Heading as="h1" level="display">
            {title}
          </Heading>
          <Text tone="muted">{description}</Text>
        </div>
      </Container>
    </section>
  );
}
