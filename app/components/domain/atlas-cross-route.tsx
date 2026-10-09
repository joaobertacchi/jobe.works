import { useEffect, useState, type RefObject } from "react";

type CrossRouteGeometry = {
  mode: "desktop" | "mobile";
  width: number;
  height: number;
  startX: number;
  startY: number;
  entryTurnX: number;
  junctionLeft: number;
  junctionRight: number;
  junctionY: number;
  exitTurnX: number;
  approachY: number;
  dockX: number;
  plateTop: number;
};

type AtlasCrossRouteProps = {
  heroRef: RefObject<HTMLElement | null>;
};

const CHAMFER = 18;

type CrossRouteAnchors = {
  junction: SVGGElement | null;
  topology: SVGSVGElement | null;
  mobileHub: SVGGElement | null;
  mobileTopology: SVGSVGElement | null;
  method: HTMLElement | null;
  description: HTMLElement | null;
  founder: HTMLElement | null;
  plate: HTMLElement | null;
};

function queryAnchors(hero: HTMLElement): CrossRouteAnchors {
  return {
    junction: hero.querySelector<SVGGElement>(".systems-topology__junction"),
    topology: hero.querySelector<SVGSVGElement>(".systems-topology--desktop"),
    mobileHub: hero.querySelector<SVGGElement>(
      ".systems-topology__mobile-diagnosis",
    ),
    mobileTopology: hero.querySelector<SVGSVGElement>(
      ".systems-topology--mobile",
    ),
    method: hero.querySelector<HTMLElement>(".atlas-proposition__method"),
    description: hero.querySelector<HTMLElement>(
      ".atlas-proposition__description",
    ),
    founder: hero.querySelector<HTMLElement>(".atlas-founder-note"),
    plate: hero.querySelector<HTMLElement>(
      ".atlas-decision-rail .atlas-action--primary",
    ),
  };
}

function relativeTo(box: DOMRect, heroBox: DOMRect) {
  return {
    left: box.left - heroBox.left,
    right: box.right - heroBox.left,
    top: box.top - heroBox.top,
    bottom: box.bottom - heroBox.top,
  };
}

function resolveGeometry(hero: HTMLElement): CrossRouteGeometry | null {
  // Measured corridor contract: the route only ever runs through empty
  // corridors — above the method line, inside the topology panel's edge
  // insets, above the decision plates — and terminates docked on the
  // primary plate's top edge. If a corridor collapses, it does not draw.
  const anchors = queryAnchors(hero);
  const surface = measureSurface(anchors, hero);
  if (!surface) return null;

  const desktopBox = anchors.topology?.getBoundingClientRect();
  if ((desktopBox?.width ?? 0) > 0) {
    return resolveDesktopGeometry(anchors, surface);
  }

  const mobileBox = anchors.mobileTopology?.getBoundingClientRect();
  if ((mobileBox?.width ?? 0) > 0) {
    return resolveMobileGeometry(anchors, surface);
  }

  return null;
}

function measureSurface(
  anchors: CrossRouteAnchors,
  hero: HTMLElement,
): CrossRouteSurface | null {
  const heroBox = hero.getBoundingClientRect();
  const methodBox = anchors.method?.getBoundingClientRect();
  const descriptionBox = anchors.description?.getBoundingClientRect();
  const plateBox = anchors.plate?.getBoundingClientRect();
  if (!methodBox || !descriptionBox || !plateBox || heroBox.width === 0) {
    return null;
  }

  const label = relativeTo(methodBox, heroBox);
  const copy = relativeTo(descriptionBox, heroBox);
  const rail = relativeTo(plateBox, heroBox);

  return {
    heroBox,
    label,
    copy,
    rail,
    startY: Math.max(label.top - 28, copy.bottom + 12),
  };
}

type CrossRouteSurface = {
  heroBox: DOMRect;
  label: { left: number; right: number; top: number; bottom: number };
  copy: { left: number; right: number; top: number; bottom: number };
  rail: { left: number; right: number; top: number; bottom: number };
  startY: number;
};

function resolveDesktopGeometry(
  anchors: CrossRouteAnchors,
  surface: CrossRouteSurface,
): CrossRouteGeometry | null {
  const heroBox = surface.heroBox;
  const topology = anchors.topology;
  const junction = anchors.junction;
  if (!topology || !junction) return null;

  const junctionBox = junction.getBoundingClientRect();
  const topologyBox = topology.getBoundingClientRect();
  if (topologyBox.width === 0 || junctionBox.width === 0) return null;

  const panel = relativeTo(topologyBox, heroBox);
  const next: CrossRouteGeometry = {
    mode: "desktop",
    width: heroBox.width,
    height: heroBox.height,
    startX: surface.label.left,
    startY: surface.startY,
    entryTurnX: panel.left + 16,
    junctionLeft: junctionBox.left - heroBox.left,
    junctionRight: junctionBox.right - heroBox.left,
    junctionY: junctionBox.top - heroBox.top + junctionBox.height / 2,
    exitTurnX: panel.right - 24, //-24
    approachY: surface.rail.top - 24, //-24
    dockX: surface.rail.left + 32,
    plateTop: surface.rail.top,
  };

  return corridorsAreClear(next) ? next : null;
}

