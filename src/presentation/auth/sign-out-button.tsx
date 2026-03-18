"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({
  className,
}: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      className={className}
      disabled={isPending}
      onClick={handleClick}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
