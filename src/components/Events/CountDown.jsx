import React, { useEffect, useMemo, useRef, useState } from "react";

const CountDown = ({
  data,
  onExpire,
  hideOnExpire = false,
  textColor = "#FFE180",
  unitColor = "white",
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const expiredRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const isExpired = isEventExpired(data);
    if (isExpired && !expiredRef.current) {
      expiredRef.current = true;
      if (typeof onExpire === "function") onExpire(data);
    }

    return () => clearTimeout(timer);
  });

  function isEventExpired(event) {
    return new Date(event.Finish_Date) <= new Date();
  }

  function calculateTimeLeft() {
    const difference = +new Date(data.Finish_Date) - +new Date();
    if (difference <= 0) return {};
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hr: Math.floor((difference / (1000 * 60 * 60)) % 24),
      min: Math.floor((difference / 1000 / 60) % 60),
      sec: Math.floor((difference / 1000) % 60),
    };
  }

  const isExpired = useMemo(() => Object.keys(timeLeft).length === 0, [timeLeft]);
  if (isExpired && hideOnExpire) return null;

  return (
    <div
      className="
        flex flex-wrap justify-center items-center
        gap-2 sm:gap-3 md:gap-4 lg:gap-5
        mt-2 sm:mt-3 md:mt-4
        px-2 sm:px-3 md:px-4 py-1 sm:py-2
      "
    >
      {!isExpired ? (
        Object.entries(timeLeft).map(([unit, value]) => (
          <span
            key={unit}
            className="
              text-[22px] sm:text-[30px] md:text-[38px] lg:text-[45px]
            
            "
            style={{ fontFamily: "Quesha" }}
          >
            <span style={{ color: textColor }}>{value}</span>{" "}
            <span style={{ color: unitColor }}>{unit}</span>
          </span>
        ))
      ) : (
        <span
          className="
            text-red-500
            text-[20px] sm:text-[28px] md:text-[32px] lg:text-[35px]
            text-center
          "
          style={{ fontFamily: "Quesha" }}
        >
          Time’s Up
        </span>
      )}
    </div>
  );
};

export default CountDown;
