import { Container } from "../components/ui/container";
import { Heading } from "../components/ui/heading";
import { Text } from "../components/ui/text";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { caseTranslations } from "../i18n/translations/case";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale.case";

type CaseBlock =
  | { type: "paragraph"; text: string }
  | { type: "note"; label: string; text: string }
  | { type: "principle"; label: string; text: string };

type CaseSection = {
  heading: string;
  blocks: CaseBlock[];
};

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  return createPageMeta(params.locale, getSeoLoaderData(matches), {
    ...caseTranslations[params.locale].seo,
    indexable: true,
  });
}

function CaseBlockView({ block }: { block: CaseBlock }) {
  if (block.type === "principle") {
    return (
      <blockquote className="border-l-2 border-brand pl-4">
        <Text>
          <strong>{block.label}</strong> {block.text}
        </Text>
      </blockquote>
    );
  }

  if (block.type === "note") {
    return (
      <Text tone="muted">
        <strong className="font-semibold text-foreground">{block.label}</strong>{" "}
        {block.text}
      </Text>
    );
  }

  return <Text tone="muted">{block.text}</Text>;
}

export default function CaseStudy() {
  const { translate } = useI18n();

  const sections: CaseSection[] = [
    {
      heading: translate("case.sections.funnel.heading"),
      blocks: [
        { type: "paragraph", text: translate("case.sections.funnel.context") },
        { type: "paragraph", text: translate("case.sections.funnel.strategy") },
        {
          type: "note",
          label: translate("case.sections.funnel.decision.label"),
          text: translate("case.sections.funnel.decision.text"),
        },
        {
          type: "note",
          label: translate("case.sections.funnel.result.label"),
          text: translate("case.sections.funnel.result.text"),
        },
        {
          type: "principle",
          label: translate("case.sections.funnel.principle.label"),
          text: translate("case.sections.funnel.principle.text"),
        },
      ],
    },
    {
      heading: translate("case.sections.pipelines.heading"),
      blocks: [
        {
          type: "paragraph",
          text: translate("case.sections.pipelines.constraint"),
        },
        {
          type: "paragraph",
          text: translate("case.sections.pipelines.operation"),
        },
        {
          type: "paragraph",
          text: translate("case.sections.pipelines.maintenance"),
        },
        {
          type: "note",
          label: translate("case.sections.pipelines.decision.label"),
          text: translate("case.sections.pipelines.decision.text"),
        },
        {
          type: "principle",
          label: translate("case.sections.pipelines.principle.label"),
          text: translate("case.sections.pipelines.principle.text"),
        },
      ],
    },
    {
      heading: translate("case.sections.ai.heading"),
      blocks: [
        { type: "paragraph", text: translate("case.sections.ai.limitation") },
        {
          type: "note",
          label: translate("case.sections.ai.decision.label"),
          text: translate("case.sections.ai.decision.text"),
        },
        { type: "paragraph", text: translate("case.sections.ai.modelChoice") },
        {
          type: "principle",
          label: translate("case.sections.ai.principle.label"),
          text: translate("case.sections.ai.principle.text"),
        },
      ],
    },
    {
      heading: translate("case.sections.conclusion.heading"),
      blocks: [
        {
          type: "paragraph",
          text: translate("case.sections.conclusion.status"),
        },
        { type: "paragraph", text: translate("case.sections.conclusion.next") },
        {
          type: "paragraph",
          text: translate("case.sections.conclusion.commitment"),
        },
      ],
    },
  ];

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <article className="mx-auto flex max-w-3xl flex-col gap-10">
          <header className="flex flex-col gap-4">
            <Heading as="h1" level="display">
              {translate("case.title")}
            </Heading>
            <Text className="text-lg font-medium">
              {translate("case.subtitle")}
            </Text>
          </header>

          <div className="flex flex-col gap-4">
            <Text tone="muted">{translate("case.introduction.context")}</Text>
            <Text tone="muted">{translate("case.introduction.system")}</Text>
            <Text tone="muted">{translate("case.introduction.overview")}</Text>
          </div>

          {sections.map((section) => (
            <section
              className="flex flex-col gap-4 border-t border-border pt-10"
              key={section.heading}
            >
              <Heading as="h2" level="section">
                {section.heading}
              </Heading>
              <div className="flex flex-col gap-4">
                {section.blocks.map((block, index) => (
                  <CaseBlockView block={block} key={index} />
                ))}
              </div>
            </section>
          ))}
        </article>
      </Container>
    </main>
  );
}
