(function () {
  function setStableHtml(element, html, options = {}) {
    if (!element) return false;
    const nextHtml = String(html ?? "");
    const cache = options.cache;
    const previous = cache?.get?.(element);
    if (previous === nextHtml) {
      options.onSkip?.();
      return false;
    }
    element.innerHTML = nextHtml;
    cache?.set?.(element, nextHtml);
    options.onWrite?.();
    return true;
  }

  function clearStableHtml(element, cache) {
    if (!element) return;
    if (element.innerHTML) element.innerHTML = "";
    cache?.delete?.(element);
  }

  window.AdonaiDom = {
    setStableHtml,
    clearStableHtml
  };
})();
