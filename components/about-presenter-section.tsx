"use client";

import React from "react";
import Image from "next/image";
import Clarity from "@microsoft/clarity";
import { Button } from "@/components/ui/button";

export function AboutPresenterSection() {
  return (
    <section className="w-full bg-white pt-4 pb-3 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[22.5rem] sm:max-w-[25.5rem] flex-col items-center">

        <div className="w-full overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white p-3.5 sm:p-4 shadow-xs">

          {/* Zdjęcie */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] bg-stone-900 shadow-xs">
            <Image
              src="https://assets.cdn.filesafe.space/XC630scPx5PEZe31LmuL/media/6aa4684bcbbb25381191a0da.png"
              alt="Jakub Siekiera"
              fill
              className="object-cover"
            />

            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[0.62rem] sm:text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white">
                NA ŻYWO 17 WRZEŚNIA
              </span>
            </div>
          </div>

          {/* Prowadzący */}
          <div className="mt-5 flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3 py-0.5">
              <span className="text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#ea580c]">
                PROWADZĄCY SZKOLENIE
              </span>
            </div>

            <h3 className="mt-2 text-[1.65rem] sm:text-[1.85rem] font-extrabold tracking-tight text-neutral-900">
              Jakub Siekiera
            </h3>

            <p className="mt-1 text-[0.82rem] sm:text-[0.875rem] font-normal leading-snug text-neutral-500">
              Reprezentant{" "}
              <span className="font-bold text-neutral-900">
                Dochodowego Studio
              </span>
              {" "}— poprowadzi Cię przez model wypracowany przez
              Bartłomieja Sikorskiego i jego zespół.
            </p>
          </div>

          <div className="my-5 h-[1px] w-full bg-neutral-100" />

          {/* Treść */}
          <div className="space-y-3.5 text-[0.84rem] sm:text-[0.89rem] font-normal leading-[1.46] text-neutral-700">

            <p>
              Za{" "}
              <span className="font-bold text-neutral-900">
                Dochodowym Studio
              </span>{" "}
              stoi jego właściciel —{" "}
              <span className="font-bold text-neutral-900">
                Bartłomiej Sikorski
              </span>
              .
            </p>

            <p>
              Jego zespół pomógł już{" "}
              <span className="font-bold text-neutral-900">
                ponad 50 placówkom
              </span>{" "}
              otworzyć, uporządkować i rozwijać studia treningowe — tak,
              żeby właściciel nie musiał zarabiać wyłącznie własnymi
              godzinami na sali.
            </p>

            <p>
              To nie jest kolejny kurs o tym, jak prowadzić lepsze treningi.
              To{" "}
              <span className="font-bold text-neutral-900">
                system budowania dochodowego studia
              </span>
              : oferta, sprzedaż, retencja, semi-personal, zespół,
              metodyka i proces przekazywania klientów trenerom.
            </p>

            <div className="border-l-[3.5px] border-[#ea580c] py-0.5 pl-3">
              <p className="text-[0.98rem] sm:text-[1.04rem] font-bold text-neutral-900 tracking-tight">
                Cel?
                {" "}
                <span className="italic font-normal">
                  Studio, które zarabia dzięki systemowi i zespołowi,
                  a nie dzięki temu, że właściciel pracuje od rana do nocy.
                </span>
              </p>
            </div>

          </div>

          <div className="my-5 h-[1px] w-full bg-neutral-100" />

          {/* Liczby */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 pb-1 text-center">

            <div className="flex flex-col items-center">
              <span className="text-[1.45rem] sm:text-[1.65rem] font-extrabold leading-tight text-neutral-900 tracking-tight">
                50<span className="text-[#ea580c]">+</span>
              </span>
              <span className="mt-0.5 text-[0.74rem] sm:text-[0.78rem] font-medium text-neutral-500">
                placówek w modelu
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[1.45rem] sm:text-[1.65rem] font-extrabold leading-tight text-neutral-900 tracking-tight">
                min. 20k<span className="text-[#ea580c]">+</span>
              </span>
              <span className="mt-0.5 text-[0.74rem] sm:text-[0.78rem] font-medium text-neutral-500">
                zł miesięcznego zysku
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[1.45rem] sm:text-[1.65rem] font-extrabold leading-tight text-neutral-900 tracking-tight">
                4
              </span>
              <span className="mt-0.5 text-[0.74rem] sm:text-[0.78rem] font-medium text-neutral-500">
                studia Sportowe Przedmieście
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[1.45rem] sm:text-[1.65rem] font-extrabold leading-tight text-neutral-900 tracking-tight">
                5 lat
              </span>
              <span className="mt-0.5 text-[0.74rem] sm:text-[0.78rem] font-medium text-neutral-500">
                na rynku
              </span>
            </div>

          </div>

        </div>

        {/* CTA */}
        <div className="mt-6 sm:mt-7 flex w-full justify-center">
          <Button
            type="button"
            onClick={() => {
              Clarity.event("cta_button_clicked");
              Clarity.setTag("cta_location", "about_presenter");

              const el = document.getElementById("zapis");

              if (el) {
                el.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              } else {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            }}
            className="flex !h-auto w-full max-w-[22rem] sm:max-w-[28rem] flex-col items-center justify-center gap-1 rounded-xl !border-none !bg-[#ea580c] !px-6 !py-3.5 shadow-sm transition-colors hover:!bg-[#c2410c] active:scale-[0.99]"
          >
            <span className="text-base font-bold uppercase tracking-normal text-white sm:text-[1.1rem] leading-snug">
              REZERWUJĘ MOJE MIEJSCE
            </span>

            <span className="text-xs font-medium text-orange-100 leading-none">
              100% darmowy dostęp na żywo
            </span>
          </Button>
        </div>

      </div>
    </section>
  );
}