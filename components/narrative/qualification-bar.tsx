/**
 * Thin strip above the hero. Frames the page as an application to a program,
 * not a purchase. Sits above the A/B headline and is identical for every
 * variant, so it doesn't bias the headline test.
 */
export function QualificationBar() {
  return (
    <div className="w-full bg-neutral-900 px-4 py-2 text-center">
      <p className="text-[0.66rem] font-bold uppercase leading-snug tracking-[0.06em] text-white sm:text-[0.76rem]">
        <span className="block sm:inline">Program wdrożeniowy dla właścicieli studiów</span>
        <span className="mx-1.5 hidden text-[#ea580c] sm:inline">·</span>
        <span className="block text-neutral-300 sm:inline">Przyjmujemy po rozmowie kwalifikacyjnej</span>
      </p>
    </div>
  );
}
