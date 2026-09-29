"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

/** Page-wide inertial scroll. Off for reduced motion and touch (native scroll is better there). */
export function Smooth({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current!,
        content: content.current!,
        smooth: 1.1,
        effects: false,
      });

      // In-page anchors glide through the smoother instead of jumping.
      const onClick = (e: MouseEvent) => {
        const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
        const id = a?.getAttribute("href")?.slice(1);
        const target = id ? document.getElementById(id) : null;
        if (!target) return;
        e.preventDefault();
        smoother.scrollTo(target, true, "top top");
        history.replaceState(null, "", `#${id}`);
      };
      document.addEventListener("click", onClick);
      return () => {
        document.removeEventListener("click", onClick);
        smoother.kill();
      };
    });
  });

  return (
    <div ref={wrapper} id="smooth-wrapper">
      <div ref={content} id="smooth-content">
        {children}
      </div>
    </div>
  );
}
