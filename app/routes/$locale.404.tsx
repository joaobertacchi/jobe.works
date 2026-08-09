import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { useI18n } from "../i18n/i18n";

export default function NotFound() {
  const { translate } = useI18n();
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="flex max-w-3xl flex-col gap-6">
          <Heading as="h1" level="display">
            {translate("notFound.title")}
          </Heading>
          <Text tone="muted">{translate("notFound.description")}</Text>
        </div>
      </Container>
    </main>
  );
}
