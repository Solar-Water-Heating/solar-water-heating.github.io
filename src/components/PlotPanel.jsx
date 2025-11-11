import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { ResponsiveLine } from '@nivo/line'

const ChartComponent = ({ series, xAxisLabel, yAxisLabel, chartLabel }) => {
  // Handle both single series and array of series
  const dataArray = Array.isArray(series) ? series : [series]
  const titleLabel = chartLabel || (Array.isArray(series) ? series.map(s => s.id).join(' & ') : series.id)

  return (
    <ResponsiveLine
      data={dataArray}
      margin={{ top: 10, right: 50, bottom: 50, left: 60 }}
      xScale={{ type: 'linear' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: xAxisLabel,
        legendOffset: 36,
        legendPosition: 'middle',
      }}
      axisLeft={{
        orient: 'left',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: titleLabel,
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      lineWidth={3}
      pointSize={6}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: 'top-right',
          direction: 'column',
          justify: false,
          translateX: 0,
          translateY: 0,
          itemsSpacing: 5,
          itemDirection: 'left-to-right',
          itemWidth: 150,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      theme={{
        text: {
          fontSize: 12,
          fill: 'hsl(var(--foreground))',
        },
        axis: {
          domain: {
            line: {
              stroke: 'hsl(var(--border))',
            },
          },
          ticks: {
            line: {
              stroke: 'hsl(var(--border))',
              strokeWidth: 1,
            },
            text: {
              fill: 'hsl(var(--muted-foreground))',
            },
          },
          legend: {
            text: {
              fill: 'hsl(var(--foreground))',
            },
          },
        },
        grid: {
          line: {
            stroke: 'hsl(var(--border))',
            strokeWidth: 0.5,
          },
        },
      }}
      layers={[
        'grid',
        'markers',
        'axes',
        'areas',
        ({ points, xScale, yScale, series: seriesData }) => {
          return (
            <g>
              {seriesData.map((seriesItem) => {
                const hasPoints = points.filter(p => p.seriesId === seriesItem.id)
                const seriesDef = dataArray.find(s => s.id === seriesItem.id)
                
                if (hasPoints.length < 2 || !seriesDef?.dashed) {
                  return null
                }

                return (
                  <g key={seriesItem.id}>
                    {hasPoints.map((point, i) => {
                      if (i === 0) return null
                      const prev = hasPoints[i - 1]
                      return (
                        <line
                          key={`${seriesItem.id}-${i}`}
                          x1={prev.x}
                          y1={prev.y}
                          x2={point.x}
                          y2={point.y}
                          stroke={point.color}
                          strokeWidth={3}
                          strokeDasharray="5,5"
                          fill="none"
                          pointerEvents="none"
                        />
                      )
                    })}
                  </g>
                )
              })}
            </g>
          )
        },
        'lines',
        'slices',
        'points',
        'mesh',
        'legends',
      ]}
    />
  )
}

export const PlotPanel = ({ data, title = "Simulation Results", xAxisLabel = "Time (hours)", yAxisLabel = "Value", subplots = false }) => {
  // Default data if none provided
  const displayData = data && data.length > 0 ? data : [
    {
      id: "Simulation",
      color: "hsl(210, 100%, 50%)",
      data: [
        { x: 0, y: 0 },
        { x: 1, y: 10 },
        { x: 2, y: 25 },
        { x: 3, y: 20 },
        { x: 4, y: 35 },
        { x: 5, y: 40 },
        { x: 6, y: 50 },
        { x: 7, y: 48 },
        { x: 8, y: 60 },
        { x: 9, y: 65 },
        { x: 10, y: 70 },
      ],
    },
  ]

  if (subplots && displayData.length > 1) {
    // Group series: handle both solar panel and storage tank layouts
    let subplotGroups
    let subplotLabels = []
    
    // Check if it's a Storage Tank plot (Heat In, Heat Loss, Tank Temp, Ambient Temp)
    const isStorageTank = displayData.some(s => s.id.includes('Heat In')) || displayData.some(s => s.id.includes('Heat Loss'))
    
    if (isStorageTank) {
      // Storage Tank layout: Energy Balance (Heat In + Heat Loss + Net Energy), Tank Temperature (Tank Temp + Ambient Temp)
      const heatInSeries = displayData.find(s => s.id.includes('Heat In'))
      const heatLossSeries = displayData.find(s => s.id.includes('Heat Loss'))
      const tankTempSeries = displayData.find(s => s.id.includes('Tank Temperature'))
      const ambientTempSeries = displayData.find(s => s.id.includes('Ambient Temperature'))
      
      // Create a copy of series to avoid mutating original data
      const energyBalanceGroup = [
        heatInSeries && { ...heatInSeries },
        heatLossSeries && { ...heatLossSeries },
      ].filter(Boolean)
      
      const tankTempGroup = [
        tankTempSeries && { ...tankTempSeries },
        ambientTempSeries && { ...ambientTempSeries }
      ].filter(Boolean)
      
      subplotGroups = [energyBalanceGroup, tankTempGroup].filter(group => group.length > 0)
      subplotLabels = ['Energy Balance', 'Tank Temperature']
    } else {
      // Solar Panel layout: combine first two if the second is dashed (Ambient Temperature)
      const hasAmbientTemp = displayData.length > 1 && displayData[1]?.dashed
      subplotGroups = hasAmbientTemp 
        ? [
            [displayData[0], displayData[1]], // Panel Temp + Ambient Temp
            [displayData[2]], // Efficiency
            ...(displayData[3] ? [[displayData[3]]] : []), // Heat Output
          ]
        : displayData.map(s => [s])
      subplotLabels = hasAmbientTemp
        ? ['Panel Temperature', 'Efficiency', ...(displayData[3] ? ['Heat Output'] : [])]
        : displayData.map(s => s.id)
    }
    
    const totalHeight = subplotGroups.length * 320

    return (
      <Card className="h-full flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-2 pt-0 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2 w-full" style={{ minHeight: `${totalHeight}px` }}>
            {subplotGroups.map((group, idx) => (
              <div key={idx} className="w-full" style={{ height: '300px' }}>
                <ChartComponent 
                  series={group} 
                  xAxisLabel={xAxisLabel} 
                  yAxisLabel={yAxisLabel}
                  chartLabel={subplotLabels[idx]}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="flex-shrink-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-2 pt-0">
        <div className="w-full h-full">
          <ResponsiveLine
            data={displayData}
            margin={{ top: 10, right: 130, bottom: 60, left: 60 }}
            xScale={{ type: 'linear' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.2f"
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              orient: 'bottom',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: xAxisLabel,
              legendOffset: 36,
              legendPosition: 'middle',
            }}
            axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: yAxisLabel,
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            lineWidth={3}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
            theme={{
              text: {
                fontSize: 12,
                fill: 'hsl(var(--foreground))',
              },
              axis: {
                domain: {
                  line: {
                    stroke: 'hsl(var(--border))',
                  },
                },
                ticks: {
                  line: {
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1,
                  },
                  text: {
                    fill: 'hsl(var(--muted-foreground))',
                  },
                },
                legend: {
                  text: {
                    fill: 'hsl(var(--foreground))',
                  },
                },
              },
              grid: {
                line: {
                  stroke: 'hsl(var(--border))',
                  strokeWidth: 0.5,
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

