import { useRef } from "react";
import { Link } from "react-router";

import { useAnalytics } from "../analytics/analytics";
import { AtlasAction } from "../components/domain/atlas-action";
import { AtlasCrossRoute } from "../components/domain/atlas-cross-route";
import { SystemsTopology } from "../components/domain/systems-topology";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
import { commonTranslations } from "../i18n/translations/common";
import { homeTranslations } from "../i18n/translations/home";
import { createPageMeta, getSeoLoaderData } from "../seo/metadata";
import type { Route } from "./+types/$locale._index";

export function meta({ matches, params }: Route.MetaArgs) {
  if (!params.locale || !isSupportedLocale(params.locale)) return [];
  const loaderData = getSeoLoaderData(matches);
  const seo = homeTranslations[params.locale].seo;
  return createPageMeta(params.locale, loaderData, {
    ...seo,
    indexable: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: loaderData.site.siteName,
      alternateName: seo.title,
      email: commonTranslations[params.locale].footer.email,
      url: new URL(loaderData.urls[params.locale], `${loaderData.site.origin}/`)
        .href,
    },
  });
}

export default function Home() {
  const { locale, translate } = useI18n();
  const { capture } = useAnalytics();
  const heroRef = useRef<HTMLElement>(null);

  const services = [
    {
      key: "sprint",
      title: translate("home.services.items.sprint.title"),
      description: translate("home.services.items.sprint.description"),
    },
    {
      key: "fractional",
      title: translate("home.services.items.fractional.title"),
      description: translate("home.services.items.fractional.description"),
    },
    {
      key: "enablement",
      title: translate("home.services.items.enablement.title"),
      description: translate("home.services.items.enablement.description"),
    },
  ] as const;

  const steps = [
    {
      title: translate("home.funnel.steps.call.title"),
      description: translate("home.funnel.steps.call.description"),
      emphasis: false,
    },
    {
      title: translate("home.funnel.steps.diagnosis.title"),
      description: translate("home.funnel.steps.diagnosis.description"),
      emphasis: true,
    },
    {
      title: translate("home.funnel.steps.engagement.title"),
      description: translate("home.funnel.steps.engagement.description"),
      emphasis: false,
    },
  ] as const;

  const scorecardTracks = [
    "context",
    "product",
    "architecture",
    "integrations",
    "security",
  ] as const;

  function captureCta(ctaId: string) {
    capture({ eventName: "cta_pressed", ctaId, context: "homepage" });
  }

  return (
    <main className="home-atlas">
      <section
        aria-labelledby="home-title"
        className="atlas-hero"
        ref={heroRef}
      >
        <div className="atlas-plane atlas-proposition">
          <h1 className="atlas-display" id="home-title">
            {translate("home.hero.title")}
          </h1>
          <AtlasAction
            className="atlas-mobile-primary"
            onClick={() => captureCta("hero-mobile-book-call")}
            to={`/${locale}/contact`}
            variant="primary"
          >
            {translate("home.hero.ctaPrimary")}
          </AtlasAction>
          <p className="atlas-proposition__description">
            {translate("home.hero.description")}
          </p>
          <p className="atlas-proposition__method">
            {translate("home.hero.method")}
          </p>
        </div>

        <div className="atlas-plane atlas-topology-panel">
          <SystemsTopology
            description={translate("home.atlas.topologyDescription")}
            labels={{
              architecture: translate("home.atlas.labels.architecture"),
              context: translate("home.atlas.labels.context"),
              diagnosis: translate("home.atlas.diagnosis"),
              integrations: translate("home.atlas.labels.integrations"),
              observability: translate("home.atlas.labels.observability"),
              product: translate("home.atlas.labels.product"),
              production: translate("home.atlas.labels.production"),
              security: translate("home.atlas.labels.security"),
            }}
            title={translate("home.atlas.topologyTitle")}
          />
        </div>

        <aside className="atlas-plane atlas-decision-rail">
          <div className="atlas-founder-note">
            <p className="atlas-index-name">
              {translate("home.atlas.founderName")}
            </p>
            <p>{translate("home.atlas.founderStatement")}</p>
          </div>

          <nav
            aria-label={translate("common.navigation.contact")}
            className="atlas-actions"
          >
            <AtlasAction
              index="01"
              onClick={() => captureCta("hero-rail-book-call")}
              to={`/${locale}/contact`}
              variant="primary"
            >
              {translate("home.hero.ctaPrimary")}
            </AtlasAction>
            <AtlasAction
              index="02"
              onClick={() => captureCta("hero-stockcast")}
              to={`/${locale}/case`}
              variant="secondary"
            >
              {translate("home.hero.ctaSecondary")}
            </AtlasAction>
          </nav>
        </aside>

        <AtlasCrossRoute heroRef={heroRef} />
      </section>

      <section
        className="atlas-section atlas-services"
        aria-labelledby="services-title"
      >
        <div className="atlas-section__heading">
          <h2 id="services-title">{translate("home.services.title")}</h2>
          <p>{translate("home.services.description")}</p>
          <Link
            className="atlas-inline-link"
            to={`/${locale}/services`}
            onClick={() => captureCta("services-explore")}
          >
            {translate("home.services.link")}
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </Link>
        </div>
        <ol className="atlas-service-route">
          {services.map((service, index) => (
            <li className="atlas-service-stop" key={service.key}>
              <span aria-hidden="true" className="atlas-service-stop__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="atlas-service-stop__node" />
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="atlas-section atlas-case"
        aria-labelledby="case-title"
      >
        <div className="atlas-case__copy">
          <p className="atlas-index-name">{translate("home.case.label")}</p>
          <h2 id="case-title">{translate("home.case.title")}</h2>
          <p>{translate("home.case.description")}</p>
          <AtlasAction
            onClick={() => captureCta("case-read")}
            to={`/${locale}/case`}
            variant="light"
          >
            {translate("home.case.link")}
          </AtlasAction>
        </div>
        <div
          className="atlas-scorecard"
          aria-label={translate("home.atlas.evidenceStatus")}
        >
          <div className="atlas-scorecard__header">
            <span>{translate("home.atlas.evidenceStatus")}</span>
            <span aria-hidden="true">SC-00</span>
          </div>
          {scorecardTracks.map((track) => {
            const label = translate(`home.atlas.labels.${track}`);
            return (
              <div className="atlas-scorecard__row" key={track}>
                <span>{label}</span>
                <span aria-hidden="true" className="atlas-scorecard__track" />
                <span aria-hidden="true">—</span>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className="atlas-section atlas-method"
        aria-labelledby="method-title"
      >
        <div className="atlas-section__heading">
          <h2 id="method-title">{translate("home.funnel.title")}</h2>
          <p>{translate("home.funnel.description")}</p>
        </div>
        <ol className="atlas-method-route">
          {steps.map((step, index) => (
            <li
              className={
                step.emphasis
                  ? "atlas-method-stop is-diagnosis"
                  : "atlas-method-stop"
              }
              key={step.title}
            >
              <span aria-hidden="true" className="atlas-method-stop__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="atlas-method-stop__node" />
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
        <AtlasAction
          className="atlas-method__action"
          onClick={() => captureCta("funnel-book-call")}
          to={`/${locale}/contact`}
        >
          {translate("home.hero.ctaPrimary")}
        </AtlasAction>
      </section>
    </main>
  );
}
