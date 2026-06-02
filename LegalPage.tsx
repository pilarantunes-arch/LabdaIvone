import { useLocale } from "@/context/LocaleContext";

type LegalPageProps = {
  type: "terms" | "privacy";
};

export default function LegalPage({ type }: LegalPageProps) {
  const { t } = useLocale();
  const title = type === "terms" ? t("legal.termsTitle") : t("legal.privacyTitle");

  return (
    <div className="min-h-screen bg-[#F4F5F0] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#4A5D4E]/60">Labdaivone</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-[#4A5D4E]">{title}</h1>
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-[#F8F8F5] p-8 text-sm leading-7 text-gray-500">
          {t("legal.placeholder")}
        </div>
      </div>
    </div>
  );
}
