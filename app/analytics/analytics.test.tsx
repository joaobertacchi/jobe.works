import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Link, MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ConsentSnapshot } from "../consent/consent";
import { AnalyticsProvider, useAnalytics } from "./analytics";
import { consoleTracker } from "./trackers/console";
import { defaultTrackerRegistrations } from "./trackers";
import type { AnalyticsCustomEvent, TrackerRegistration } from "./types";

function Harness({
  consent,
  trackers,
  children,
}: {
  consent: ConsentSnapshot;
  trackers?: readonly TrackerRegistration[];
  children?: React.ReactNode;
}) {
  return (
    <MemoryRouter initialEntries={["/en/"]}>
      <AnalyticsProvider consent={consent} trackers={trackers}>
        {children ?? <Probe />}
      </AnalyticsProvider>
    </MemoryRouter>
  );
}

function Probe() {
  const { capture, attribution } = useAnalytics();
  return (
    <div>
      <button
        onClick={() =>
          capture({ eventName: "cta_pressed", ctaId: "probe", context: "test" })
        }
      >
        Emit
      </button>
      <Link to="/en/about">About</Link>
      <span data-testid="attribution-source">{attribution.source ?? ""}</span>
    </div>
  );
}

const accepted: ConsentSnapshot = { analytics: true, marketing: true };
const rejected: ConsentSnapshot = { analytics: false, marketing: false };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAnalytics", () => {
  it("throws outside the provider", () => {
    expect(() => render(<Probe />)).toThrow(
      "useAnalytics must be used within AnalyticsProvider",
    );
  });
});

describe("AnalyticsProvider", () => {
  it("forwards typed events to eligible trackers", async () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Emit" }));

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "cta_pressed",
        ctaId: "probe",
        context: "test",
      });
    });
  });

  it("does not forward events before consent is granted", () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={rejected}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Emit" }));

    expect(tracker).not.toHaveBeenCalled();
  });

  it("never throws when a tracker fails", async () => {
    const failingTracker = vi.fn(() => {
      throw new Error("Provider down");
    });
    const healthyTracker = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <Harness
        consent={accepted}
        trackers={[
          { tracker: failingTracker, consentCategory: "analytics" },
          { tracker: healthyTracker, consentCategory: "analytics" },
        ]}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Emit" }));
    });

    expect(healthyTracker).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[analytics] tracker failed",
      expect.any(Error),
    );
  });

  it("dispatches a page view for the current pathname on mount when consent is granted", async () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
  });

  it("does not dispatch a page view before analytics consent", async () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={rejected}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await act(() => Promise.resolve());

    expect(tracker).not.toHaveBeenCalled();
  });

  it("dispatches a page view after navigation", async () => {
    const tracker = vi.fn();
    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });

    fireEvent.click(screen.getByRole("link", { name: "About" }));

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/about",
        locale: "en",
      });
    });
  });

  it("does not dispatch same page view twice without navigation or newly eligible trackers", async () => {
    const tracker = vi.fn();
    const { rerender } = render(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });

    rerender(
      <Harness
        consent={{ analytics: true, marketing: true }}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });

    const pageViews = tracker.mock.calls.filter(
      ([event]) => event.eventName === "page_view",
    );
    expect(pageViews).toHaveLength(1);
  });

  it("stops dispatching events and page views after consent is withdrawn", async () => {
    const tracker = vi.fn();
    const { rerender } = render(
      <Harness
        consent={{ analytics: true, marketing: false }}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
    expect(tracker).toHaveBeenCalledTimes(1);

    rerender(
      <Harness
        consent={rejected}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Emit" }));
    fireEvent.click(screen.getByRole("link", { name: "About" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(tracker).toHaveBeenCalledTimes(1);
  });

  it("dispatches a page view for the current pathname when consent becomes eligible", async () => {
    const tracker = vi.fn();
    const { rerender } = render(
      <Harness
        consent={rejected}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );
    await act(() => Promise.resolve());
    expect(tracker).not.toHaveBeenCalled();

    rerender(
      <Harness
        consent={accepted}
        trackers={[{ tracker, consentCategory: "analytics" }]}
      />,
    );

    await waitFor(() => {
      expect(tracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
  });

  it("only dispatches the current page view to trackers that become eligible", async () => {
    const analyticsTracker = vi.fn();
    const marketingTracker = vi.fn();
    const trackers: readonly TrackerRegistration[] = [
      { tracker: analyticsTracker, consentCategory: "analytics" },
      { tracker: marketingTracker, consentCategory: "marketing" },
    ];

    const { rerender } = render(
      <Harness
        consent={{ analytics: true, marketing: false }}
        trackers={trackers}
      />,
    );
    await waitFor(() => {
      expect(analyticsTracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
    expect(marketingTracker).not.toHaveBeenCalled();
    expect(
      analyticsTracker.mock.calls.filter(
        ([event]) => event.eventName === "page_view",
      ),
    ).toHaveLength(1);

    rerender(
      <Harness
        consent={{ analytics: true, marketing: true }}
        trackers={trackers}
      />,
    );

    await waitFor(() => {
      expect(marketingTracker).toHaveBeenCalledWith({
        eventName: "page_view",
        pathname: "/en/",
        locale: "en",
      });
    });
    expect(
      marketingTracker.mock.calls.filter(
        ([event]) => event.eventName === "page_view",
      ),
    ).toHaveLength(1);
    expect(
      analyticsTracker.mock.calls.filter(
        ([event]) => event.eventName === "page_view",
      ),
    ).toHaveLength(1);
  });

  it("exposes landing attribution parsed from the current URL", () => {
    window.history.replaceState(null, "", "/en/?utm_source=newsletter");

    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker: vi.fn(), consentCategory: "analytics" }]}
      />,
    );

    expect(screen.getByTestId("attribution-source")).toHaveTextContent(
      "newsletter",
    );
  });

  it("exposes an empty attribution when the URL has no allowlisted parameters", () => {
    window.history.replaceState(null, "", "/en/?gclid=abc123");

    render(
      <Harness
        consent={accepted}
        trackers={[{ tracker: vi.fn(), consentCategory: "analytics" }]}
      />,
    );

    expect(screen.getByTestId("attribution-source")).toHaveTextContent("");
  });
});

describe("console tracker", () => {
  it("logs events through console.debug", () => {
    const debug = vi
      .spyOn(console, "debug")
      .mockImplementation(() => undefined);
    const event: AnalyticsCustomEvent = {
      eventName: "cta_pressed",
      ctaId: "hero-cta",
      context: "homepage",
    };

    consoleTracker(event);

    expect(debug).toHaveBeenCalledWith("[analytics]", event);
  });

  it("is registered as an analytics-consent tracker", () => {
    expect(defaultTrackerRegistrations).toContainEqual({
      tracker: consoleTracker,
      consentCategory: "analytics",
    });
  });
});
