(() => {
  const langButtons = document.querySelectorAll('.lang-btn');
  const translatable = () => document.querySelectorAll('[data-pt][data-en]');

  const setLanguage = (lang) => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';

    translatable().forEach((el) => {
      const value = el.dataset[lang];
      if (value) el.textContent = value;
    });

    langButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
  };

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang || 'pt'));
  });

  document.querySelectorAll('.turn-step').forEach((step) => {
    step.addEventListener('mouseenter', () => {
      document.querySelectorAll('.turn-step').forEach((item) => item.classList.remove('is-active'));
      step.classList.add('is-active');
    });
  });

  setLanguage('pt');
})();
