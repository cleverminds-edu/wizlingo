import { prisma } from "@/lib/prisma";
import { BADGE_META } from "@/lib/badges";
import { notFound } from "next/navigation";
import CertificateDownloadButton from "@/components/certificate-download-button";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ verifyCode: string }>;
}) {
  const { verifyCode } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { verifyCode },
    include: {
      student: {
        include: {
          class: {
            include: { school: { select: { name: true, logoUrl: true } } },
          },
        },
      },
    },
  });

  if (!cert) notFound();

  const meta = BADGE_META[cert.badgeType];
  const student = cert.student;
  const school = student.class.school;
  const issuedDate = cert.issuedAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const gradeBand = {
    BAND_1_2: "Grade 1–2",
    BAND_3_5: "Grade 3–5",
    BAND_6_8: "Grade 6–8",
    BAND_9_10: "Grade 9–10",
  }[student.class.grade <= 2 ? "BAND_1_2" : student.class.grade <= 5 ? "BAND_3_5" : student.class.grade <= 8 ? "BAND_6_8" : "BAND_9_10"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f3e8ff 100%)" }}>

      {/* Action buttons */}
      <div className="mb-6 flex gap-3 print:hidden flex-wrap justify-center">
        <CertificateDownloadButton
          studentId={student.id}
          badgeType={cert.badgeType}
          verifyCode={verifyCode}
        />
        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          🖨️ Print Certificate
        </button>
        <a
          href="/"
          className="px-6 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
        >
          ← Back to WizLingo
        </a>
      </div>

      {/* Certificate */}
      <div
        id="certificate"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden print:shadow-none print:rounded-none"
        style={{ border: "8px solid transparent", backgroundClip: "padding-box" }}
      >
        {/* Top accent bar */}
        <div className="h-3 w-full" style={{ background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)" }} />

        <div className="p-12">
          {/* Header logos */}
          <div className="flex items-center justify-between mb-10">
            {/* School logo / name */}
            <div className="flex items-center gap-3">
              {school.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={school.logoUrl} alt={school.name} className="h-14 w-auto object-contain" />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-2xl"
                  style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
                  {school.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-base leading-tight">{school.name}</p>
                <p className="text-gray-400 text-xs">Presented by</p>
              </div>
            </div>

            {/* WizLingo brand */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl"
                style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
                🧙
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg leading-none">WizLingo</p>
                <p className="text-gray-400 text-xs">Read. Speak. Excel.</p>
              </div>
            </div>
          </div>

          {/* Certificate body */}
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 mb-4">
              Certificate of Achievement
            </p>

            <p className="text-gray-500 text-lg mb-3">This certifies that</p>

            <h1 className="text-5xl font-black text-gray-900 mb-3"
              style={{ fontFamily: "Georgia, serif" }}>
              {student.name}
            </h1>

            <p className="text-gray-500 text-base mb-8">
              {gradeBand} · Grade {student.class.grade}-{student.class.section}
            </p>

            {/* Badge showcase */}
            <div className="inline-flex flex-col items-center gap-3 mb-8">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-lg bg-gradient-to-br ${meta.color}`}>
                {meta.emoji}
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{meta.label}</p>
                <p className="text-gray-500 text-sm mt-1">{meta.description}</p>
              </div>
            </div>

            {/* Description text */}
            <p className="text-gray-600 text-base leading-relaxed max-w-lg mx-auto mb-10">
              {cert.badgeType === "LANGUAGE_WIZARD"
                ? "has demonstrated exceptional proficiency in both reading and speaking skills, completing multiple levels and showing consistent improvement in language communication."
                : cert.badgeType === "GRAND_WIZARD"
                  ? "has mastered the highest level of reading for their grade band, demonstrating outstanding fluency, accuracy, and comprehension."
                  : "has shown remarkable dedication and skill in developing their language abilities through WizLingo."}
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-2xl">🌟</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Footer info */}
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date Issued</p>
                <p className="text-gray-700 font-semibold">{issuedDate}</p>
              </div>
              <div className="text-center">
                <div className="text-xs font-mono text-gray-300 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  Verify: wizlingo.app/certificate/{verifyCode.slice(0, 12)}…
                </div>
              </div>
              <div className="text-right">
                <div className="border-t-2 border-gray-300 pt-1 w-36">
                  <p className="text-xs text-gray-400">Authorised by WizLingo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-3 w-full" style={{ background: "linear-gradient(90deg, #ec4899, #a855f7, #6366f1)" }} />
      </div>

      <p className="mt-6 text-xs text-gray-400 print:hidden">
        Verification code: <span className="font-mono">{verifyCode}</span>
      </p>
    </div>
  );
}
