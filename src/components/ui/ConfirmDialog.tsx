"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { useUI } from "../providers/UIProvider";

export function ConfirmDialog() {
  const { confirm, close } = useUI();
  const [busy, setBusy] = useState(false);

  return (
    <Modal
      open={!!confirm}
      onClose={() => close("confirm")}
      title={confirm?.title ?? ""}
      size="sm"
      footer={
        <>
          <button className="btn btn-quiet" data-autofocus onClick={() => close("confirm")}>
            Keep it
          </button>
          <button
            className="btn btn-danger"
            disabled={busy}
            onClick={async () => {
              if (!confirm) return;
              setBusy(true);
              try {
                await confirm.onConfirm();
                close("confirm");
              } catch {
                /* toast shown by the data layer */
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirm?.confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[1.02rem] leading-relaxed text-ink-soft">{confirm?.body}</p>
    </Modal>
  );
}
