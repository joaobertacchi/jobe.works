import { isSupportedLocale } from "../i18n/config";

export function isCanonicalLocalizedPathname(pathname: string): boolean {
  const segments = pathname.split("/");
  const locale = segments[1];
  if (segments[0] !== "" || !locale || !isSupportedLocale(locale)) {
    return false;
  }
  if (pathname === `/${locale}/`) return true;

  const pathSegments = segments.slice(2);
  return (
    !pathname.endsWith("/") &&
    pathSegments.length > 0 &&
    pathSegments.every(
      (segment) => segment.length > 0 && segment === segment.toLowerCase(),
    )
  );
}
