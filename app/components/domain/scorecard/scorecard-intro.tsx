import { useI18n } from "../../../i18n/i18n";
import { categoryIds } from "../../../scorecard/questions";
import { Button } from "../../ui/button";
import { Heading } from "../../ui/heading";
import { Text } from "../../ui/text";
import { revealDelay, useHydrated } from "./motion";

const center = 200;
const orbit = 140;

function nodePosition(index: number) {
  const angle = (index / categoryIds.length) * Math.PI * 2 - Math.PI / 2;
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    x: round(center + Math.cos(angle) * orbit),
    y: round(center + Math.sin(angle) * orbit),
  };
}

function CategoryConstellation() {
  const { translate } = useI18n();

  return (
    <svg
      aria-hidden="true"
      className="mx-auto w-full max-w-md overflow-visible"
      viewBox="0 0 400 400"
    >
      <circle
        className="rs-constellation__orbit"
        cx={center}
        cy={center}
        r={orbit}
      />
      {categoryIds.map((category, index) => {
        const { x, y } = nodePosition(index);
        return (
          <g
            className="rs-constellation__node"
            key={category}
            style={revealDelay(index * 140)}
          >
            <line x1={center} x2={x} y1={center} y2={y} />
            <circle cx={x} cy={y} r="7" />
            <text textAnchor="middle" x={x} y={y > center ? y + 28 : y - 16}>
              {translate(`scorecard.categoryShort.${category}`)}
            </text>
          </g>
        );
      })}
      <circle
        className="rs-constellation__core"
        cx={center}
        cy={center}
        r="22"
      />
    </svg>
  );
}

export function ScorecardIntro({ onStart }: { onStart: () => void }) {
  const { translate } = useI18n();
  const hydrated = useHydrated();
  const stats = [
    translate("scorecard.intro.stats.questions"),
    translate("scorecard.intro.stats.duration"),
    translate("scorecard.intro.stats.signup"),
  ];

  return (
    <section
      aria-labelledby="scorecard-intro-title"
      className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="rs-step-enter flex flex-col gap-6">
        <Heading
          className="font-display"
          id="scorecard-intro-title"
          level="display"
        >
          {translate("scorecard.intro.title")}
        </Heading>
        <Text className="max-w-xl text-lg" tone="muted">
          {translate("scorecard.intro.description")}
        </Text>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {stats.map((stat) => (
            <li
              className="flex items-center gap-2 font-display text-base font-semibold uppercase tracking-wider text-foreground"
              key={stat}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-brand"
              />
              {stat}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          <Button disabled={!hydrated} onClick={onStart}>
            {translate("scorecard.intro.start")}
          </Button>
          <Text as="span" className="text-sm" tone="muted">
            {translate("scorecard.intro.note")}
          </Text>
        </div>
      </div>
      <CategoryConstellation />
    </section>
  );
}
