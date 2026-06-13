import { AppIcon } from '../../components/icons/AppIcon';
import { useState } from 'react';
import { ChartPlaceholder, FinappCapsule, Section } from './CatalogPrimitives';
import { FinappSplideCarousel } from './FinappCarousel';

const CHART_TABS = ['24h', '1W', '1M', '1Y', 'All'] as const;

const WATCHLIST_COINS = [
  { pair: 'BTC/USD', price: '$38,509.44', up: true, pct: '6.78%', spark: 'success' as const },
  { pair: 'ETH/USD', price: '$1,462.61', up: false, pct: '2.54%', spark: 'danger' as const },
  { pair: 'USDT/USD', price: '$0.99995', up: true, pct: '0.05%', spark: 'success' as const },
  { pair: 'DOGE/USD', price: '$0.198410', up: true, pct: '1.73%', spark: 'success' as const },
  { pair: 'ADA/USD', price: '$1.271472', up: false, pct: '0.69%', spark: 'danger' as const },
];

function SparklineSlot({ tone }: { tone: 'success' | 'danger' }) {
  return (
    <div className={`chart chart-sparkline-${tone}-1`}>
      <ChartPlaceholder type="line" height={56} />
    </div>
  );
}

export function FinappChartsTab() {
  const [chartTab, setChartTab] = useState<(typeof CHART_TABS)[number]>('24h');

  return (
    <FinappCapsule>
      <Section
        title="Apex Charts — component page"
        source="component-charts.html"
        subtitle="Exact card + section-title + #chart-* ID structure from the template. Apex JS not bundled in catalog — SVG placeholders inside slots."
      >
        <div className="section mt-2">
          <div className="section-title">Apex Charts</div>
          <div className="card">
            <div className="card-body">
              Finapp uses{' '}
              <a href="https://apexcharts.com/" target="_blank" rel="noreferrer" className="text-brand-pink underline">
                Apex Charts
              </a>
              . Easily customizable, modern and interactive open-source charts.
            </div>
          </div>
        </div>

        <div className="section mt-2 mb-3">
          <div className="section-title">Line</div>
          <div className="card">
            <div className="card-body">
              <div id="chart-line">
                <ChartPlaceholder type="line" height={150} />
              </div>
            </div>
          </div>
        </div>

        <div className="section mt-3">
          <div className="row">
            <div className="col">
              <div className="section-title">Pie</div>
              <div className="card">
                <div className="card-body pe-0 ps-0">
                  <div id="chart-pie">
                    <ChartPlaceholder type="pie" height={140} />
                  </div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="section-title">Donut</div>
              <div className="card">
                <div className="card-body pe-0 ps-0">
                  <div id="chart-donut">
                    <ChartPlaceholder type="donut" height={140} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section mt-3">
          <div className="section-title">Bar</div>
          <div className="card">
            <div className="card-body">
              <div id="chart-bar">
                <ChartPlaceholder type="bar" height={180} />
              </div>
            </div>
          </div>
        </div>

        <div className="section mt-3 mb-3">
          <div className="section-title">CandleStick</div>
          <div className="card">
            <div className="card-body">
              <div id="chart-candlestick">
                <ChartPlaceholder type="candlestick" height={200} />
              </div>
            </div>
          </div>
        </div>

        <a
          href="https://apexcharts.com/"
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-lg btn-block"
        >
          More Example
        </a>
      </Section>

      <Section title="Watchlist coin cards + sparklines" source="crypto-index.html">
        <div className="section-heading padding mt-4">
          <h2 className="title">Watchlist</h2>
          <a href="#catalog" className="link" onClick={(e) => e.preventDefault()}>
            View All
          </a>
        </div>
        <FinappSplideCarousel
          variant="carousel-multiple"
          slideWidthPercent={72}
          slides={WATCHLIST_COINS.map((coin) => (
            <div key={coin.pair} className="card coinbox">
              <div className="card-body pb-0">
                <button type="button" className="fixed-button border-0 bg-transparent p-0" aria-label="Options">
                  <AppIcon icon="lucide:ellipsis-vertical" className="h-5 w-5" />
                </button>
                <h4>{coin.pair}</h4>
                <div className="text">{coin.price}</div>
                <div className="change">
                  <span className={`badge badge-${coin.up ? 'success' : 'danger'}`}>
                    {coin.up ? <AppIcon icon="lucide:arrow-up" className="inline h-3 w-3" /> : <AppIcon icon="lucide:arrow-down" className="inline h-3 w-3" />}
                    {coin.pct}
                  </span>
                </div>
              </div>
              <SparklineSlot tone={coin.spark} />
            </div>
          ))}
        />
      </Section>

      <Section title="Coin detail — tabbed charts" source="crypto-coin-detail.html">
        <div className="section mt-2">
          <div className="card">
            <div className="card-body">
              <ul className="nav nav-tabs capsuled" role="tablist">
                {CHART_TABS.map((tab) => (
                  <li key={tab} className="nav-item">
                    <button
                      type="button"
                      className={`nav-link${chartTab === tab ? ' active' : ''}`}
                      role="tab"
                      onClick={() => setChartTab(tab)}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="tab-content mt-3">
                <div className="tab-pane fade show active" role="tabpanel">
                  <div className={`chart chart-example-${CHART_TABS.indexOf(chartTab) + 1}`}>
                    <ChartPlaceholder type="line" height={220} />
                  </div>
                  <p className="mt-2 text-center text-xs opacity-50 font-mono">
                    .chart-example-{CHART_TABS.indexOf(chartTab) + 1} — tab {chartTab}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Dashboard context" source="index.html — stats + transactions (no inline Apex)">
        <div className="section">
          <div className="row mt-2">
            <div className="col-6">
              <div className="stat-box">
                <div className="title">Income</div>
                <div className="value text-success">$ 552.95</div>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-box">
                <div className="title">Expenses</div>
                <div className="value text-danger">$ 86.45</div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm opacity-60 px-1">
          Banking dashboard uses carousels for cards (see Menus tab) and stat boxes for KPIs — full Apex demos live on
          component-charts.html above.
        </p>
      </Section>
    </FinappCapsule>
  );
}
