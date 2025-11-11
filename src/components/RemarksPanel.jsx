import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import ReactMarkdown from 'react-markdown'

// Documentation for each section from simulations.js
const SECTION_DOCUMENTATION = {
  simulationParameters: {
    title: 'Simulation Parameters',
    markdown: `## Simulation Parameters

Global parameters that affect all simulations in the system.

### Description
These are the ambient and baseline parameters used across all simulations. They define the overall environmental conditions and base settings for the physics calculations.

### Key Parameters
- **Ambient Temperature**: Surrounding air temperature (°C) used for calculating heat loss from panel and tank to environment
- **Mass Flow Rate**: Rate of fluid circulation through the solar panel (kg/s). Higher flow rates increase heat transfer but require more pump power
    `,
  },
  solarIrradiance: {
    title: 'Solar Irradiance',
    markdown: `## Solar Irradiance

### Description
Calculate solar irradiance at a given time during the day.

The solar irradiance is modeled as a cosine curve that peaks at a specified hour during the day, representing the typical daily solar radiation pattern.

### Model
- **Time Range**: Irradiance is non-zero between \`irradianceStartHour\` and \`irradianceEndHour\` (e.g., 6 AM to 6 PM)
- **Peak Hour**: Solar radiation reaches maximum at \`irradiancePeakHour\` (typically solar noon at 12 PM)
- **Peak Value**: Maximum solar radiation intensity in W/m² at peak hour. Standard value: 1000 W/m² at sea level on a clear day

### Formula
\\[
\\text{irradiance} = \\text{solarIrradiancePeak} \\times \\cos\\left((\\text{fraction} - \\text{peakFraction}) \\times \\pi\\right)
\\]

where:
- \`fraction\` = (t - startHour) / (endHour - startHour)
- \`peakFraction\` = (peakHour - startHour) / (endHour - startHour)
- Result is clamped to ≥ 0 (no negative irradiance)

### Physical Basis
This cosine profile approximates real solar radiation patterns, accounting for the sun's position in the sky throughout the day.
    `,
  },
  solarPanel: {
    title: 'Solar Panel',
    markdown: `## Solar Panel

### Description
Model solar panel performance including temperature-dependent efficiency, heat collection, and thermal losses.

### Key Concepts

#### Panel Efficiency (Temperature-Dependent)
Efficiency decreases as panel temperature increases due to thermal effects.

**Formula:**
\\[
\\text{efficiency} = \\text{efficiencyRef} \\times \\left(1 - \\text{tempCoeff} \\times (T_{\\text{panel}} - T_{\\text{ref}})\\right)
\\]

- **Reference Efficiency**: Efficiency at standard test conditions (25°C). Typical solar panels: 15-22%
- **Temperature Coefficient**: Typical value -0.4% per °C (represented as 0.004 fraction per °C)
- **Clamping**: Efficiency is bounded between 10% and the reference efficiency

#### Panel Temperature at Equilibrium
At steady state, solar energy absorbed equals heat loss to the environment.

**Formula:**
\\[
\\text{irradiance} \\times A \\times \\text{efficiency}(T) = U \\times A \\times (T - T_{\\text{ambient}})
\\]

Solving iteratively for panel temperature:
\\[
T_{\\text{panel}} = T_{\\text{ambient}} + \\frac{\\text{solarCollected}}{U \\times A}
\\]

#### Heat Output
Net heat collected by the panel (used to heat the storage tank):

\\[
Q_{\\text{panel}} = \\text{irradiance} \\times A \\times \\text{efficiency}(T_{\\text{panel}})
\\]

### Parameters
- **Panel Area** (m²): Total surface area of the solar panel
- **Panel U-Value** (W/m²·K): Heat transfer coefficient representing thermal resistance
- **Reference Temperature** (°C): Standard test condition baseline (25°C)
- **Temperature Coefficient** (%/°C): Efficiency loss per degree above reference

### Graphs
- **Panel Temperature**: How temperature varies throughout the day
- **Panel Efficiency**: Temperature-dependent efficiency profile
- **Heat Output**: Actual thermal power collected (W)
    `,
  },
  storageTank: {
    title: 'Storage Tank',
    markdown: `## Storage Tank

### Description
Simulate storage tank temperature profile over 24 hours with full energy balance, accounting for:
- Time-varying solar input from the panel
- Dynamic heat loss to the environment
- Thermal mass of water storage

### Energy Balance Model

The tank temperature changes based on net energy flow:

**Energy Balance Equation:**
\\[
m \\times c_p \\times \\frac{dT}{dt} = Q_{\\text{in}} - Q_{\\text{loss}}
\\]

where:
- \`m\` = tank mass (kg) ≈ tank volume (L) × 1 kg/L
- \`c_p\` = specific heat of water = 4186 J/(kg·K)
- \`Q_in\` = heat power from solar panel (W)
- \`Q_loss\` = heat loss to environment (W)

**Heat Loss Calculation:**
\\[
Q_{\\text{loss}} = U \\times A \\times (T_{\\text{tank}} - T_{\\text{ambient}})
\\]

### Simulation Method
- **Time Step**: 10 seconds for numerical accuracy
- **Sampling Interval**: Data collected every hour for clean visualization
- **Duration**: Full 24-hour cycle
- **Minimum Temperature**: Tank never cools below ambient temperature

### Parameters
- **Tank Volume** (L): Larger tanks store more energy but have more surface area for heat loss
- **Initial Temperature** (°C): Starting tank temperature (typically ambient)
- **Surface Area** (m²): Exposed surface area (affects heat loss rate)
- **U-Value** (W/m²·K): Insulation quality (lower = better insulation)

### Key Outputs
- **Tank Temperature**: How storage temperature evolves over 24 hours
- **Heat In**: Solar heat power entering the tank
- **Heat Loss**: Heat power lost to environment
- **Ambient Temperature**: Reference baseline

### Physical Insights
- Tank heats up when solar input exceeds heat loss (day hours)
- Tank cools toward ambient when solar input stops (night hours)
- Better insulation (lower U-value) reduces heat loss and maintains temperature longer
- Larger tanks have slower temperature changes due to greater thermal mass
    `,
  },
}

export const RemarksPanel = ({ activeSection }) => {
  const sectionDoc = SECTION_DOCUMENTATION[activeSection]

  if (!sectionDoc) {
  return (
    <Card className="h-full flex flex-col min-h-0 bg-slate-900 border-slate-700">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-white">Remarks</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-2 pt-0">
          <p className="text-white">Select a section to view remarks</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col min-h-0 bg-slate-900 border-slate-700">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-white">Remarks: {sectionDoc.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-2 pt-0 overflow-y-auto prose prose-invert max-w-none">
        <div className="text-sm text-white space-y-2">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-white mt-3 mb-1" {...props} />,
              p: ({ node, ...props }) => <p className="text-white mb-2 leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2 text-white" {...props} />,
              li: ({ node, ...props }) => <li className="text-white" {...props} />,
              strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className="bg-slate-700 px-2 py-1 rounded text-slate-100 font-mono text-xs" {...props} />
                ) : (
                  <code className="bg-slate-700 px-2 py-1 rounded text-slate-100 font-mono text-xs block whitespace-pre-wrap" {...props} />
                ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-2" {...props} />
              ),
            }}
          >
            {sectionDoc.markdown}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}

