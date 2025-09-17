import React, { useEffect, useState } from "react";

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: "--",
    hours: "--",
    minutes: "--",
    seconds: "--",
  });

  useEffect(() => {
    const targetDate = new Date("2025-10-10T00:00:00").getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: days.toString().padStart(2, "0"),
          hours: hours.toString().padStart(2, "0"),
          minutes: minutes.toString().padStart(2, "0"),
          seconds: seconds.toString().padStart(2, "0"),
        });
      } else {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-[Inter] relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/5 right-[10%] w-[200px] h-[200px] bg-cyan-400/5 rounded rotate-[15deg]" />
        <div className="absolute bottom-1/5 left-[10%] w-[150px] h-[150px] bg-cyan-400/10 rounded -rotate-[10deg]" />
      </div>

      <div className="text-center max-w-xl p-6">
        <div className="text-4xl font-semibold text-cyan-400 mb-2 tracking-tight">
          Meem Home
        </div>
        <div className="text-sm text-gray-500 mb-12 font-medium uppercase tracking-widest">
          Premium Products & Services
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          Something Amazing <br /> is Coming Soon
        </h1>
        <p className="text-lg text-gray-500 mb-16 leading-relaxed max-w-lg mx-auto">
          We're working hard to bring you an incredible experience. Stay tuned
          for the big reveal!
        </p>

        <div className="bg-white p-8 md:p-10 rounded-lg shadow border border-gray-200 mb-12">
          <div className="text-lg font-semibold text-gray-700 mb-6">
            Launching On
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-cyan-400 text-white p-4 rounded text-center">
              <div className="text-3xl font-bold mb-1">{timeLeft.days}</div>
              <div className="text-xs font-medium uppercase tracking-wider">
                Days
              </div>
            </div>
            <div className="bg-cyan-400 text-white p-4 rounded text-center">
              <div className="text-3xl font-bold mb-1">{timeLeft.hours}</div>
              <div className="text-xs font-medium uppercase tracking-wider">
                Hours
              </div>
            </div>
            <div className="bg-cyan-400 text-white p-4 rounded text-center">
              <div className="text-3xl font-bold mb-1">{timeLeft.minutes}</div>
              <div className="text-xs font-medium uppercase tracking-wider">
                Minutes
              </div>
            </div>
            <div className="bg-cyan-400 text-white p-4 rounded text-center">
              <div className="text-3xl font-bold mb-1">{timeLeft.seconds}</div>
              <div className="text-xs font-medium uppercase tracking-wider">
                Seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