function resolveMobileGeometry(
  anchors: CrossRouteAnchors,
  surface: CrossRouteSurface,
): CrossRouteGeometry | null {
  const heroBox = surface.heroBox;
  const hub = anchors.mobileHub;
  const topology = anchors.mobileTopology;
  if (!hub || !topology) return null;

  const hubBox = hub.getBoundingClientRect();
  const topologyBox = topology.getBoundingClientRect();
  if (topologyBox.width === 0 || hubBox.width === 0) return null;

  const founderBox = anchors.founder?.getBoundingClientRect();
  const founder = {
    bottom: founderBox ? founderBox.bottom - heroBox.top : 0,
    // the exit descends beside the founder note, so its copy must stop short
    copyRight: Math.max(
      0,
      ...Array.from(
        anchors.founder?.children ?? [],
        (child) => child.getBoundingClientRect().right - heroBox.left,
      ),
    ),
  };
  const next: CrossRouteGeometry = {
    mode: "mobile",
    width: heroBox.width,
    height: heroBox.height,
    // the mobile route departs below the method statement — a vertical from
    // above it would strike the full-width method text — and descends the
    // plane's left corridor into the hub's left port
    startX: surface.label.left,
    startY: surface.label.bottom + 14,
    entryTurnX: surface.label.left,
    junctionLeft: hubBox.left - heroBox.left,
    junctionRight: hubBox.right - heroBox.left,
    junctionY: hubBox.top - heroBox.top + hubBox.height / 2,
    // mirrors the entry: the exit turns down the right edge of the text column
    exitTurnX: surface.label.right,
    approachY: surface.rail.top - 14,
    dockX: surface.rail.left + 24,
    plateTop: surface.rail.top,
  };

  return mobileCorridorsAreClear(next, founder) ? next : null;
}

function corridorsAreClear(next: CrossRouteGeometry): boolean {
  return (
    next.entryTurnX - next.startX >= 48 &&
    next.junctionLeft - next.entryTurnX >= 48 &&
    next.exitTurnX - next.junctionRight >= 48
  );
}

function mobileCorridorsAreClear(
  next: CrossRouteGeometry,
  founder: { bottom: number; copyRight: number },
): boolean {
  return (
    next.junctionY - next.startY >= 24 &&
    next.junctionLeft - next.startX >= 24 &&
    next.exitTurnX - next.junctionRight >= 24 &&
    next.plateTop - next.approachY >= 6 &&
    next.approachY - founder.bottom >= 10 &&
    next.exitTurnX - founder.copyRight >= 12
  );
}

export function AtlasCrossRoute({ heroRef }: AtlasCrossRouteProps) {
  const [geometry, setGeometry] = useState<CrossRouteGeometry | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const measure = () => setGeometry(resolveGeometry(hero));

    measure();

    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(hero);
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => {
      observer?.disconnect();
    };
  }, [heroRef]);

  if (!geometry) return null;

  const {
    mode,
    width,
    height,
    startX,
    startY,
    entryTurnX,
    junctionLeft,
    junctionRight,
    junctionY,
    exitTurnX,
    approachY,
    dockX,
    plateTop,
  } = geometry;

  const entryDrop = junctionY - startY;
  const entrySign = Math.sign(entryDrop) || 1;
  const entryChamfer =
    mode === "mobile"
      ? Math.max(
          4,
          Math.min(
            CHAMFER,
            (junctionLeft - startX) / 2,
            Math.abs(entryDrop) / 2,
          ),
        )
      : Math.max(
          4,
          Math.min(
            CHAMFER,
            Math.abs(entryTurnX - startX) / 2,
            Math.abs(entryDrop) / 2,
          ),
        );
  const exitDrop = approachY - junctionY;
  const exitChamfer = Math.max(
    4,
    Math.min(CHAMFER, (exitTurnX - junctionRight) / 2, Math.abs(exitDrop) / 2),
  );
  const dockSign = Math.sign(exitDrop) || 1;
  const dockChamfer = Math.max(
    4,
    Math.min(CHAMFER, Math.abs(dockX - exitTurnX) / 2),
  );
  const dockDirection = Math.sign(dockX - exitTurnX) || 1;

  const entryPath =
    mode === "mobile"
      ? `M${startX} ${startY}V${junctionY - entrySign * entryChamfer}L${startX + entryChamfer} ${junctionY}H${junctionLeft}`
      : [
          `M${startX} ${startY}`,
          `H${entryTurnX - entryChamfer}`,
          `L${entryTurnX} ${startY + entrySign * entryChamfer}`,
          `V${junctionY - entrySign * entryChamfer}`,
          `L${entryTurnX + entryChamfer} ${junctionY}`,
          `H${junctionLeft}`,
        ].join("");

  const exitPath = [
    `M${junctionRight} ${junctionY}`,
    `H${exitTurnX - exitChamfer}`,
    `L${exitTurnX} ${junctionY + dockSign * exitChamfer}`,
    `V${approachY - dockSign * dockChamfer}`,
    `L${exitTurnX + dockDirection * dockChamfer} ${approachY}`,
    `H${dockX}`,
    `V${plateTop}`,
  ].join("");

  return (
    <svg
      aria-hidden="true"
      className="atlas-cross-route"
      viewBox={`0 0 ${width} ${height}`}
    >
      <path d={entryPath} pathLength="1" />
      <path d={exitPath} pathLength="1" />
      <circle cx={startX} cy={startY} r="7" />
      <circle cx={dockX} cy={plateTop} r="7" />
    </svg>
  );
}
