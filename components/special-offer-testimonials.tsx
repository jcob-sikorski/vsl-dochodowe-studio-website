import React from "react";

export function SpecialOfferTestimonials() {
  return (
    <section className="relative w-full bg-[#fffcf9] border-y border-neutral-200/80 py-10 px-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-[23rem] sm:max-w-[27rem] flex-col items-center">
        
        {/* Industry Badge */}
        <div className="inline-flex items-center justify-center rounded-full border border-[#fed7aa] bg-[#fff7ed] px-3.5 py-0.5 shadow-2xs">
          <span className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#ea580c]">
            INDUSTRY ENDORSEMENTS
          </span>
        </div>

        {/* Testimonial 1: Joel Weldon */}
        <div className="mt-5 w-full overflow-hidden rounded-[1.5rem] border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#ea580c] bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face"
                alt="Joel Weldon"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[0.96rem] font-black text-neutral-900">
                Joel Weldon
              </h3>
              <span className="text-[0.72rem] font-bold text-[#ea580c]">
                NSA Hall Of Fame Speaker
              </span>
            </div>
          </div>

          <div className="mt-3.5 rounded-xl border-l-4 border-[#ea580c] bg-[#fff7ed] p-3">
            <p className="text-[0.84rem] font-bold italic text-[#7c2d12] leading-snug">
              &quot;Jason generated more sales and more money than all the webinars I&apos;ve done...&quot;
            </p>
          </div>

          <div className="mt-3 space-y-2 text-[0.78rem] text-neutral-700 leading-[1.42]">
            <p>
              &quot;Don&apos;t even think about doing a webinar or learning about how to do webinars from Jason Fladlien - - - unless you are committed to working with <strong className="text-neutral-900">THE BEST IN THE WORLD</strong>.&quot;
            </p>
            <p>
              &quot;Jason isn&apos;t good or even great at webinars he is world class, extraordinary and truly amazing. In one hour, for my very first webinar, Jason generated more sales and more money than all the webinars I&apos;ve done since then.&quot;
            </p>
            <p className="font-semibold text-neutral-900">
              &quot;If I could only do one more webinar in my entire life the only person I&apos;d want to do it with is Jason Fladlien.&quot;
            </p>
          </div>
        </div>

        {/* Testimonial 2: John Carter */}
        <div className="mt-4 w-full overflow-hidden rounded-[1.5rem] border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#ea580c] bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face"
                alt="John Carter"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[0.96rem] font-black text-neutral-900">
                John Carter
              </h3>
              <span className="text-[0.72rem] font-bold text-[#ea580c]">
                President, Simpler Trading
              </span>
            </div>
          </div>

          <div className="mt-3.5 rounded-xl border-l-4 border-[#ea580c] bg-[#fff7ed] p-3">
            <p className="text-[0.84rem] font-bold italic text-[#7c2d12] leading-snug">
              &quot;When I got back from Italy we had 1.5 million in sales&quot;
            </p>
          </div>

          <div className="mt-3 space-y-2 text-[0.78rem] text-neutral-700 leading-[1.42]">
            <p>
              &quot;Last year I was traveling with my family in Italy, and I had to pass on a last minute JV opportunity.&quot;
            </p>
            <p>
              &quot;Jason hit me up on Skype and asked if he could do the webinar for me since I would have to pass. I agreed, and when I landed back home, we had done $1.5M in sales while I was completely offline.&quot;
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}