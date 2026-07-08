(function () {
  const FEEDBACK_OVERLAY_SELECTOR = [
    ".zone-modal.is-visible",
    ".block-prompt.is-visible",
    ".game-result:not(.is-hidden)",
    ".played-card-animation.is-visible",
    ".draw-animation.is-visible",
    ".reveal-animation.is-visible",
    ".pulverize-animation.is-visible",
    ".phase-alert.is-visible"
  ].join(", ");

  const BLOCK_OUTSIDE_CLICK_SELECTOR = [
    ".zone-modal",
    ".block-prompt",
    ".game-result",
    "#fieldViewModal",
    "#decisionReturnButton",
    ".phase-alert",
    ".played-card-animation",
    ".pulverize-animation",
    ".draw-animation",
    ".reveal-animation"
  ].join(", ");

  function hasFeedbackOverlay() {
    return Boolean(document.querySelector(FEEDBACK_OVERLAY_SELECTOR));
  }

  function isInsideBlockingOverlay(target) {
    return Boolean(target?.closest?.(BLOCK_OUTSIDE_CLICK_SELECTOR));
  }

  window.AdonaiOverlay = {
    FEEDBACK_OVERLAY_SELECTOR,
    BLOCK_OUTSIDE_CLICK_SELECTOR,
    hasFeedbackOverlay,
    isInsideBlockingOverlay
  };
})();
