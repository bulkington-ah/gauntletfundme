"use client";

let registrationPromise: Promise<void> | null = null;

if (canRegisterWebAwesome()) {
  void ensureWebAwesomeRegistered();
}

export function WebAwesomeRegistry() {
  return null;
}

function ensureWebAwesomeRegistered(): Promise<void> {
  registrationPromise ??= registerWebAwesome();

  return registrationPromise;
}

async function registerWebAwesome() {
  const [{ setBasePath }] = await Promise.all([
    import("@awesome.me/webawesome/dist/webawesome.js"),
    import("@awesome.me/webawesome/dist/components/avatar/avatar.js"),
    import("@awesome.me/webawesome/dist/components/badge/badge.js"),
    import("@awesome.me/webawesome/dist/components/button/button.js"),
    import("@awesome.me/webawesome/dist/components/card/card.js"),
    import("@awesome.me/webawesome/dist/components/details/details.js"),
    import("@awesome.me/webawesome/dist/components/divider/divider.js"),
    import("@awesome.me/webawesome/dist/components/progress-bar/progress-bar.js"),
    import("@awesome.me/webawesome/dist/components/progress-ring/progress-ring.js"),
    import("@awesome.me/webawesome/dist/components/tab-group/tab-group.js"),
    import("@awesome.me/webawesome/dist/components/tab/tab.js"),
    import("@awesome.me/webawesome/dist/components/tab-panel/tab-panel.js"),
  ]);

  setBasePath("/");
}

function canRegisterWebAwesome(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return !window.navigator.userAgent.toLowerCase().includes("jsdom");
}
