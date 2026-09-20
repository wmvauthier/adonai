// Identity explorer: buttons, touch and keyboard all select the same panels.
(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const tablist = document.querySelector('[role="tablist"]');
  const mobile = window.matchMedia("(max-width: 600px)");
  const orientation = () =>
    tablist.setAttribute(
      "aria-orientation",
      mobile.matches ? "horizontal" : "vertical",
    );
  orientation();
  mobile.addEventListener("change", orientation);
  const select = (tab) => {
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const forward = mobile.matches ? "ArrowRight" : "ArrowDown";
      const backward = mobile.matches ? "ArrowLeft" : "ArrowUp";
      let next;
      if (event.key === forward) next = (index + 1) % tabs.length;
      if (event.key === backward)
        next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next]);
      tabs[next].focus();
    });
  });
})();
