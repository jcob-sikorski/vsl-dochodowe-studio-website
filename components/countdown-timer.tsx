"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  target: string;
}

export function CountdownTimer({ target }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const targetTimestamp = Date.parse(target);

    if (isNaN(targetTimestamp)) {
      console.error("Nieprawidłowa data przekazana do CountdownTimer:", target);
      return;
    }

    const calculateTime = () => {
      const now = Date.now();
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
        return;
      }

      setTimeLeft({
        days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0"),
        seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const units = [
    { label: "DNI", value: timeLeft.days },
    { label: "GODZ", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEK", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 select-none">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          {/* Card: Subtle warm cream gradient with soft amber border */}
          <div className="flex h-[3.6rem] w-[3.9rem] min-[390px]:h-[4.2rem] min-[390px]:w-[4.55rem] sm:h-[4.5rem] sm:w-[4.85rem] flex-col items-center justify-center rounded-2xl border border-[#fed7aa]/85 bg-gradient-to-b from-[#fffbf5] to-[#fff7ed] px-1 shadow-[0_2px_8px_rgba(234,88,12,0.06)]">
            <span className="text-[1.65rem] min-[390px]:text-[2.05rem] sm:text-[2.2rem] font-extrabold leading-none text-[#7c2d12] tracking-[-0.02em] tabular-nums">
              {unit.value}
            </span>
            <span className="mt-0.5 min-[390px]:mt-1 text-[0.55rem] min-[390px]:text-[0.68rem] sm:text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#9a3412]/80">
              {unit.label}
            </span>
          </div>

          {/* Separator Dots: High-tension warm orange */}
          {index < units.length - 1 && (
            <div className="flex flex-col items-center justify-center gap-1.5 px-1 min-[390px]:px-1.5">
              <span className="h-[3.5px] w-[3.5px] rounded-full bg-[#ea580c]" />
              <span className="h-[3.5px] w-[3.5px] rounded-full bg-[#ea580c]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}