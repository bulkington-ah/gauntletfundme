"use client";

import { useEffect } from "react";

type SupporterDigestAcknowledgerProps = {
  viewedThrough: string;
};

export function SupporterDigestAcknowledger({
  viewedThrough,
}: SupporterDigestAcknowledgerProps) {
  useEffect(() => {
    const abortController = new AbortController();

    void fetch("/api/engagement/digest-views", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        viewedThrough,
      }),
      signal: abortController.signal,
    }).catch(() => undefined);

    return () => {
      abortController.abort();
    };
  }, [viewedThrough]);

  return null;
}
