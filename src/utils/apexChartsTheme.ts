/** Inter stack for ApexCharts — matches :root --app-font-family */
export const APEXCHARTS_FONT_FAMILY =
  'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif';

/** Base chart options merged into every ApexCharts instance */
export const apexChartsFontDefaults = {
  chart: {
    fontFamily: APEXCHARTS_FONT_FAMILY,
  },
} as const;
