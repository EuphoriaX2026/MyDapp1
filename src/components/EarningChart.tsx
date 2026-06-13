import React, { useState, useEffect, useRef } from 'react';
import { media } from '../assets/media';

interface StationData {
  id: number;
  date: string;
  amount: number;
  successRate: number;
  avatar: string;
}

export default function EarningChart() {
  const [timeRange, setTimeRange] = useState<'All' | 'Month' | 'Week'>('All');
  const [data, setData] = useState<StationData[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);

  // وضعیت‌های Drag & Drop
  const [tooltipPos, setTooltipPos] = useState({ x: '50%', y: '30%' });
  const [minMaxPos, setMinMaxPos] = useState({ x: '10%', y: '10%' });
  const [draggingEl, setDraggingEl] = useState<'tooltip' | 'minmax' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBlockchainData = () => {
      const cachedData = localStorage.getItem('dapp_earnings_data');
      let parsedData: StationData[] = [];

      if (cachedData) {
        parsedData = JSON.parse(cachedData);
      } else {
        parsedData = [
          { id: 1, date: "Week 1", amount: 45, successRate: 40, avatar: media.game.casino },
          { id: 2, date: "Week 2", amount: 80, successRate: 65, avatar: media.game.sports },
          { id: 3, date: "Week 3", amount: 150, successRate: 50, avatar: media.game.casino },
          { id: 4, date: "Week 4", amount: 320, successRate: 84, avatar: media.game.turbo },
        ];
        localStorage.setItem('dapp_earnings_data', JSON.stringify(parsedData));
      }
      
      setData(parsedData);
      if (parsedData.length > 0) {
        setSelectedStation(parsedData[parsedData.length - 1]);
      }
    };

    fetchBlockchainData();
  }, [timeRange]);

  // ---------------- محاسبات محور Y (بند 4) ----------------
  const maxAmount = data.length > 0 ? Math.max(...data.map(d => d.amount)) : 0;
  const minAmount = data.length > 0 ? Math.min(...data.map(d => d.amount)) : 0;
  
  let yStep = 20;
  if (maxAmount < 100) yStep = 20;
  else if (maxAmount < 1000) yStep = 100;
  else if (maxAmount < 10000) yStep = 1000;
  else yStep = 10000;

  // محاسبه سقف نمودار (همیشه کمی بالاتر از ماکزیمم برای زیبایی)
  let yAxisMax = Math.ceil(maxAmount / yStep) * yStep;
  if (yAxisMax === maxAmount || yAxisMax === 0) yAxisMax += yStep;
  // برای مبالغ بالای 10000 سقف تا 60000
  if (maxAmount > 10000 && yAxisMax > 60000) yAxisMax = 60000; 

  const yLabels: number[] = [];
  for (let i = yAxisMax; i >= 0; i -= yStep) {
    yLabels.push(i);
  }

  // ---------------- محاسبات محور X (بند 1 و 3) ----------------
  // حداقل 10 بازه زمانی. اگر دیتا کمتر بود، محور طولانی‌تر می‌شود تا فضا خالی بماند
  const xGridCount = Math.max(10, data.length);
  
  // برای جلوگیری از بیرون زدن المان‌ها (بند 1) 5 درصد حاشیه امن در نظر می‌گیریم
  const safePaddingPercent = 5; 
  const usableWidthPercent = 100 - (safePaddingPercent * 2);

  const generateSvgPath = () => {
    if (data.length === 0) return "";
    const width = 1000;
    const height = 400;
    const safePaddingSvg = (safePaddingPercent / 100) * width;
    const usableSvgWidth = width - (safePaddingSvg * 2);
    
    const stepX = usableSvgWidth / (xGridCount > 1 ? xGridCount - 1 : 1);
    
    let path = "";
    data.forEach((point, index) => {
      const x = safePaddingSvg + (index * stepX);
      const y = height - (point.amount / yAxisMax) * (height - 50); // 50px حاشیه بالا
      
      if (index === 0) {
        path += `M ${x} ${y} `;
      } else {
        const prevX = safePaddingSvg + ((index - 1) * stepX);
        const prevY = height - (data[index - 1].amount / yAxisMax) * (height - 50);
        const cpX1 = prevX + stepX / 2;
        const cpY1 = prevY;
        const cpX2 = x - stepX / 2;
        const cpY2 = y;
        path += `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y} `;
      }
    });
    return path;
  };

  const chartPath = generateSvgPath();

  // هندلرهای Drag & Drop
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingEl || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = `${((clientX - rect.left - 50) / rect.width) * 100}%`;
    const y = `${((clientY - rect.top - 50) / rect.height) * 100}%`;

    if (draggingEl === 'tooltip') setTooltipPos({ x, y });
    if (draggingEl === 'minmax') setMinMaxPos({ x, y });
  };

  const handleMouseUp = () => setDraggingEl(null);

  // تولید برچسب‌های خالی محور X برای رسیدن به حداقل 10 بازه
  const xLabelsDisplay = Array.from({ length: xGridCount }, (_, i) => {
    return data[i] ? data[i].date : timeRange === 'Month' ? `Month ${i+1}` : `Week ${i+1}`;
  });

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      className="w-full mx-auto mt-8 mb-16 p-4 bg-[#1a1a24] rounded-[24px] shadow-2xl relative font-sans overflow-hidden select-none"
    >
      
      {/* هدر و دکمه‌های تایم‌فریم */}
      <div className="flex flex-wrap justify-start gap-2 mb-8 relative z-30">
        {['All', 'Month', 'Week'].map((range) => (
          <button 
            key={range}
            onClick={() => setTimeRange(range as any)}
            className={`px-4  py-2 rounded-full text-[10px]  font-bold tracking-widest border transition-all duration-300 ${
              timeRange === range 
                ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]' 
                : 'bg-[#121218] text-gray-400 border-gray-800 hover:border-purple-500 hover:text-white'
            }`}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative w-full h-[300px]">
        {/* خطوط گرید عمودی */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20" 
             style={{ paddingLeft: `${safePaddingPercent}%`, paddingRight: `${safePaddingPercent}%` }}>
          {Array(xGridCount).fill(0).map((_, i) => (
            <div key={i} className="h-full w-px border-l border-dashed border-gray-400"></div>
          ))}
        </div>

        {/* محور Y (سمت راست - داینامیک) */}
        <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-gray-500 text-[9px] font-medium uppercase tracking-wider py-4 z-10">
          {yLabels.map((val, i) => (
            <span key={i} className={i === 0 ? "text-purple-400 font-black bg-[#1a1a24] px-1 rounded" : "bg-[#1a1a24] px-1 rounded"}>
              ${val.toLocaleString()}
            </span>
          ))}
        </div>

        {/* گراف SVG */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 400">
            <defs>
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1a1a24" stopOpacity="0" />
              </linearGradient>
            </defs>

            {chartPath && (
              <>
                <path 
                  d={`${chartPath} L ${(safePaddingPercent/100)*1000 + ((data.length-1)/(xGridCount-1))*((usableWidthPercent/100)*1000)} 400 L ${(safePaddingPercent/100)*1000} 400 Z`} 
                  fill="url(#chartGradient)" 
                />
                <path 
                  d={chartPath} 
                  fill="none" 
                  stroke="#c084fc" 
                  strokeWidth="4" 
                  filter="url(#neonGlow)"
                  className="animate-pulse"
                />
              </>
            )}
          </svg>
        </div>

        {/* عناصر روی نمودار */}
        <div className="absolute inset-0 z-20">
          
          {/* ایستگاه‌های درآمدی */}
          {data.map((point, index) => {
            const height = 400; // مبنای SVG
            // محاسبه درصد X با لحاظ کردن حاشیه امن (بند 1)
            const stepPercent = usableWidthPercent / (xGridCount > 1 ? xGridCount - 1 : 1);
            const xPercent = safePaddingPercent + (index * stepPercent);
            const yPercent = ((height - (point.amount / yAxisMax) * (height - 50)) / height) * 100;

            return (
              <div 
                key={point.id} 
                className="absolute flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                onClick={() => setSelectedStation(point)}
              >
                <div className="mb-1 bg-[#ff00ff] text-white text-[9px] font-bold px-2 py-1 rounded shadow-[0_0_10px_#ff00ff] opacity-0 hover:opacity-100 transition-opacity">
                  ${point.amount}
                </div>
                <div className={`relative ${selectedStation?.id === point.id ? 'animate-bounce scale-110 ' : 'hover:scale-110'} transition-all`}>
                  <img src={point.avatar} alt="Station" className="w-8 h-8 rounded-full border-[1.5px] border-purple-500 shadow-[0_0_15px_#a855f7] object-cover bg-gray-900" />
                </div>
              </div>
            );
          })}

          {/* باکس بیشترین و کمترین (Dragable) */}
          <div 
            className="absolute flex flex-col gap-[2px] cursor-move z-40 touch-none"
            style={{ left: minMaxPos.x, top: minMaxPos.y }}
            onMouseDown={() => setDraggingEl('minmax')}
            onTouchStart={() => setDraggingEl('minmax')}
          >
            <div className="bg-[#a855f7]/90 backdrop-blur-sm text-white font-black text-xs px-3 py-1.5 rounded-t-lg rounded-bl-lg shadow-[0_0_15px_#a855f7] flex justify-between gap-3 border border-purple-400">
              <span>Max:</span> <span>${maxAmount}</span>
            </div>
            <div className="bg-[#ff00ff]/90 backdrop-blur-sm text-white font-black text-xs px-3 py-1.5 rounded-b-lg rounded-tr-lg shadow-[0_0_15px_#ff00ff] flex justify-between gap-3 border border-pink-400">
               <span>Min:</span> <span>${minAmount}</span>
            </div>
          </div>

          {/* کادر گزارش ایستگاه (Tooltip Dragable) */}
          {selectedStation && (
            <div 
              className="absolute bg-[#1c1d29]/90 border border-purple-500/50 p-3 rounded-xl w-[180px] shadow-2xl backdrop-blur-md cursor-move z-50 transition-colors hover:border-purple-400 touch-none"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
              onMouseDown={() => setDraggingEl('tooltip')}
              onTouchStart={() => setDraggingEl('tooltip')}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#ff00ff] w-6 h-6 rounded-full flex justify-center items-center shadow-[0_0_15px_#ff00ff]">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
                <h4 className="text-white text-[10px] font-black uppercase tracking-wider">Station Report</h4>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between text-gray-400">
                  <span>Period:</span> <span className="text-white font-bold">{selectedStation.date}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Income:</span> <span className="text-green-400 font-bold">${selectedStation.amount}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Success Rate:</span> <span className="text-[#ff00ff] font-bold">{selectedStation.successRate}%</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* محور X (پایین - نوار زمان) */}
      <div className="mt-4 border-t border-gray-800 pt-4 flex justify-between text-gray-500 text-[8px] font-medium uppercase tracking-wider"
           style={{ paddingLeft: `${safePaddingPercent}%`, paddingRight: `${safePaddingPercent}%` }}>
        {xLabelsDisplay.map((label, i) => (
          <span key={i} className="text-center w-8 -ml-4">{label}</span>
        ))}
      </div>

    </div>
  );
}
