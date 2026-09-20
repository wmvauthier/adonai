(() => {
  const links = [...document.querySelectorAll(".guide-chapter-links a")];
  const chapters = links.map((link) => document.querySelector(link.hash));
  let scheduled = false;
  const update = () => {
    let active = 0;
    chapters.forEach((chapter, index) => {
      if (chapter.getBoundingClientRect().top <= 180) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scheduled = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
})();
