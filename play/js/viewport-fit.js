(function () {
  const root = document.documentElement;
  let frame = 0;
  let lastSignature = "";
  let viewport = {
    width: window.innerWidth || root.clientWidth || 0,
    height: window.innerHeight || root.clientHeight || 0,
    scale: 1,
    offsetTop: 0,
    offsetLeft: 0
  };

  function readViewport() {
    const visual = window.visualViewport;
    const width = Math.round(visual?.width || window.innerWidth || root.clientWidth || 0);
    const height = Math.round(visual?.height || window.innerHeight || root.clientHeight || 0);
    const scale = Number(visual?.scale || 1);
    const offsetTop = Math.round(visual?.offsetTop || 0);
    const offsetLeft = Math.round(visual?.offsetLeft || 0);
    return { width, height, scale, offsetTop, offsetLeft };
  }

  function isLikelyIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function sync() {
    viewport = readViewport();
    const signature = `${viewport.width}:${viewport.height}:${viewport.scale}:${viewport.offsetTop}:${viewport.offsetLeft}`;
    if (signature === lastSignature) return viewport;
    lastSignature = signature;
    root.style.setProperty("--app-vw", `${viewport.width}px`);
    root.style.setProperty("--app-vh", `${viewport.height}px`);
    root.style.setProperty("--app-vh-unit", `${viewport.height * 0.01}px`);
    root.style.setProperty("--visual-offset-top", `${viewport.offsetTop}px`);
    root.style.setProperty("--visual-offset-left", `${viewport.offsetLeft}px`);
    root.classList.toggle("is-ios-viewport", isLikelyIOS());
    root.dataset.appViewport = `${viewport.width}x${viewport.height}`;
    return viewport;
  }

  function schedule() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      sync();
    });
  }

  function init() {
    sync();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });
    window.visualViewport?.addEventListener("resize", schedule, { passive: true });
    window.visualViewport?.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) schedule();
    }, { passive: true });
  }

  window.AdonaiViewportFit = {
    init,
    sync,
    schedule,
    getViewport: () => viewport,
    isLikelyIOS
  };

  init();
})();
