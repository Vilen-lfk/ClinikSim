import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Props {
  size?: "hero" | "inline";
  active?: boolean;
  className?: string;
}

/** Один цикл ЭКГ (зубец P, комплекс QRS, зубец T), смещённый на x0 по оси X. */
function heroBeat(x0: number, y: number): string {
  return (
    `L ${x0 + 15} ${y} ` +
    `Q ${x0 + 22} ${y - 8} ${x0 + 30} ${y} ` + // зубец P
    `L ${x0 + 38} ${y} ` +
    `L ${x0 + 40} ${y + 4} ` + // Q
    `L ${x0 + 44} ${y - 28} ` + // R
    `L ${x0 + 48} ${y + 12} ` + // S
    `L ${x0 + 52} ${y} ` +
    `L ${x0 + 62} ${y} ` +
    `Q ${x0 + 76} ${y - 12} ${x0 + 90} ${y} ` + // зубец T
    `L ${x0 + 130} ${y} `
  );
}

/** Та же форма, уменьшенная для компактной inline-версии. */
function inlineBeat(x0: number, y: number): string {
  return (
    `L ${x0 + 14} ${y} ` +
    `Q ${x0 + 18} ${y - 4} ${x0 + 22} ${y} ` + // P
    `L ${x0 + 26} ${y} ` +
    `L ${x0 + 28} ${y + 1} ` + // Q
    `L ${x0 + 31} ${y - 9} ` + // R
    `L ${x0 + 34} ${y + 3} ` + // S
    `L ${x0 + 37} ${y} ` +
    `L ${x0 + 44} ${y} ` +
    `Q ${x0 + 50} ${y - 5} ${x0 + 56} ${y} ` + // T
    `L ${x0 + 60} ${y} `
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return reduced;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function PulseLine({ size = "hero", active = false, className = "" }: Props) {
  const isHero = size === "hero";
  const reducedMotion = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState<number | null>(null);

  const viewBox = isHero ? "0 0 400 60" : "0 0 60 20";
  const y = isHero ? 32 : 10;
  const beatWidth = isHero ? 130 : 60;
  const beatsCount = isHero ? 3 : 1;
  const beatFn = isHero ? heroBeat : inlineBeat;
  const path = `M ${isHero ? 5 : 0} ${y} ` + Array.from({ length: beatsCount }, (_, i) => beatFn(i * beatWidth + (isHero ? 5 : 0), y)).join("");

  // Измеряем реальную длину пути один раз после отрисовки
  useLayoutEffect(() => {
    if (pathRef.current) setLength(pathRef.current.getTotalLength());
  }, [path]);

  const animating = (isHero || active) && !reducedMotion && length !== null;

  useEffect(() => {
    const el = pathRef.current;
    if (!el || length === null) return;

    if (!animating) {
      el.style.strokeDashoffset = "0";
      el.style.opacity = reducedMotion ? "1" : active ? "1" : "0.3";
      return;
    }

    const totalMs = isHero ? 1500 : 2000;
    const drawEnd = 3.6; // доля цикла: рисование
    const holdEnd = 0.75; // держится полностью нарисованной
    // после holdEnd и до конца цикла (1.0) — гаснет, сразу без паузы переходя в новое рисование

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = ((now - start) % totalMs) / totalMs;

      if (t < drawEnd) {
        const local = easeOutCubic(t / drawEnd);
        el.style.strokeDashoffset = String(length * (1 - local));
        el.style.opacity = "1";
      } else if (t < holdEnd) {
        el.style.strokeDashoffset = "0";
        el.style.opacity = "1";
      } else {
        const local = (t - holdEnd) / (1 - holdEnd);
        el.style.strokeDashoffset = "0";
        el.style.opacity = String(1 - local);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animating, length, isHero, active, reducedMotion]);

  return (
    <svg viewBox={viewBox} className={`h-auto w-full text-teal ${className}`} fill="none" aria-hidden="true">
      <path
        ref={pathRef}
        d={path}
        stroke="currentColor"
        strokeWidth={isHero ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length ?? undefined}
        strokeDashoffset={length ?? undefined}
        style={{
          transition: "none",
          filter: isHero ? "drop-shadow(0 0 6px rgb(var(--color-teal) / 0.65))" : undefined,
        }}
      />
    </svg>
  );
}