// One viewport per responsive tier defined by the breakpoints in app/app.css
// (`48rem`, `72rem`) and described in DESIGN.md "Responsive behavior".
// tests/layouts.test.ts fails if the breakpoints and this list drift apart.
export const layouts = [
  // ≤48rem: single column, mobile topology, vertical steps.
  { name: "phone", viewport: { width: 390, height: 844 } },
  // 48–72rem: two-column hero, decision rail as a full-width band.
  { name: "intermediate", viewport: { width: 900, height: 1000 } },
  // >72rem: three-column hero.
  { name: "desktop", viewport: { width: 1440, height: 900 } },
] as const;

export type LayoutName = (typeof layouts)[number]["name"];
