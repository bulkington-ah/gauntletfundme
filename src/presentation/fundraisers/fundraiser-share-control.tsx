"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./public-fundraiser-page.module.css";

type FundraiserShareControlProps = {
  buttonClassName: string;
  sharePath: string;
};

type ShareFeedback =
  | {
      kind: "success";
      message: string;
    }
  | {
      kind: "manual";
      message: string;
    }
  | null;

export function FundraiserShareControl({
  buttonClassName,
  sharePath,
}: FundraiserShareControlProps) {
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<ShareFeedback>(null);
  const shareUrl = buildShareUrl(sharePath);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    urlInputRef.current?.focus();
    urlInputRef.current?.select();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setFeedback(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openModal = () => {
    setFeedback(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setFeedback(null);
  };

  const selectShareUrl = () => {
    urlInputRef.current?.focus();
    urlInputRef.current?.select();
  };

  const handleCopy = async () => {
    selectShareUrl();

    if (!navigator.clipboard?.writeText) {
      setFeedback({
        kind: "manual",
        message: "Select the link and copy it manually.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback({
        kind: "success",
        message: "Link copied to clipboard.",
      });
    } catch {
      setFeedback({
        kind: "manual",
        message: "Select the link and copy it manually.",
      });
    }
  };

  return (
    <>
      <button className={buttonClassName} onClick={openModal} type="button">
        Share
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className={styles.shareModalBackdrop}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeModal();
                }
              }}
              role="presentation"
            >
              <div
                aria-describedby={dialogDescriptionId}
                aria-labelledby={dialogTitleId}
                aria-modal="true"
                className={styles.shareModalCard}
                role="dialog"
              >
                <div className={styles.shareModalHeader}>
                  <h2 className={styles.shareModalTitle} id={dialogTitleId}>
                    Share fundraiser
                  </h2>
                </div>

                <p
                  className={styles.shareModalDescription}
                  id={dialogDescriptionId}
                >
                  Copy this fundraiser link to send supporters directly to the
                  page.
                </p>

                <label className={styles.shareField}>
                  <span className={styles.shareLabel}>Fundraiser URL</span>
                  <input
                    ref={urlInputRef}
                    className={styles.shareInput}
                    onFocus={selectShareUrl}
                    readOnly
                    type="text"
                    value={shareUrl}
                  />
                </label>

                {feedback ? (
                  <p
                    className={
                      feedback.kind === "success"
                        ? styles.shareSuccess
                        : styles.shareHint
                    }
                    role={feedback.kind === "success" ? "status" : "alert"}
                  >
                    {feedback.message}
                  </p>
                ) : (
                  <p className={styles.shareHint}>
                    Copy the link to share this fundraiser in messages, email,
                    or social posts.
                  </p>
                )}

                <div className={styles.shareModalActions}>
                  <button
                    className={styles.primaryAction}
                    onClick={handleCopy}
                    type="button"
                  >
                    Copy link
                  </button>
                  <button
                    className={styles.secondaryAction}
                    onClick={closeModal}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

const buildShareUrl = (sharePath: string): string => {
  if (typeof window === "undefined") {
    return sharePath;
  }

  return new URL(sharePath, window.location.origin).toString();
};
