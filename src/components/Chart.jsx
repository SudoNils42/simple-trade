import { useEffect, useRef } from 'react'
import { createChart, AreaSeries } from 'lightweight-charts'

export function Chart({ data, color = '#30d158', currentPrice }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const priceLineRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    container.innerHTML = ''

    const getPrecision = (values) => {
      if (!values || values.length === 0) return 2
      const maxVal = Math.max(...values.map(v => Math.abs(v.value)))
      if (maxVal < 0.01) return 6
      if (maxVal < 0.1) return 5
      if (maxVal < 1) return 4
      if (maxVal < 10) return 3
      return 2
    }

    const precision = data && data.length > 0 ? getPrecision(data) : 2

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#888',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { 
        borderVisible: false,
        autoScale: true,
        minimumWidth: 60,
      },
      timeScale: { borderVisible: false, visible: false },
      handleScroll: false,
      handleScale: false,
      watermark: {
        visible: false,
      },
      crosshair: {
        mode: 0,
        vertLine: {
          visible: false,
        },
        horzLine: {
          visible: false,
        },
      },
      localization: {
        priceFormatter: (price) => {
          return price.toFixed(precision)
        },
      },
    })

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: color + '40',
      bottomColor: 'transparent',
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    })

    if (data && data.length > 0) {
      const sorted = [...data].sort((a, b) => a.time - b.time)
      areaSeries.setData(sorted)
      chart.timeScale().fitContent()
    }

    chartRef.current = chart
    seriesRef.current = areaSeries

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      priceLineRef.current = null
    }
  }, [data, color])

  useEffect(() => {
    if (!seriesRef.current || !currentPrice || currentPrice === 0) return
    
    if (priceLineRef.current) {
      seriesRef.current.removePriceLine(priceLineRef.current)
    }
    
    priceLineRef.current = seriesRef.current.createPriceLine({
      price: currentPrice,
      color: color,
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: '',
    })
  }, [currentPrice, color])

  return <div ref={containerRef} className="w-full h-full" />
}
