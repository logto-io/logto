(function () {
  var appearanceMode;

  try {
    appearanceMode = localStorage.getItem('logto:admin_console:appearance_mode');
  } catch (error) {
    appearanceMode = 'system';
  }

  var isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = appearanceMode === 'dark' || (appearanceMode !== 'light' && isSystemDark);

  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
})();
