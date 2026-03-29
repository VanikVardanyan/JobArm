export const ui = {
  pageShell: "app-shell min-h-screen px-5 py-6 sm:px-6",
  containerWide: "mx-auto flex w-full max-w-6xl flex-col gap-6",
  containerHero: "mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col gap-6",
  containerMedium: "mx-auto flex w-full max-w-4xl flex-col gap-6",
  panel: "glass-panel rounded-[2rem] border border-[color:var(--border)] px-6 py-8",
  panelDense: "glass-panel rounded-[1.75rem] border border-[color:var(--border)] p-5",
  panelSoft:
    "rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-4",
  cardItem:
    "rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-3",
  eyebrow:
    "text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-strong)]",
  productMark:
    "text-xs uppercase tracking-[0.22em] text-[color:var(--accent-strong)]",
  badgeAccent:
    "inline-flex rounded-full bg-[color:var(--accent-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-strong)]",
  badgeAccentSoft:
    "rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-strong)]",
  badgeSuccess:
    "rounded-full bg-[color:rgba(43,138,87,0.14)] px-3 py-1 text-xs font-semibold text-[color:var(--success)]",
  buttonPrimary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold leading-tight text-white transition hover:bg-[color:var(--accent-strong)]",
  buttonSecondary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-5 py-3 text-sm font-semibold leading-tight text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted-hover)]",
  buttonDashboardPrimary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-[color:color-mix(in srgb, var(--accent) 22%, white)] bg-[color:color-mix(in srgb, var(--accent) 90%, #fff4ea)] px-5 py-3 text-sm font-semibold leading-tight text-white shadow-[0_12px_26px_rgba(242,107,29,0.22)] transition hover:bg-[color:var(--accent-strong)] hover:shadow-[0_16px_30px_rgba(207,79,7,0.2)]",
  buttonDashboardEdit:
    "inline-flex items-center justify-center gap-2 rounded-full border border-[color:rgba(47,93,80,0.14)] bg-[color:rgba(72,133,114,0.1)] px-5 py-3 text-sm font-semibold leading-tight text-[color:#245847] transition hover:bg-[color:rgba(72,133,114,0.16)] dark:border-[color:rgba(120,210,178,0.14)] dark:bg-[color:rgba(94,207,143,0.14)] dark:text-[color:#98e4bc] dark:hover:bg-[color:rgba(94,207,143,0.2)]",
  buttonDashboardToggle:
    "inline-flex items-center justify-center gap-2 rounded-full border border-[color:rgba(154,104,29,0.16)] bg-[color:rgba(201,112,0,0.1)] px-5 py-3 text-sm font-semibold leading-tight text-[color:#8b5604] transition hover:bg-[color:rgba(201,112,0,0.16)] disabled:opacity-50 dark:border-[color:rgba(229,168,74,0.16)] dark:bg-[color:rgba(229,168,74,0.12)] dark:text-[color:#f0c37a] dark:hover:bg-[color:rgba(229,168,74,0.2)]",
  buttonDashboardDanger:
    "inline-flex items-center justify-center gap-2 rounded-full border border-[color:rgba(177,69,69,0.14)] bg-[color:rgba(191,75,75,0.1)] px-5 py-3 text-sm font-semibold leading-tight text-[color:#a33a3a] transition hover:bg-[color:rgba(191,75,75,0.16)] disabled:opacity-50 dark:border-[color:rgba(255,140,140,0.14)] dark:bg-[color:rgba(255,122,122,0.12)] dark:text-[color:#ff9c9c] dark:hover:bg-[color:rgba(255,122,122,0.2)]",
  buttonDark:
    "w-full rounded-[1.25rem] bg-[color:var(--foreground)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground-on-dark)] dark:bg-[color:var(--accent)] dark:text-white",
  field:
    "w-full rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-3 outline-none transition focus:border-[color:var(--accent)]",
  fieldInvalid:
    "w-full rounded-[1.25rem] border border-red-400 bg-[color:var(--panel-muted)] px-4 py-3 outline-none transition focus:border-red-500",
  backLink:
    "inline-flex w-fit items-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted-hover)]",
  langWrap: "glass-panel inline-flex rounded-full border border-[color:var(--border)] p-1",
  langItem: "rounded-full px-3 py-2 text-sm font-semibold transition",
  langItemActive: "bg-[color:var(--accent)] text-white",
  langItemIdle: "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
  textMuted: "text-[color:var(--muted)]",
  themeToggle:
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel-muted)] text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted-hover)]",
} as const;
