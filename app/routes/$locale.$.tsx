import NotFound from "./$locale.404";

export const handle = { languageSwitcher: false } as const;

export default function LocalizedCatchAll() {
  return <NotFound />;
}
