type Cleanup = () => void;

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function attachMagnet(el: HTMLElement, strength = 0.25, max = 14) {
  let rafId: number | null = null;
  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;

  const onMouseMove = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    targetX = Math.max(-max, Math.min(max, dx));
    targetY = Math.max(-max, Math.min(max, dy));
    if (rafId == null) raf();
  };

  const onMouseLeave = () => {
    targetX = 0;
    targetY = 0;
    if (rafId == null) raf();
  };

  const raf = () => {
    curX = lerp(curX, targetX, 0.18);
    curY = lerp(curY, targetY, 0.18);
    el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`;
    if (Math.abs(curX - targetX) > 0.5 || Math.abs(curY - targetY) > 0.5) {
      rafId = requestAnimationFrame(raf);
    } else {
      el.style.transform = `translate3d(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0)`;
      rafId = null;
    }
  };

  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);
  el.style.willChange = "transform";

  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
    if (rafId != null) cancelAnimationFrame(rafId);
    el.style.willChange = "auto";
    el.style.transform = "";
  };
}

export function initMagnetHover(): Cleanup {
  const selectors = [
    "button",
    '[role="button"]',
    ".btn-primary",
    ".btn",
    '[data-magnetic="true"]',
    ".shadcn-button",
  ];
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>(selectors.join(",")),
  );
  const cleanups = nodes.map((el) => attachMagnet(el));

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        const found = n.matches(selectors.join(","))
          ? [n]
          : Array.from(n.querySelectorAll<HTMLElement>(selectors.join(",")));
        found.forEach((el) => cleanups.push(attachMagnet(el)));
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    cleanups.forEach((c) => c());
  };
}
