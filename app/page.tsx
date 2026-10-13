"use client";

import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { useMemo, useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

type Category = "Ações" | "Índices" | "Moedas" | "Cripto";
type Section = "overview" | "explore" | "portfolio" | "correlation";
type Period = "1D" | "1S" | "1M" | "3M" | "1A";

type Asset = {
  symbol: string;
  name: string;
  category: Category;
  price: number;
  change: number;
  color: string;
  history: number[];
};

type Position = {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  color: string;
};

const assets: Asset[] = [
  {
    symbol: "PETR4",
    name: "Petrobras PN",
    category: "Ações",
    price: 38.72,
    change: 2.41,
    color: "#63d6a2",
    history: [101, 98, 103, 100, 105, 102, 108, 106, 111, 109, 115, 118],
  },
  {
    symbol: "VALE3",
    name: "Vale ON",
    category: "Ações",
    price: 62.15,
    change: -0.82,
    color: "#8f9bff",
    history: [109, 107, 110, 103, 106, 101, 104, 99, 102, 97, 100, 98],
  },
  {
    symbol: "ITUB4",
    name: "Itaú Unibanco PN",
    category: "Ações",
    price: 36.94,
    change: 1.16,
    color: "#f5a65b",
    history: [96, 99, 97, 102, 105, 103, 108, 106, 109, 112, 110, 114],
  },
  {
    symbol: "IBOV",
    name: "Ibovespa",
    category: "Índices",
    price: 131248.6,
    change: 0.74,
    color: "#63d6a2",
    history: [97, 98, 96, 101, 100, 103, 102, 105, 106, 104, 108, 110],
  },
  {
    symbol: "SPX",
    name: "S&P 500",
    category: "Índices",
    price: 5821.2,
    change: 0.38,
    color: "#8f9bff",
    history: [99, 101, 100, 103, 104, 102, 105, 104, 107, 108, 107, 109],
  },
  {
    symbol: "USD/BRL",
    name: "Dólar comercial",
    category: "Moedas",
    price: 5.47,
    change: -0.31,
    color: "#f5a65b",
    history: [106, 104, 105, 101, 102, 99, 100, 97, 98, 96, 94, 95],
  },
  {
    symbol: "EUR/BRL",
    name: "Euro comercial",
    category: "Moedas",
    price: 6.02,
    change: 0.22,
    color: "#d68bf0",
    history: [98, 100, 99, 102, 101, 104, 103, 105, 104, 107, 106, 108],
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    category: "Cripto",
    price: 623480,
    change: 3.87,
    color: "#f5a65b",
    history: [91, 96, 93, 101, 98, 105, 103, 110, 107, 114, 112, 121],
  },
];

const initialPositions: Position[] = [
  {
    symbol: "PETR4",
    name: "Petrobras PN",
    quantity: 120,
    averagePrice: 34.2,
    color: "#63d6a2",
  },
  {
    symbol: "ITUB4",
    name: "Itaú Unibanco PN",
    quantity: 80,
    averagePrice: 32.8,
    color: "#f5a65b",
  },
  {
    symbol: "VALE3",
    name: "Vale ON",
    quantity: 45,
    averagePrice: 66.4,
    color: "#8f9bff",
  },
];

const periods: Period[] = ["1D", "1S", "1M", "3M", "1A"];
const categoryFilters = ["Todos", "Ações", "Índices", "Moedas", "Cripto"] as const;
const chartLabels = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const historyLabels: Record<Period, string[]> = {
  "1D": chartLabels,
  "1S": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua", "Qui", "Hoje"],
  "1M": ["12 set", "15 set", "18 set", "21 set", "24 set", "27 set", "30 set", "03 out", "06 out", "09 out", "11 out", "Hoje"],
  "3M": ["Jul", "Jul", "Ago", "Ago", "Ago", "Set", "Set", "Set", "Out", "Out", "Out", "Hoje"],
  "1A": ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out"],
};

const correlationMatrix: Record<string, Record<string, number>> = {
  PETR4: { PETR4: 1, VALE3: 0.42, ITUB4: 0.28, IBOV: 0.67, "USD/BRL": -0.31 },
  VALE3: { PETR4: 0.42, VALE3: 1, ITUB4: 0.18, IBOV: 0.61, "USD/BRL": -0.16 },
  ITUB4: { PETR4: 0.28, VALE3: 0.18, ITUB4: 1, IBOV: 0.72, "USD/BRL": -0.24 },
  IBOV: { PETR4: 0.67, VALE3: 0.61, ITUB4: 0.72, IBOV: 1, "USD/BRL": -0.48 },
  "USD/BRL": { PETR4: -0.31, VALE3: -0.16, ITUB4: -0.24, IBOV: -0.48, "USD/BRL": 1 },
};

const formatCurrency = (value: number, currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);

function Icon({
  name,
  size = 18,
}: {
  name: "grid" | "chart" | "wallet" | "layers" | "search" | "bell" | "arrow" | "plus" | "clock" | "chevron" | "close" | "spark" | "filter" | "trend" | "menu";
  size?: number;
}) {
  const paths: Record<typeof name, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.3" /><rect x="14" y="3" width="7" height="7" rx="1.3" /><rect x="14" y="14" width="7" height="7" rx="1.3" /><rect x="3" y="14" width="7" height="7" rx="1.3" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 6-7" /><path d="M17 6h4v4" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 8h18" /><path d="M16 14h2" /><path d="M6 5V3h12v2" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    arrow: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1.1 2.3L22 17l-1.9.8L19 20l-.9-2.2L16 17l2.1-.7L19 14Z" /></>,
    filter: <><path d="M4 7h16" /><path d="M7 12h10" /><path d="M10 17h4" /></>,
    trend: <><path d="M3 17 9 11l4 4 8-9" /><path d="M15 6h6v6" /></>,
    menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function MiniSparkline({ positive }: { positive: boolean }) {
  const points = positive
    ? "0,21 9,17 18,20 28,12 38,15 47,9 57,11 66,4 76,7 86,1"
    : "0,3 9,7 18,4 28,11 38,9 47,15 57,12 66,19 76,16 86,22";
  return (
    <svg className="mini-sparkline" viewBox="0 0 86 24" role="img" aria-label={positive ? "Tendência positiva" : "Tendência negativa"}>
      <polyline points={points} fill="none" stroke={positive ? "#65d8a4" : "#f17979"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MarketChart({
  asset,
  period,
  compact = false,
}: {
  asset: Asset;
  period: Period;
  compact?: boolean;
}) {
  const shift = periods.indexOf(period);
  const data: ChartData<"line", number[], string> = {
    labels: historyLabels[period],
    datasets: [
      {
        label: asset.symbol,
        data: asset.history.map((value, index) => value + ((index * (shift + 2)) % 5) - 2),
        borderColor: asset.color,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(99, 214, 162, 0.04)";
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${asset.color}32`);
          gradient.addColorStop(1, `${asset.color}00`);
          return gradient;
        },
        fill: true,
        tension: 0.38,
        borderWidth: 2.25,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: asset.color,
        pointHoverBorderColor: "#131a1c",
        pointHoverBorderWidth: 3,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#20292b",
        borderColor: "#354143",
        borderWidth: 1,
        titleColor: "#899594",
        bodyColor: "#f2f4ed",
        padding: 11,
        displayColors: false,
        callbacks: {
          label: (item) =>
            item.parsed.y === null
              ? `  ${item.dataset.label}: —`
              : `  ${item.dataset.label}: ${formatNumber(item.parsed.y)} pts`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#778382",
          maxTicksLimit: compact ? 4 : 6,
          font: { size: 10, family: "Arial, sans-serif" },
        },
      },
      y: {
        position: "right",
        border: { display: false },
        grid: { color: "rgba(148, 163, 158, 0.09)" },
        ticks: {
          color: "#778382",
          maxTicksLimit: compact ? 4 : 5,
          font: { size: 10, family: "Arial, sans-serif" },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

function NavButton({
  section,
  active,
  icon,
  label,
  onClick,
}: {
  section: Section;
  active: Section;
  icon: "grid" | "chart" | "wallet" | "layers";
  label: string;
  onClick: (section: Section) => void;
}) {
  return (
    <button
      className={`nav-link ${active === section ? "active" : ""}`}
      onClick={() => onClick(section)}
      aria-current={active === section ? "page" : undefined}
    >
      <Icon name={icon} size={17} />
      <span>{label}</span>
      {active === section && <span className="nav-active-mark" />}
    </button>
  );
}

export default function Home() {
  const [section, setSection] = useState<Section>("overview");
  const [period, setPeriod] = useState<Period>("1D");
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>("Todos");
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("IBOV");
  const [positions, setPositions] = useState(initialPositions);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [positionSymbol, setPositionSymbol] = useState("PETR4");
  const [positionQuantity, setPositionQuantity] = useState("");
  const [positionPrice, setPositionPrice] = useState("");
  const [positionError, setPositionError] = useState("");
  const [correlationAssets, setCorrelationAssets] = useState(["PETR4", "VALE3", "ITUB4", "IBOV", "USD/BRL"]);

  const focusedAsset = assets.find((asset) => asset.symbol === selectedAsset) ?? assets[3];
  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return assets.filter((asset) => {
      const matchesCategory = category === "Todos" || asset.category === category;
      const matchesSearch =
        !normalizedSearch ||
        asset.symbol.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        asset.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const positionValues = positions.map((position) => {
    const quote = assets.find((asset) => asset.symbol === position.symbol)?.price ?? position.averagePrice;
    return { ...position, currentPrice: quote, marketValue: quote * position.quantity };
  });
  const portfolioValue = positionValues.reduce((total, position) => total + position.marketValue, 0);
  const investedValue = positionValues.reduce((total, position) => total + position.averagePrice * position.quantity, 0);
  const portfolioChange = portfolioValue - investedValue;
  const portfolioChangePercent = investedValue ? (portfolioChange / investedValue) * 100 : 0;

  const portfolioData: ChartData<"doughnut", number[], string> = {
    labels: positionValues.map((position) => position.symbol),
    datasets: [
      {
        data: positionValues.map((position) => position.marketValue),
        backgroundColor: positionValues.map((position) => position.color),
        borderColor: "#151c1d",
        borderWidth: 4,
        hoverOffset: 5,
      },
    ],
  };
  const portfolioOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "74%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#20292b",
        borderColor: "#354143",
        borderWidth: 1,
        padding: 10,
        callbacks: { label: (item) => ` ${item.label}: ${formatCurrency(Number(item.raw))}` },
      },
    },
  };

  function addPosition(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = Number(positionQuantity);
    const averagePrice = Number(positionPrice);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(averagePrice) || averagePrice <= 0) {
      setPositionError("Informe uma quantidade e um preço maiores que zero.");
      return;
    }
    const asset = assets.find((item) => item.symbol === positionSymbol);
    if (!asset) {
      setPositionError("Não foi possível localizar esse ativo.");
      return;
    }
    setPositions((current) => {
      const existing = current.find((item) => item.symbol === asset.symbol);
      if (!existing) {
        return [...current, { symbol: asset.symbol, name: asset.name, quantity, averagePrice, color: asset.color }];
      }
      const totalQuantity = existing.quantity + quantity;
      const blendedPrice = (existing.averagePrice * existing.quantity + averagePrice * quantity) / totalQuantity;
      return current.map((item) =>
        item.symbol === asset.symbol
          ? { ...item, quantity: totalQuantity, averagePrice: blendedPrice }
          : item,
      );
    });
    setPositionError("");
    setPositionQuantity("");
    setPositionPrice("");
    setShowPositionForm(false);
  }

  function toggleCorrelationAsset(symbol: string) {
    setCorrelationAssets((current) => {
      if (current.includes(symbol)) {
        return current.length > 2 ? current.filter((item) => item !== symbol) : current;
      }
      return current.length < 5 ? [...current, symbol] : current;
    });
  }

  const sectionTitles: Record<Section, { eyebrow: string; title: string; subtitle: string }> = {
    overview: {
      eyebrow: "TERMINAL DE MERCADO",
      title: "Bom dia, investidor",
      subtitle: "Uma visão clara do que está movimentando os mercados hoje.",
    },
    explore: {
      eyebrow: "UNIVERSO DE ATIVOS",
      title: "Explore os mercados",
      subtitle: "Encontre oportunidades e acompanhe ativos de diferentes categorias.",
    },
    portfolio: {
      eyebrow: "SIMULADOR DE INVESTIMENTOS",
      title: "Sua carteira",
      subtitle: "Acompanhe a evolução e a distribuição dos seus investimentos fictícios.",
    },
    correlation: {
      eyebrow: "LABORATÓRIO DE MERCADO",
      title: "Correlação de ativos",
      subtitle: "Entenda como diferentes ativos se movimentam em relação uns aos outros.",
    },
  };
  const currentTitle = sectionTitles[section];

  return (
    <main className="app-shell">
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setSection("overview"); }}>
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span className="brand-word">macro<span>market</span></span>
        </a>

        <div className="sidebar-label">MENU PRINCIPAL</div>
        <nav className="main-nav" aria-label="Navegação principal">
          <NavButton section="overview" active={section} icon="grid" label="Visão geral" onClick={(value) => { setSection(value); setMobileNavOpen(false); }} />
          <NavButton section="explore" active={section} icon="chart" label="Explorar ativos" onClick={(value) => { setSection(value); setMobileNavOpen(false); }} />
          <NavButton section="portfolio" active={section} icon="wallet" label="Minha carteira" onClick={(value) => { setSection(value); setMobileNavOpen(false); }} />
          <NavButton section="correlation" active={section} icon="layers" label="Lab de correlação" onClick={(value) => { setSection(value); setMobileNavOpen(false); }} />
        </nav>

        <div className="sidebar-bottom">
          <div className="market-status">
            <div className="status-heading"><span className="live-dot" /> MERCADO ABERTO</div>
            <p>Bolsa brasileira encerra em<br />4h 23min</p>
            <div className="market-status-line"><span>Ibovespa</span><strong>131.248 <i>+0,74%</i></strong></div>
          </div>
          <button className="profile-button">
            <span className="avatar">AM</span>
            <span className="profile-copy"><strong>Alex Morgan</strong><small>Plano gratuito</small></span>
            <span className="profile-dots">···</span>
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNavOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{section === "overview" ? "Visão geral" : sectionTitles[section].title}</strong></div>
          <div className="topbar-actions">
            <label className="global-search">
              <Icon name="search" size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar ativo..." aria-label="Buscar ativo" />
              <kbd>/</kbd>
            </label>
            <span className="topbar-divider" />
            <button className="icon-button notification-button" aria-label="Notificações"><Icon name="bell" size={18} /><i /></button>
            <span className="topbar-date">SEG, 12 OUT 2026</span>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" />{currentTitle.eyebrow}</div>
              <h1>{currentTitle.title}</h1>
              <p>{currentTitle.subtitle}</p>
            </div>
            <div className="demo-note"><span className="demo-dot" /> DADOS DEMONSTRATIVOS</div>
          </div>

          {section === "overview" && (
            <>
              <div className="market-cards">
                {[
                  { label: "IBOVESPA", symbol: "IBOV", value: "131.248,60", change: "+0,74%", positive: true },
                  { label: "S&P 500", symbol: "SPX", value: "5.821,20", change: "+0,38%", positive: true },
                  { label: "DÓLAR COMERCIAL", symbol: "USD/BRL", value: "R$ 5,47", change: "−0,31%", positive: false },
                ].map((item, index) => (
                  <button className="market-card" key={item.symbol} onClick={() => { setSelectedAsset(item.symbol); setSection("explore"); }}>
                    <div className="market-card-top"><span>{item.label}</span><span className={`market-change ${item.positive ? "positive" : "negative"}`}>{item.change}</span></div>
                    <div className="market-card-value">{item.value}</div>
                    <div className="market-card-bottom"><span>{item.symbol} <span className="muted-separator">/</span> mercado à vista</span><MiniSparkline positive={item.positive} /></div>
                    <span className={`card-index index-${index}`} />
                  </button>
                ))}
              </div>

              <div className="overview-grid">
                <section className="panel performance-panel">
                  <div className="panel-heading">
                    <div><span className="panel-kicker">ACOMPANHAMENTO</span><h2>Performance do mercado</h2></div>
                    <div className="chart-toolbar">
                      <select className="asset-select" aria-label="Ativo do gráfico" value={selectedAsset} onChange={(event) => setSelectedAsset(event.target.value)}>
                        {assets.filter((asset) => asset.category === "Índices" || asset.category === "Moedas").map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>)}
                      </select>
                      <div className="period-switch" aria-label="Período do gráfico">
                        {periods.map((item) => <button key={item} className={period === item ? "selected" : ""} onClick={() => setPeriod(item)}>{item}</button>)}
                      </div>
                    </div>
                  </div>
                  <div className="chart-summary"><strong>{focusedAsset.symbol}</strong><span>{focusedAsset.name}</span><b className={focusedAsset.change >= 0 ? "positive" : "negative"}>{focusedAsset.change >= 0 ? "+" : ""}{formatNumber(focusedAsset.change)}%</b></div>
                  <div className="main-chart"><MarketChart asset={focusedAsset} period={period} /></div>
                  <div className="chart-footnote"><span><i className="legend-dot" /> {focusedAsset.symbol}</span><span><Icon name="clock" size={13} /> Atualizado às 15:42</span></div>
                </section>

                <section className="panel movers-panel">
                  <div className="panel-heading">
                    <div><span className="panel-kicker">SESSÃO ATUAL</span><h2>Movimentações</h2></div>
                    <button className="text-button" onClick={() => setSection("explore")}>Ver todos <Icon name="arrow" size={14} /></button>
                  </div>
                  <div className="movers-tabs"><span className="active">Em alta</span><span>Em queda</span><span>Mais negociados</span></div>
                  <div className="movers-list">
                    {assets.filter((asset) => asset.change > 0).sort((a, b) => b.change - a.change).slice(0, 4).map((asset, index) => (
                      <button key={asset.symbol} className="mover-row" onClick={() => { setSelectedAsset(asset.symbol); setSection("explore"); }}>
                        <span className="mover-rank">0{index + 1}</span>
                        <span className="asset-monogram" style={{ color: asset.color }}>{asset.symbol.slice(0, 2)}</span>
                        <span className="mover-name"><strong>{asset.symbol}</strong><small>{asset.name}</small></span>
                        <span className="mover-value"><strong>{formatCurrency(asset.price)}</strong><small className="positive">+{formatNumber(asset.change)}%</small></span>
                      </button>
                    ))}
                  </div>
                  <div className="sentiment-card">
                    <div className="sentiment-top"><span>TERMÔMETRO DO MERCADO</span><Icon name="spark" size={15} /></div>
                    <div className="sentiment-reading"><strong>62</strong><span>Otimismo<br /><small>em alta</small></span></div>
                    <div className="sentiment-meter"><span /></div>
                    <div className="sentiment-scale"><span>Medo</span><span>Neutro</span><span>Otimismo</span></div>
                  </div>
                </section>
              </div>

              <MarketTable
                assets={filteredAssets.slice(0, 5)}
                category={category}
                onCategoryChange={setCategory}
                onSelect={(asset) => { setSelectedAsset(asset.symbol); setSection("explore"); }}
                onViewAll={() => setSection("explore")}
              />
            </>
          )}

          {section === "explore" && (
            <div className="explore-layout">
              <section className="panel explorer-chart-panel">
                <div className="panel-heading">
                  <div><span className="panel-kicker">DETALHE DO ATIVO</span><h2>Visão de mercado</h2></div>
                  <div className="chart-toolbar">
                    <select className="asset-select" aria-label="Escolha um ativo" value={selectedAsset} onChange={(event) => setSelectedAsset(event.target.value)}>
                      {assets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>)}
                    </select>
                    <div className="period-switch" aria-label="Período do gráfico">
                      {periods.map((item) => <button key={item} className={period === item ? "selected" : ""} onClick={() => setPeriod(item)}>{item}</button>)}
                    </div>
                  </div>
                </div>
                <div className="asset-detail">
                  <span className="asset-icon-large" style={{ color: focusedAsset.color }}>{focusedAsset.symbol.slice(0, 2)}</span>
                  <div><h3>{focusedAsset.name}</h3><span>{focusedAsset.symbol} <span className="muted-separator">·</span> {focusedAsset.category}</span></div>
                  <div className="asset-detail-price"><strong>{formatCurrency(focusedAsset.price)}</strong><span className={focusedAsset.change >= 0 ? "positive" : "negative"}>{focusedAsset.change >= 0 ? "+" : ""}{formatNumber(focusedAsset.change)}% hoje</span></div>
                </div>
                <div className="main-chart explorer-chart"><MarketChart asset={focusedAsset} period={period} /></div>
                <div className="chart-footnote"><span><i className="legend-dot" /> {focusedAsset.symbol}</span><span><Icon name="clock" size={13} /> Cotação demonstrativa</span></div>
              </section>
              <section className="panel asset-stats-panel">
                <div className="panel-heading"><div><span className="panel-kicker">INDICADORES</span><h2>Resumo do ativo</h2></div></div>
                <div className="stats-list">
                  <div><span>Preço atual</span><strong>{formatCurrency(focusedAsset.price)}</strong></div>
                  <div><span>Variação do dia</span><strong className={focusedAsset.change >= 0 ? "positive" : "negative"}>{focusedAsset.change >= 0 ? "+" : ""}{formatNumber(focusedAsset.change)}%</strong></div>
                  <div><span>Máxima do período</span><strong>{formatCurrency(focusedAsset.price * 1.034)}</strong></div>
                  <div><span>Mínima do período</span><strong>{formatCurrency(focusedAsset.price * 0.972)}</strong></div>
                  <div><span>Média móvel (20)</span><strong>{formatCurrency(focusedAsset.price * 0.986)}</strong></div>
                  <div><span>Volatilidade anualizada</span><strong>18,42%</strong></div>
                </div>
                <div className="insight-callout"><span className="insight-icon"><Icon name="spark" size={16} /></span><p><strong>Leitura de mercado</strong><br />O ativo apresenta variação positiva no período selecionado. Dados apenas para fins demonstrativos.</p></div>
              </section>
              <MarketTable
                assets={filteredAssets}
                category={category}
                onCategoryChange={setCategory}
                onSelect={(asset) => setSelectedAsset(asset.symbol)}
                onViewAll={() => setSection("explore")}
                title="Todos os ativos"
              />
            </div>
          )}

          {section === "portfolio" && (
            <>
              <div className="portfolio-summary">
                <div className="portfolio-total panel">
                  <div className="panel-kicker">PATRIMÔNIO SIMULADO</div>
                  <div className="portfolio-total-value">{formatCurrency(portfolioValue)}</div>
                  <div className={`portfolio-return ${portfolioChange >= 0 ? "positive" : "negative"}`}>
                    <Icon name="trend" size={15} /> {portfolioChange >= 0 ? "+" : ""}{formatCurrency(portfolioChange)} ({portfolioChangePercent >= 0 ? "+" : ""}{formatNumber(portfolioChangePercent)}%)
                    <span> desde o início</span>
                  </div>
                  <div className="portfolio-meta"><span>Valor investido <strong>{formatCurrency(investedValue)}</strong></span><span>Ativos <strong>{positions.length}</strong></span></div>
                </div>
                <div className="panel allocation-panel">
                  <div className="panel-heading"><div><span className="panel-kicker">COMPOSIÇÃO</span><h2>Distribuição da carteira</h2></div></div>
                  <div className="allocation-content">
                    <div className="donut-chart"><Doughnut data={portfolioData} options={portfolioOptions} /><div className="donut-center"><strong>{positions.length}</strong><span>ativos</span></div></div>
                    <div className="allocation-legend">{positionValues.map((position) => <div key={position.symbol}><span style={{ background: position.color }} /><span>{position.symbol}</span><strong>{portfolioValue ? formatNumber((position.marketValue / portfolioValue) * 100) : "0"}%</strong></div>)}</div>
                  </div>
                </div>
              </div>
              <section className="panel portfolio-table-panel">
                <div className="panel-heading">
                  <div><span className="panel-kicker">ACOMPANHAMENTO</span><h2>Posições da carteira</h2></div>
                  <button className="primary-button" onClick={() => setShowPositionForm(true)}><Icon name="plus" size={16} /> Adicionar posição</button>
                </div>
                <div className="table-wrap">
                  <table className="market-table portfolio-table">
                    <thead><tr><th>ATIVO</th><th>QUANTIDADE</th><th>PREÇO MÉDIO</th><th>PREÇO ATUAL</th><th>VALOR DE MERCADO</th><th>RESULTADO</th><th /></tr></thead>
                    <tbody>{positionValues.map((position) => {
                      const result = position.marketValue - position.averagePrice * position.quantity;
                      const resultPercent = (result / (position.averagePrice * position.quantity)) * 100;
                      return <tr key={position.symbol}>
                        <td><div className="table-asset"><span className="asset-monogram" style={{ color: position.color }}>{position.symbol.slice(0, 2)}</span><span><strong>{position.symbol}</strong><small>{position.name}</small></span></div></td>
                        <td>{formatNumber(position.quantity)}</td><td>{formatCurrency(position.averagePrice)}</td><td>{formatCurrency(position.currentPrice)}</td><td className="numeric-strong">{formatCurrency(position.marketValue)}</td>
                        <td><span className={`pnl-value ${result >= 0 ? "positive" : "negative"}`}>{result >= 0 ? "+" : ""}{formatCurrency(result)}<small>{resultPercent >= 0 ? "+" : ""}{formatNumber(resultPercent)}%</small></span></td>
                        <td><button className="remove-position" aria-label={`Remover ${position.symbol}`} title={`Remover ${position.symbol}`} onClick={() => setPositions((current) => current.filter((item) => item.symbol !== position.symbol))}><Icon name="close" size={15} /></button></td>
                      </tr>;
                    })}</tbody>
                  </table>
                  {positions.length === 0 && <div className="empty-state">Sua carteira está vazia. Adicione uma posição para começar a simular.</div>}
                </div>
                <div className="portfolio-disclaimer">Simulador fictício. Valores não representam recomendações de investimento nem cotações reais.</div>
              </section>
            </>
          )}

          {section === "correlation" && (
            <>
              <div className="panel correlation-controls">
                <div><span className="panel-kicker">UNIVERSO DE ANÁLISE</span><h2>Selecione até 5 ativos</h2><p>Escolha quais ativos deseja comparar na matriz.</p></div>
                <div className="correlation-chips">{["PETR4", "VALE3", "ITUB4", "IBOV", "USD/BRL"].map((symbol) => <button className={correlationAssets.includes(symbol) ? "selected" : ""} key={symbol} onClick={() => toggleCorrelationAsset(symbol)}>{correlationAssets.includes(symbol) && <span>✓</span>}{symbol}</button>)}</div>
              </div>
              <div className="correlation-layout">
                <section className="panel matrix-panel">
                  <div className="panel-heading"><div><span className="panel-kicker">PEARSON · 30 DIAS</span><h2>Matriz de correlação</h2></div><button className="soft-button"><Icon name="clock" size={14} /> 30 dias <span>⌄</span></button></div>
                  <p className="panel-description">Correlação dos retornos diários entre os ativos selecionados.</p>
                  <div className="matrix-wrap">
                    <table className="correlation-matrix">
                      <thead><tr><th></th>{correlationAssets.map((symbol) => <th key={symbol}>{symbol}</th>)}</tr></thead>
                      <tbody>{correlationAssets.map((row) => <tr key={row}><th>{row}</th>{correlationAssets.map((column) => {
                        const value = correlationMatrix[row]?.[column] ?? correlationMatrix[column]?.[row] ?? 0.2;
                        const strength = Math.abs(value);
                        const backgroundColor = value >= 0
                          ? `rgba(99, 214, 162, ${0.1 + strength * 0.48})`
                          : `rgba(241, 121, 121, ${0.1 + strength * 0.5})`;
                        return <td key={column}><span style={{ backgroundColor: row === column ? "rgba(99, 214, 162, 0.72)" : backgroundColor }}>{value.toFixed(2)}</span></td>;
                      })}</tr>)}</tbody>
                    </table>
                  </div>
                  <div className="matrix-legend"><span>−1,0</span><div className="matrix-gradient" /><span>0</span><div className="matrix-gradient positive-gradient" /><span>+1,0</span></div>
                </section>
                <section className="panel correlation-insights">
                  <div className="panel-heading"><div><span className="panel-kicker">LEITURA RÁPIDA</span><h2>O que os dados sugerem</h2></div></div>
                  <div className="insight-item"><span className="insight-number">01</span><div><strong>Correlação mais forte</strong><p>ITUB4 e IBOV se moveram juntos no período, com correlação de <b>0,72</b>.</p></div></div>
                  <div className="insight-item"><span className="insight-number">02</span><div><strong>Possível diversificação</strong><p>USD/BRL e IBOV tiveram relação inversa, com correlação de <b>−0,48</b>.</p></div></div>
                  <div className="insight-item"><span className="insight-number">03</span><div><strong>Relação moderada</strong><p>PETR4 e VALE3 apresentam correlação de <b>0,42</b> neste recorte.</p></div></div>
                  <div className="correlation-notice"><Icon name="spark" size={15} /> Correlação não implica causalidade. Use como contexto, não como previsão.</div>
                </section>
              </div>
              <section className="panel methodology-panel"><div className="method-icon"><Icon name="chart" size={18} /></div><div><strong>Como interpretar</strong><p>Os coeficientes variam de −1 a +1. Valores próximos a +1 indicam movimentos na mesma direção; próximos a −1 indicam movimentos opostos; perto de 0 sugerem baixa relação linear.</p></div></section>
            </>
          )}

          <footer className="page-footer"><span>MACROMARKET <i>·</i> TERMINAL FINANCEIRO</span><span>Dados demonstrativos <i>·</i> Não constitui recomendação de investimento</span></footer>
        </div>
      </section>

      {showPositionForm && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPositionForm(false); }}>
          <section className="position-modal" role="dialog" aria-modal="true" aria-labelledby="position-modal-title">
            <div className="modal-header"><div><span className="panel-kicker">SIMULADOR</span><h2 id="position-modal-title">Adicionar posição</h2></div><button className="icon-button" aria-label="Fechar" onClick={() => setShowPositionForm(false)}><Icon name="close" /></button></div>
            <p>Registre uma compra fictícia para acompanhar sua carteira.</p>
            <form onSubmit={addPosition}>
              <label>Ativo<select value={positionSymbol} onChange={(event) => setPositionSymbol(event.target.value)}>{assets.filter((asset) => asset.category === "Ações").map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} — {asset.name}</option>)}</select></label>
              <div className="form-row"><label>Quantidade<input type="number" min="0.0001" step="any" required placeholder="Ex.: 100" value={positionQuantity} onChange={(event) => setPositionQuantity(event.target.value)} /></label><label>Preço médio<input type="number" min="0.01" step="any" required placeholder="Ex.: 35,50" value={positionPrice} onChange={(event) => setPositionPrice(event.target.value)} /></label></div>
              {positionError && <div className="form-error" role="alert">{positionError}</div>}
              <div className="modal-actions"><button type="button" className="soft-button" onClick={() => setShowPositionForm(false)}>Cancelar</button><button type="submit" className="primary-button"><Icon name="plus" size={15} /> Adicionar ativo</button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function MarketTable({
  assets: visibleAssets,
  category,
  onCategoryChange,
  onSelect,
  onViewAll,
  title = "Ativos em destaque",
}: {
  assets: Asset[];
  category: (typeof categoryFilters)[number];
  onCategoryChange: (category: (typeof categoryFilters)[number]) => void;
  onSelect: (asset: Asset) => void;
  onViewAll: () => void;
  title?: string;
}) {
  return (
    <section className="panel market-table-panel">
      <div className="panel-heading table-panel-heading">
        <div><span className="panel-kicker">RADAR DE ATIVOS</span><h2>{title}</h2></div>
        <button className="text-button" onClick={onViewAll}>Ver universo completo <Icon name="arrow" size={14} /></button>
      </div>
      <div className="table-filters">
        <div className="filter-tabs">{categoryFilters.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => onCategoryChange(item)}>{item}</button>)}</div>
        <span className="filter-count"><Icon name="filter" size={14} /> {visibleAssets.length} ativos</span>
      </div>
      <div className="table-wrap">
        <table className="market-table">
          <thead><tr><th>ATIVO</th><th>CATEGORIA</th><th>PREÇO</th><th>VARIAÇÃO</th><th>ÚLTIMAS 24H</th><th /></tr></thead>
          <tbody>
            {visibleAssets.map((asset) => (
              <tr key={asset.symbol} onClick={() => onSelect(asset)}>
                <td><div className="table-asset"><span className="asset-monogram" style={{ color: asset.color }}>{asset.symbol.slice(0, 2)}</span><span><strong>{asset.symbol}</strong><small>{asset.name}</small></span></div></td>
                <td><span className="category-tag">{asset.category}</span></td>
                <td className="numeric-strong">{formatCurrency(asset.price)}</td>
                <td><span className={`change-pill ${asset.change >= 0 ? "positive" : "negative"}`}>{asset.change >= 0 ? "+" : ""}{formatNumber(asset.change)}%</span></td>
                <td><MiniSparkline positive={asset.change >= 0} /></td>
                <td><button className="row-arrow" aria-label={`Ver ${asset.symbol}`}><Icon name="chevron" size={16} /></button></td>
              </tr>
            ))}
            {visibleAssets.length === 0 && <tr><td colSpan={6}><div className="empty-state">Nenhum ativo encontrado com esse filtro.</div></td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
