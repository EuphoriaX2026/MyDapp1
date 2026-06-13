import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { apexChartsFontDefaults } from '../utils/apexChartsTheme';

interface CoinChartProps {
  coinId: string;
  data: number[];
  isPositive: boolean;
  height?: number;
  currentPrice?: number;
  symbol?: string;
}

export const CoinChart: React.FC<CoinChartProps> = ({ 
  coinId, 
  data, 
  isPositive, 
  height = 80,
  currentPrice,
  symbol
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    const initChart = async () => {
      try {
        // Cleanup existing chart
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }

        const options = {
          series: [{
            name: coinId,
            data: data
          }],
          chart: {
            ...apexChartsFontDefaults.chart,
            type: 'area' as const,
            height,
            sparkline: { enabled: true },
            animations: { enabled: true, speed: 800 },
            toolbar: { show: false },
            zoom: { enabled: false }
          },
          stroke: {
            width: 2,
            curve: 'smooth' as const
          },
          colors: [isPositive ? '#1DCC70' : '#FF396F'],
          fill: {
            type: 'gradient',
            gradient: {
              shade: 'light',
              type: 'vertical',
              shadeIntensity: 0.4,
              gradientToColors: [isPositive ? '#1DCC70' : '#FF396F'],
              inverseColors: false,
              opacityFrom: 0.8,
              opacityTo: 0.1,
              stops: [0, 90, 100]
            }
          },
          tooltip: {
            enabled: true,
            theme: 'dark',
            y: {
              formatter: (val: number) => {
                // Use the current price as a reference for formatting
                const referencePrice = currentPrice || val;
                
                // Format tooltip based on coin type and price range
                if (coinId === 'BTC' || referencePrice >= 1000) {
                  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                } else if (coinId === 'ETH' || referencePrice >= 100) {
                  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
                } else if (referencePrice >= 1) {
                  return `$${val.toFixed(3)}`;
                } else {
                  return `$${val.toFixed(6)}`;
                }
              }
            },
            x: {
              show: false
            }
          },
          dataLabels: { enabled: false },
          grid: { show: false },
          xaxis: {
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
          },
          yaxis: { labels: { show: false } }
        };

        chartInstanceRef.current = new ApexCharts(chartRef.current, options);
        await chartInstanceRef.current.render();
        setIsLoading(false);
      } catch (error) {
        console.error(`Failed to initialize chart for ${coinId}:`, error);
        setIsLoading(false);
      }
    };

    initChart();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [coinId, data, isPositive, height, currentPrice, symbol]);

  // Update chart when data changes
  useEffect(() => {
    if (chartInstanceRef.current && !isLoading) {
      try {
        chartInstanceRef.current.updateSeries([{
          name: coinId,
          data: data
        }]);
        
        chartInstanceRef.current.updateOptions({
          chart: apexChartsFontDefaults.chart,
          colors: [isPositive ? '#1DCC70' : '#FF396F'],
          fill: {
            gradient: {
              gradientToColors: [isPositive ? '#1DCC70' : '#FF396F']
            }
          }
        });
      } catch (error) {
        console.error(`Failed to update chart for ${coinId}:`, error);
      }
    }
  }, [data, isPositive, coinId, isLoading, currentPrice]);

  return (
    <div 
      ref={chartRef} 
      className={`chart ${isPositive ? 'chart-positive' : 'chart-negative'}`}
      style={{ height: `${height}px` }}
    />
  );
};
