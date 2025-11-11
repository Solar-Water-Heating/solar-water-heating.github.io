import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { ResponsiveLine } from '@nivo/line'

export const PlotPanel = ({ data, title = "Simulation Results", xAxisLabel = "Time", yAxisLabel = "Value" }) => {
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveLine
          data={displayData}
          margin={{ top: 10, right: 110, bottom: 40, left: 60 }}
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
      </CardContent>
    </Card>
  )
}

