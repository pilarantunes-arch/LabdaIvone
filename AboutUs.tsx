import { Instagram, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export default function AboutUs() {
  const { homepageContent } = useAuth();
  const { t } = useLocale();

  return (
    <div className="min-h-[100dvh] bg-[#F4F5F0] text-foreground">
      <header className="border-b border-[#4A5D4E]/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="font-serif text-3xl font-bold tracking-tight text-[#4A5D4E]">Labdaivone</div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <section className="flex min-h-[620px] flex-col justify-between rounded-[2rem] bg-white p-8 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#4A5D4E]/60">{t("about.kicker")}</p>
            <h1 className="mt-6 font-serif text-5xl font-bold leading-tight tracking-tight text-[#4A5D4E] md:text-6xl">
              {t("about.title")}
            </h1>
          </div>

          <div className="mt-10 max-h-80 overflow-y-auto rounded-3xl border border-[#4A5D4E]/10 bg-[#F8F8F5] p-6">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-[#4A5D4E]">{t("about.bioTitle")}</h2>
            <p className="whitespace-pre-line text-base leading-8 text-gray-700">{homepageContent.bio}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={`https://instagram.com/${homepageContent.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-[#4A5D4E]/10 bg-[#F4F5F0] p-4 text-sm font-bold text-[#4A5D4E] transition hover:bg-[#e8ebe3]"
            >
              <Instagram className="h-5 w-5" />
              {homepageContent.instagram}
            </a>
            <a
              href={`tel:${homepageContent.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 rounded-2xl border border-[#4A5D4E]/10 bg-[#F4F5F0] p-4 text-sm font-bold text-[#4A5D4E] transition hover:bg-[#e8ebe3]"
            >
              <Phone className="h-5 w-5" />
              {homepageContent.phone}
            </a>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-end justify-between gap-4 px-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#4A5D4E]/60">{t("about.galleryKicker")}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-[#4A5D4E]">{t("about.galleryTitle")}</h2>
            </div>
          </div>

          <div className="grid auto-rows-[190px] grid-cols-1 gap-4 md:grid-cols-2">
            {homepageContent.galleryImages.filter(Boolean).map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className={`overflow-hidden rounded-3xl bg-[#F4F5F0] ${index === 0 ? "md:row-span-2" : ""}`}
              >
                <img src={imageUrl} alt={`${t("about.galleryImageAlt")} ${index + 1}`} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
