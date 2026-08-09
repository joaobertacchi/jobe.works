import { NotFoundPage } from "../components/not-found-page";

export const handle = { languageSwitcher: false } as const;

export default function LocalizedCatchAll() {
  return <NotFoundPage />;
}
