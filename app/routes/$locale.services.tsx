import { ServiceCard } from "../components/domain/service-card";
import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { useI18n } from "../i18n/i18n";

export default function Services() {
  const { translate } = useI18n();
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <Heading as="h1" level="display">
          {translate("services.title")}
        </Heading>
        <Text className="mt-6 max-w-3xl" tone="muted">
          {translate("services.description")}
        </Text>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            title={translate("services.items.foundation.title")}
            description={translate("services.items.foundation.description")}
          />
          <ServiceCard
            title={translate("services.items.localization.title")}
            description={translate("services.items.localization.description")}
          />
          <ServiceCard
            title={translate("services.items.delivery.title")}
            description={translate("services.items.delivery.description")}
          />
        </div>
      </Container>
    </main>
  );
}
