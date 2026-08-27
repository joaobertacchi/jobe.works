import { Link } from "react-router";

import { useAnalytics } from "../analytics/analytics";
import { SystemsTopology } from "../components/domain/systems-topology";
import { isSupportedLocale } from "../i18n/config";
import { useI18n } from "../i18n/i18n";
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
      alternateName: "JOBE — Engineering that Works",
      email: "joao@jobe.works",
      url: new URL(loaderData.urls[params.locale], `${loaderData.site.origin}/`)
        .href,
    },
  });
}

export default function Home() {
  const { locale, translate } = useI18n();
  const { capture } = useAnalytics();

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

  function captureCta(ctaId: string) {
    capture({ eventName: "cta_pressed", ctaId, context: "homepage" });
  }

  return (
    <main className="home-atlas">
      <section className="atlas-hero" aria-labelledby="home-title">
        <div className="atlas-plane atlas-proposition">
          <h1 className="atlas-display" id="home-title">
            {translate("home.hero.title")}
          </h1>
          <Link
            className="atlas-action atlas-mobile-primary"
            to={`/${locale}/contact`}
            onClick={() => captureCta("hero-book-call")}
          >
            <span>{translate("home.hero.ctaPrimary")}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </Link>
          <p className="atlas-proposition__description">
            {translate("home.hero.description")}
          </p>
          <p className="atlas-proposition__method">
            {translate("home.services.description")}
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
            <Link
              className="atlas-action atlas-action--primary"
              to={`/${locale}/contact`}
              onClick={() => captureCta("hero-book-call")}
            >
              <span aria-hidden="true" className="atlas-action__index">
                01
              </span>
              <span>{translate("home.hero.ctaPrimary")}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </Link>
            <Link
              className="atlas-action atlas-action--secondary"
              to={`/${locale}/case`}
              onClick={() => captureCta("hero-stockcast")}
            >
              <span aria-hidden="true" className="atlas-action__index">
                02
              </span>
              <span>{translate("home.hero.ctaSecondary")}</span>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </Link>
          </nav>
        </aside>

        <svg
          aria-hidden="true"
          className="atlas-cross-route"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path d="M0 78H300l70-46h296l80 34h454" pathLength="1" />
          <circle cx="0" cy="78" r="8" />
          <circle cx="666" cy="32" r="10" />
          <circle cx="1200" cy="66" r="8" />
        </svg>
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
          <Link
            className="atlas-action atlas-action--light"
            to={`/${locale}/case`}
            onClick={() => captureCta("case-read")}
          >
            <span>{translate("home.case.link")}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </Link>
        </div>
        <div
          className="atlas-scorecard"
          aria-label={translate("home.atlas.evidenceStatus")}
        >
          <div className="atlas-scorecard__header">
            <span>{translate("home.atlas.evidenceStatus")}</span>
            <span aria-hidden="true">SC–00</span>
          </div>
          {Object.values(homeTranslations[locale].atlas.labels)
            .slice(0, 5)
            .map((label) => (
              <div className="atlas-scorecard__row" key={label}>
                <span>{label}</span>
                <span aria-hidden="true" className="atlas-scorecard__track" />
                <span aria-hidden="true">—</span>
              </div>
            ))}
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
        <Link
          className="atlas-action atlas-method__action"
          to={`/${locale}/contact`}
          onClick={() => captureCta("funnel-book-call")}
        >
          <span>{translate("home.hero.ctaPrimary")}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </Link>
      </section>
    </main>
  );
}
