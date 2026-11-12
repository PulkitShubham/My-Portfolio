import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

/** Counts from 0 to `to` the first time it enters the viewport. */
export default function Counter({ to, duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toString();
      },
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return <span ref={ref}>0</span>;
}
