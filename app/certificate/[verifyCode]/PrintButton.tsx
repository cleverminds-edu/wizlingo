"use client";

// Client component: the certificate page is a server component and cannot attach onClick itself.
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
    >
      🖨️ Print Certificate
    </button>
  );
}
