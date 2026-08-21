"use client";

import * as React from "react";
import { isValidConvex } from "@/lib/convex/provider";

export function PushAlertManager() {
  if (!isValidConvex) {
    return (
      <script
        async
        src="https://cdn.pushalert.co/unified_618b54c7a30d19a39ece4ecd62b85733.js"
        type="text/javascript"
      />
    );
  }
  return <PushAlertManagerConnected />;
}

function PushAlertManagerConnected() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useMutation, useConvexAuth } = require("convex/react");
  const { api } = require("@/convex/_generated/api");

  const { isAuthenticated } = useConvexAuth();
  const updatePushId = useMutation(api.users.updatePushId);
  const updatePushIdByEmail = useMutation(api.users.updatePushIdByEmail);

  const fallbackEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@lunalimoz.com";

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
        if (window.PushAlertCo) {
            const paSubId = window.PushAlertCo.subs_id || window.PushAlertCo.subscriber_id || window.PushAlertCo.push_id || window.PushAlertCo.sub_id;
            if (paSubId) {
                syncId(paSubId);
                return;
            }
        }

        if (window._pa && window._pa.subscriber_id) {
            syncId(window._pa.subscriber_id);
            return;
        }

        if (window.PushAlertCo && window.PushAlertCo.subscriber_id) {
            syncId(window.PushAlertCo.subscriber_id);
            return;
        }

        if (typeof window.pushalertbyid === "function") {
            window.pushalertbyid(function(result: any) {
                if (result && result.subscriber_id) {
                    syncId(result.subscriber_id);
                }
            });
        }
    }, 5000);

    const syncId = (subId: string) => {
        updatePushId({ pushId: subId })
          .then(() => {
            clearInterval(interval);
          })
          .catch((err: any) => console.error("PushAlertManager: Auth sync failed:", err));
    };

    return () => clearInterval(interval);
  }, [updatePushId, isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated) return;

    const interval = setInterval(() => {
        if (window.PushAlertCo) {
            const paSubId = window.PushAlertCo.subs_id || window.PushAlertCo.subscriber_id || window.PushAlertCo.push_id || window.PushAlertCo.sub_id;
            if (paSubId) {
                updatePushIdByEmail({ pushId: paSubId, email: fallbackEmail })
                  .then(() => clearInterval(interval))
                  .catch((e: any) => console.error("PushAlertManager: Fallback sync failed:", e));
                return;
            }
        }

        if (window._pa && window._pa.subscriber_id) {
            updatePushIdByEmail({ pushId: window._pa.subscriber_id, email: fallbackEmail })
              .then(() => clearInterval(interval))
              .catch((e: any) => console.error("PushAlertManager: Fallback sync failed:", e));
            return;
        }

        if (typeof window.pushalertbyid === "function") {
            window.pushalertbyid(function(result: any) {
                if (result && result.subscriber_id) {
                    updatePushIdByEmail({ pushId: result.subscriber_id, email: fallbackEmail })
                      .then(() => clearInterval(interval))
                      .catch((e: any) => console.error("PushAlertManager: Fallback sync failed:", e));
                }
            });
        }
    }, 5000);

    return () => clearInterval(interval);
  }, [updatePushIdByEmail, isAuthenticated, fallbackEmail]);

  return (
    <script
      async
      src="https://cdn.pushalert.co/unified_618b54c7a30d19a39ece4ecd62b85733.js"
      type="text/javascript"
    />
  );
}
