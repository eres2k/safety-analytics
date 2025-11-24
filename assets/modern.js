const ready = () => new Promise((resolve) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
    } else {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
    }
});

const smoothScroll = (el) => {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (typeof el.focus === 'function') {
        setTimeout(() => el.focus({ preventScroll: true }), 350);
    }
};

const persistTheme = (theme) => {
    localStorage.setItem('sap-theme', theme);
};

const hydrateTheme = (root, toggleBtn) => {
    const stored = localStorage.getItem('sap-theme');
    const next = stored || 'light';
    root.dataset.theme = next === 'light' ? '' : 'dim';
    if (toggleBtn) toggleBtn.setAttribute('aria-pressed', next === 'dim');
};

const toggleTheme = (root, toggleBtn) => {
    const current = root.dataset.theme === 'dim' ? 'dim' : 'light';
    const next = current === 'dim' ? 'light' : 'dim';
    root.dataset.theme = next === 'dim' ? 'dim' : '';
    persistTheme(next);
    if (toggleBtn) toggleBtn.setAttribute('aria-pressed', next === 'dim');
};

const createCommand = (label, description, action, group = 'Navigation') => ({ label, description, action, group });

const buildCommandPalette = (sections, quickActions) => {
    const palette = document.querySelector('[data-command-palette]');
    const input = palette?.querySelector('[data-command-input]');
    const results = palette?.querySelector('[data-command-results]');
    const close = palette?.querySelector('[data-close-command]');

    if (!palette || !input || !results || !close) return () => {};

    const commands = [
        createCommand('Scroll to top', 'Return to the starting position', () => window.scrollTo({ top: 0, behavior: 'smooth' }), 'Global'),
        createCommand('Jump to first form', 'Focus the first available input', () => {
            const firstInput = document.querySelector('input, textarea, select');
            smoothScroll(firstInput);
        }, 'Global'),
        createCommand('Open reports zone', 'Navigate to reporting or export tools', () => {
            const match = sections.find((s) => /report|export|pdf|excel/i.test(s.label));
            smoothScroll(match?.el || document.querySelector('button[onclick*="export"], button[onclick*="pdf"]'));
        }, 'Global'),
    ];

    sections.forEach((section) => {
        commands.push(createCommand(section.label, 'Go to section', () => smoothScroll(section.el), 'Sections'));
    });

    quickActions.forEach((action) => {
        commands.push(createCommand(action.label, action.description || 'Quick action', action.onClick, 'Shortcuts'));
    });

    const render = (query = '') => {
        const normalized = query.trim().toLowerCase();
        const filtered = normalized
            ? commands.filter((cmd) => cmd.label.toLowerCase().includes(normalized) || cmd.description.toLowerCase().includes(normalized))
            : commands;

        results.innerHTML = filtered
            .map((cmd, index) => `
                <button data-cmd-index="${index}" aria-label="${cmd.label}">
                    <strong>${cmd.label}</strong>
                    <span class="meta">${cmd.group} · ${cmd.description}</span>
                </button>
            `)
            .join('');
    };

    const open = () => {
        palette.hidden = false;
        render('');
        input.value = '';
        requestAnimationFrame(() => input.focus());
    };

    const closePalette = () => {
        palette.hidden = true;
        input.blur();
    };

    results.addEventListener('click', (event) => {
        const target = event.target.closest('button[data-cmd-index]');
        if (!target) return;
        const index = Number(target.dataset.cmdIndex);
        const normalized = input.value.trim().toLowerCase();
        const filtered = normalized
            ? commands.filter((cmd) => cmd.label.toLowerCase().includes(normalized) || cmd.description.toLowerCase().includes(normalized))
            : commands;
        const cmd = filtered[index];
        closePalette();
        cmd?.action();
    });

    input.addEventListener('input', (event) => render(event.target.value));

    close.addEventListener('click', closePalette);

    document.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            palette.hidden ? open() : closePalette();
        } else if (event.key === 'Escape' && !palette.hidden) {
            closePalette();
        }
    });

    document.querySelectorAll('[data-open-command]').forEach((btn) => btn.addEventListener('click', open));

    return open;
};

const buildQuickActions = (sections) => {
    const container = document.querySelector('[data-quick-actions]');
    if (!container) return [];

    const findSection = (regex) => sections.find((s) => regex.test(s.label));

    const baseActions = [
        {
            label: 'Analytics Hub',
            description: 'Jump to dashboards and KPI visuals',
            onClick: () => smoothScroll(findSection(/analytics|dashboard|overview/i)?.el || sections[0]?.el),
        },
        {
            label: 'Data Intake',
            description: 'Open upload/import utilities',
            onClick: () => smoothScroll(findSection(/upload|import|csv|data/i)?.el),
        },
        {
            label: 'Reports',
            description: 'Scroll to reporting and export controls',
            onClick: () => smoothScroll(findSection(/report|export|pdf|excel/i)?.el),
        },
        {
            label: 'Actions',
            description: 'Navigate to task or action tracking tables',
            onClick: () => smoothScroll(findSection(/action|task|tracking/i)?.el),
        },
    ];

    const renderedActions = baseActions.filter((action) => action.onClick).map((action) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = action.label;
        btn.title = action.description;
        btn.addEventListener('click', action.onClick);
        container.appendChild(btn);
        return action;
    });

    return renderedActions;
};

const wireGuidance = () => {
    const hints = document.querySelector('[data-context-hints] .hint');
    if (!hints) return;

    const defaultHint = hints.textContent;
    document.addEventListener('focusin', (event) => {
        const target = event.target;
        if (target.matches('input, textarea, select, button')) {
            const label = target.getAttribute('aria-label') || target.name || target.id || target.textContent?.trim();
            hints.textContent = label
                ? `Working on “${label}”. Use Ctrl/Cmd + K for instant navigation.`
                : 'Use Ctrl/Cmd + K for instant navigation and shortcuts.';
        }
    });

    document.addEventListener('focusout', () => {
        hints.textContent = defaultHint;
    });
};

const buildGuidedTour = () => {
    const tourButtons = document.querySelectorAll('[data-open-quicktour]');
    if (!tourButtons.length) return;

    const focusables = Array.from(document.querySelectorAll('input, select, textarea, button, [tabindex]')).filter(
        (el) => el.offsetParent !== null
    );

    let index = 0;
    const focusNext = () => {
        if (!focusables.length) return;
        const el = focusables[index % focusables.length];
        smoothScroll(el);
        index += 1;
    };

    tourButtons.forEach((btn) => btn.addEventListener('click', focusNext));
};

const upgrade = async () => {
    await ready();
    const root = document.body;
    const sections = Array.from(document.querySelectorAll('h1, h2, h3'))
        .filter((el) => el.textContent.trim().length > 0)
        .map((el) => ({ label: el.textContent.trim(), el }));

    const themeToggle = document.querySelector('[data-toggle-theme]');
    hydrateTheme(root, themeToggle);
    themeToggle?.addEventListener('click', () => toggleTheme(root, themeToggle));

    const quickActions = buildQuickActions(sections);
    buildCommandPalette(sections, quickActions);
    wireGuidance();
    buildGuidedTour();
};

upgrade();
