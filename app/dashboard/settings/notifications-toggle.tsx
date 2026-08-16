"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "idle" | "checking" | "enabling" | "enabled" | "unsupported" | "denied" | "error";

export default function NotificationsToggle({ businessId }: { businessId: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    navigator.serviceWorker
      .getRegistration()
      .then(async (reg) => {
        if (!reg) {
          setStatus("idle");
          return;
        }
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub ? "enabled" : "idle");
      })
      .catch(() => setStatus("idle"));
  }, []);

  async function enable() {
    setStatus("enabling");
    setErrorDetail(null);
    try {
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        setErrorDetail("NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing from this build.");
        setStatus("error");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      const subJson = sub.toJSON();
      const supabase = createClient();
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          business_id: businessId,
          endpoint: subJson.endpoint!,
          p256dh: subJson.keys!.p256dh!,
          auth: subJson.keys!.auth!,
        },
        { onConflict: "business_id,endpoint" }
      );

      if (error) throw error;
      setStatus("enabled");
    } catch (err) {
      console.error("Push subscribe failed:", err);
      setErrorDetail(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  return (
    <div className="card p-6">
      <span className="mb-1 block text-xs uppercase tracking-widest text-ink-muted">Notifications</span>
      <p className="mb-4 text-sm text-ink-muted">
        Get an instant alert on this device whenever your AI hands a conversation off to you.
      </p>

      {status === "enabled" && <p className="text-sm text-teal">Notifications are on for this device.</p>}
      {status === "unsupported" && <p className="text-sm text-ink-muted">Not supported in this browser.</p>}
      {status === "denied" && (
        <p className="text-sm text-gold">
          Notifications were blocked — enable them in your browser's site settings to turn this on.
        </p>
      )}
      {status === "error" && (
        <p className="mb-3 text-sm text-gold">Something went wrong: {errorDetail || "unknown error"}</p>
      )}
      {(status === "idle" || status === "error") && (
        <button onClick={enable} className="btn-secondary">
          Enable notifications on this device
        </button>
      )}
      {status === "enabling" && (
        <button disabled className="btn-secondary opacity-50">
          Enabling...
        </button>
      )}
    </div>
  );
}
