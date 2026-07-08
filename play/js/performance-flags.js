(function () {
  function shouldUsePerformanceSaver(viewport = {}) {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    const saveData = Boolean(navigator.connection?.saveData);
    const compactTouch = Boolean(viewport.coarsePointer && (viewport.compact || viewport.short));
    return Boolean(prefersReducedMotion || saveData || compactTouch);
  }

  function observeLongTasks(onEntries) {
    if (typeof PerformanceObserver === "undefined") return null;
    try {
      const observer = new PerformanceObserver((list) => {
        onEntries?.(list.getEntries());
      });
      observer.observe({ entryTypes: ["longtask"] });
      return observer;
    } catch (error) {
      return null;
    }
  }

  window.AdonaiPerformance = {
    shouldUsePerformanceSaver,
    observeLongTasks
  };
})();
