import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingMapPrototype } from "./ReadingMapPrototype";

// Prototype for Phase 2 task 2.1 (docs/plans/PHASE_1_PILOT_BUILD_PLAN.md).
// Hidden in production unless ENABLE_PROTOTYPES=true. Nothing is saved: all data stays in the browser.
export const metadata: Metadata = {
  title: "Reading map prototype · WizLingo",
  robots: { index: false, follow: false },
};

export default function ReadingMapPage() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_PROTOTYPES !== "true") {
    notFound();
  }
  return <ReadingMapPrototype />;
}
