(() => {
  const carousels = document.querySelectorAll(".hero-carousel");
  if (!carousels.length) return;

  const SLIDE_DURATION = 90000;

  carousels.forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".hero-slide")];
    const dots = [...carousel.querySelectorAll(".hero-dot")];
    if (!slides.length) return;

    let current = Math.max(
      0,
      slides.findIndex((slide) => slide.classList.contains("active")),
    );

    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === current);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === current);
      });
    };

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      timer = window.setInterval(() => {
        show(current + 1);
      }, SLIDE_DURATION);
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.slide || 0));
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);

    show(current);
    start();
  });
})();

document.querySelectorAll('.content-carousel').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const prev = carousel.querySelector('.carousel-arrow--prev');
    const next = carousel.querySelector('.carousel-arrow--next');

    const getStep = () => {
      const firstItem = track.children[0];
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || 0);
      return firstItem.getBoundingClientRect().width + gap;
    };

    prev.addEventListener('click', () => {
      track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
      track.scrollBy({ left: getStep(), behavior: 'smooth' });
    });
  });
