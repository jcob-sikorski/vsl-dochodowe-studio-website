import { ScrollToFormCta } from "@/components/scroll-to-form-cta";

/** Closes the page after the case studies: the fork, one last time. */
export function FinalDecisionSection() {
  return (
    <section className="w-full bg-neutral-900 px-4 py-14 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-[26rem] flex-col items-center text-center sm:max-w-xl">
        <h2 className="max-w-[24ch] text-[1.35rem] font-extrabold leading-tight tracking-tight text-white sm:text-[1.7rem]">
          Każdy z nich mógł poczekać kolejny rok.{" "}
          <span className="text-[#fb923c]">Nie poczekali.</span>
        </h2>
        <p className="mt-4 max-w-md text-[0.92rem] leading-[1.55] text-neutral-300 sm:text-[1rem]">
          Za 5 lat Ty też będziesz w jednym z dwóch miejsc. Na tej samej sali, wymyślając koło na nowo. Albo w studiu, które działa bez Ciebie. Wybierasz to teraz.
        </p>
        <ScrollToFormCta location="final_decision" className="mt-8" />
        <p className="mt-3 text-[0.72rem] text-neutral-400">Zgłoszenie zajmuje ok. 10 sekund. Nie przyjmujemy każdego.</p>
      </div>
    </section>
  );
}
