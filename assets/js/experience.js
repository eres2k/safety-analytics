(() => {
  const STORAGE_KEY = 'sap-theme-preference';
  const paletteShortcut = (event) => (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

  function getThemePreference() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(next) {
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
  }

  function buildShell() {
    const shell = document.createElement('div');
    shell.className = 'modern-shell';
    shell.innerHTML = `
      <div class="modern-shell__inner">
        <div class="modern-brand">
          <span class="pulse"></span>
          <div>
            <div class="modern-chip">Safety Analytics</div>
            <strong>Console-grade experience</strong>
          </div>
        </div>
        <div class="modern-tools">
          <div class="modern-search" aria-label="Quick navigate">
            <i class="fa fa-search" aria-hidden="true"></i>
            <input type="search" placeholder="Search sections, actions, metrics" data-shell-search />
            <span class="modern-chip">CTRL / CMD + K</span>
          </div>
          <button class="modern-btn" type="button" data-action="theme">
            <i class="fa fa-moon"></i> <span>Theme</span>
          </button>
          <button class="modern-btn primary" type="button" data-action="open-palette">
            <i class="fa fa-magic"></i> <span>Command</span>
          </button>
        </div>
      </div>
    `;
    return shell;
  }

  function collectNavigationTargets() {
    const selectors = ['h1', 'h2', 'h3', '[data-nav-label]'];
    return Array.from(document.querySelectorAll(selectors.join(',')))
      .filter((el) => el.textContent.trim().length > 2)
      .map((el) => {
        if (!el.id) {
          el.id = `section-${el.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(16).slice(2, 6)}`;
        }
        return {
          label: el.dataset.navLabel || el.textContent.trim(),
          element: el,
          type: el.tagName.toLowerCase(),
        };
      });
  }

  function createPalette(targets) {
    const palette = document.createElement('div');
    palette.className = 'command-palette';
    palette.innerHTML = `
      <div class="command-panel" role="dialog" aria-modal="true" aria-label="Command palette">
        <header>
          <i class="fa fa-magic" aria-hidden="true"></i>
          <input type="search" placeholder="Navigate, search content, trigger actions" />
        </header>
        <div class="command-results" role="listbox"></div>
      </div>
    `;

    const input = palette.querySelector('input');
    const results = palette.querySelector('.command-results');

    function render(filter = '') {
      const fragment = document.createDocumentFragment();
      const term = filter.toLowerCase();
      const visible = targets.filter(({ label }) => label.toLowerCase().includes(term));
      visible.slice(0, 40).forEach(({ label, element, type }, index) => {
        const item = document.createElement('div');
        item.className = 'command-item';
        item.setAttribute('role', 'option');
        item.dataset.index = index;
        item.innerHTML = `<span>${label}</span><small>${type}</small>`;
        item.addEventListener('click', () => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          palette.classList.remove('active');
        });
        fragment.appendChild(item);
      });
      results.replaceChildren(fragment);
    }

    input.addEventListener('input', (event) => render(event.target.value));
    render();
    return { palette, input, render };
  }

  function enhanceTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach((table) => {
      if (table.dataset.intelEnhanced) return;
      table.dataset.intelEnhanced = 'true';
      const wrapper = document.createElement('div');
      wrapper.className = 'table-intel';
      const counter = document.createElement('div');
      counter.className = 'pill';
      counter.textContent = `${table.querySelectorAll('tbody tr').length} entries`;
      const filter = document.createElement('input');
      filter.type = 'search';
      filter.placeholder = 'Filter rows instantly';
      filter.addEventListener('input', () => {
        const term = filter.value.toLowerCase();
        table.querySelectorAll('tbody tr').forEach((row) => {
          const match = row.textContent.toLowerCase().includes(term);
          row.style.display = match ? '' : 'none';
        });
      });
      wrapper.append(counter, filter);
      table.parentElement.insertBefore(wrapper, table);
    });
  }

  function enhanceForms() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="search"], input[type="email"], input[type="number"], textarea');
    inputs.forEach((input) => {
      if (input.dataset.smartened) return;
      input.dataset.smartened = 'true';
      input.addEventListener('focus', () => input.classList.add('surface-card'));
      input.addEventListener('blur', () => input.classList.remove('surface-card'));
      const hint = document.createElement('div');
      hint.className = 'smart-indicator';
      hint.innerHTML = `<span></span><small>Adaptive suggestions ready</small>`;
      hint.style.display = 'none';
      input.insertAdjacentElement('afterend', hint);
      input.addEventListener('input', () => {
        if (input.value.length > 2) {
          hint.style.display = 'inline-flex';
          hint.querySelector('small').textContent = `Looking for "${input.value}" across this page.`;
        } else {
          hint.style.display = 'none';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const preserveTheme = body.hasAttribute('data-preserve-theme');
    const disableEnhancements = body.hasAttribute('data-disable-enhancements');

    if (!preserveTheme) {
      body.classList.add('modernized');
    }

    setTheme(getThemePreference());

    if (disableEnhancements) {
      return;
    }

    const shell = buildShell();
    body.prepend(shell);

    const navTargets = collectNavigationTargets();
    const { palette, input, render } = createPalette(navTargets);
    document.body.appendChild(palette);

    shell.querySelector('[data-action="open-palette"]').addEventListener('click', () => {
      palette.classList.add('active');
      input.focus();
    });

    document.addEventListener('keydown', (event) => {
      if (paletteShortcut(event)) {
        event.preventDefault();
        palette.classList.add('active');
        input.focus();
      }
      if (event.key === 'Escape') {
        palette.classList.remove('active');
      }
    });

    palette.addEventListener('click', (event) => {
      if (event.target === palette) {
        palette.classList.remove('active');
      }
    });

    shell.querySelector('[data-action="theme"]').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      setTheme(next);
    });

    const shellSearch = shell.querySelector('[data-shell-search]');
    if (shellSearch) {
      shellSearch.addEventListener('focus', () => {
        shellSearch.parentElement.classList.add('active');
      });
      shellSearch.addEventListener('blur', () => shellSearch.parentElement.classList.remove('active'));
      shellSearch.addEventListener('input', (event) => render(event.target.value));
      shellSearch.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          palette.classList.add('active');
          input.value = event.target.value;
          input.dispatchEvent(new Event('input'));
          input.focus();
        }
      });
    }

    const announcer = document.createElement('div');
    announcer.className = 'surface-card smart-grid';
    announcer.style.margin = '18px';
    announcer.innerHTML = `
      <div>
        <div class="smart-indicator"><span></span><strong>Context-ready navigation</strong></div>
        <p style="margin-top:8px;color:var(--text-soft);">Use the command launcher to jump to any workflow, form, or visualization instantly.</p>
      </div>
      <div>
        <div class="smart-indicator"><span></span><strong>Adaptive inputs</strong></div>
        <p style="margin-top:8px;color:var(--text-soft);">Fields highlight when active and surface live hints as you type.</p>
      </div>
    `;
    document.body.insertBefore(announcer, document.body.firstChild.nextSibling);

    enhanceTables();
    enhanceForms();
  });
})();
