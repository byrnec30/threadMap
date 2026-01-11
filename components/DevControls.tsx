"use client";

import { useThreadStore } from "../store/ThreadStore";

export default function DevControls() {
  const reset = useThreadStore((s) => s.reset);

  return (
    <div className="z-50 rounded-lg border border-red-200 bg-white p-3 shadow-sm">

      <button
        type="button"
        onClick={() => {

          reset();
          // optional: hard reload so any mount logic runs cleanly
          window.location.reload();
        }}
        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Reset ThreadMap
      </button>
    </div>
  );
}
