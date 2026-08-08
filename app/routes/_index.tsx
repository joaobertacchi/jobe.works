import { useEffect } from "react";
import { useNavigate } from "react-router";

import { selectPreferredLocale } from "../i18n/config";

export default function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const locale = selectPreferredLocale(navigator.languages);
    void navigate(`/${locale}/`, { replace: true });
  }, [navigate]);

  return (
    <main>
      <p role="status">Selecting language</p>
    </main>
  );
}
