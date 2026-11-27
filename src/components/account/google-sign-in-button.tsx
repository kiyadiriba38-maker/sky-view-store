"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            nonce: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: "filled_black";
              size: "large";
              shape: "pill";
              width: number;
              text: "continue_with";
            },
          ) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  clientId,
  redirectTo,
}: {
  clientId: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const initializeGoogle = async () => {
      const nonceResponse = await fetch("/api/auth/google/nonce", {
        credentials: "include",
        cache: "no-store",
      });
      if (!nonceResponse.ok) {
        throw new Error("Google sign-in is not configured yet.");
      }
      const { nonce } = (await nonceResponse.json()) as { nonce: string };

      const render = () => {
        const googleID = window.google?.accounts?.id;
        const container = containerRef.current;
        if (!active || !googleID || !container) return;

        googleID.initialize({
          client_id: clientId,
          nonce,
          auto_select: false,
          callback: async ({ credential }) => {
            if (!credential || !active) {
              setError("Google could not verify this sign-in. Please try again.");
              return;
            }

            setBusy(true);
            setError("");
            try {
              const response = await fetch("/api/auth/google/callback", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
              });
              const result = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(result?.message || "Google sign-in failed. Please try again.");
              }
              router.push(redirectTo);
              router.refresh();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Google sign-in failed. Please try again.");
            } finally {
              setBusy(false);
            }
          },
        });

        container.innerHTML = "";
        googleID.renderButton(container, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          width: Math.min(320, container.clientWidth || 320),
          text: "continue_with",
        });
      };

      if (window.google?.accounts?.id) {
        render();
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (existingScript) {
        existingScript.addEventListener("load", render, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = render;
      script.onerror = () => setError("Google sign-in could not load. Please try email sign-in.");
      document.head.appendChild(script);
    };

    initializeGoogle().catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Google sign-in is unavailable.");
    });

    return () => {
      active = false;
    };
  }, [clientId, redirectTo, router]);

  return (
    <div className="mt-4">
      <div
        ref={containerRef}
        className={`flex min-h-11 justify-center transition-opacity ${busy ? "pointer-events-none opacity-50" : ""}`}
      />
      {busy ? <p className="mt-2 text-center text-[10px] text-white/45">Signing in securely…</p> : null}
      {error ? <p role="alert" className="mt-2 text-center text-[10px] leading-5 text-rose-200">{error}</p> : null}
    </div>
  );
}
