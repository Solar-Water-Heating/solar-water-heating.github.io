import { useState, useEffect } from 'react'
import './App.css'
import { ParametersPanel } from './components/ParametersPanel'
import { PlotPanel } from './components/PlotPanel'
import { RemarksPanel } from './components/RemarksPanel'
import {
  calculateSolarIrradiance,
  calculatePanelEfficiency,
  calculatePanelTemperature,
  simulateSolarIrradiance,
  simulateSolarPanel,
  simulateStorageTank,
} from './lib/simulations'

// Section configurations with their default parameters
const SECTIONS = {
  simulationParameters: {
    id: 'simulationParameters',
    title: 'Simulation Parameters',
    parameters: {
      ambientTemp: 20.0,
      massFlowRate: 0.05,
    },
  },
  solarIrradiance: {
    id: 'solarIrradiance',
    title: 'Solar Irradiance',
    parameters: {
      irradianceStartHour: 6.0,
      irradianceEndHour: 18.0,
      irradiancePeakHour: 12.0,
      solarIrradiancePeak: 800,
    },
  },
  solarPanel: {
    id: 'solarPanel',
    title: 'Solar Panel',
    parameters: {
      panelArea: 2.0,
      panelEfficiencyRef: 0.70,
      panelMaxTemp: 80.0,
      panelUValue: 10.0,
      panelRefTemp: 25.0,
      panelTempCoefficient: 0.004,
    },
    dependencies: ['solarIrradiance', 'simulationParameters'],
  },
  storageTank: {
    id: 'storageTank',
    title: 'Storage Tank',
    parameters: {
      tankVolume: 200,
      initialTankTemp: 20.0,
      tankSurfaceArea: 2.0,
      tankInsulationUValue: 0.5,
    },
    dependencies: ['solarPanel', 'simulationParameters'],
  },
}

// Parameter descriptions and metadata
const PARAMETER_DESCRIPTIONS = {
  irradianceStartHour: {
    label: 'Start Hour (h)',
    description: 'Hour of day when solar irradiance becomes non-zero (sunrise). Typical: 6 AM.',
  },
  irradianceEndHour: {
    label: 'End Hour (h)',
    description: 'Hour of day when solar irradiance becomes zero (sunset). Typical: 6 PM.',
  },
  irradiancePeakHour: {
    label: 'Peak Hour (h)',
    description: 'Hour of day at which solar irradiance reaches maximum (solar noon). Typical: 12 PM.',
  },
  solarIrradiancePeak: {
    label: 'Peak Solar Irradiance (W/m²)',
    description: 'Maximum solar radiation intensity in W/m² during peak daylight. Standard value: 1000 W/m² at sea level on clear day.',
  },
  panelArea: {
    label: 'Panel Area (m²)',
    description: 'Total surface area of the solar panel in square meters. Larger area increases energy collection capacity.',
  },
  panelEfficiencyRef: {
    label: 'Panel Efficiency (%)',
    description: 'Reference efficiency at standard test conditions (25°C). Typical solar panels: 15-22%. Higher efficiency means better energy conversion.',
  },
  panelMaxTemp: {
    label: 'Max Panel Temp (°C)',
    description: 'Maximum safe operating temperature for the panel in °C. Efficiency decreases as temperature increases due to thermal effects.',
  },
  panelUValue: {
    label: 'Panel U-Value (W/m²·K)',
    description: 'Heat transfer coefficient for the panel surface in W/(m²*K). Represents panel thermal resistance and heat loss rate to environment.',
  },
  panelRefTemp: {
    label: 'Reference Temp (°C)',
    description: 'Reference temperature for efficiency rating in °C. Standard test condition is 25°C. Used as baseline for temperature coefficient calculations.',
  },
  panelTempCoefficient: {
    label: 'Temp Coefficient (%/°C)',
    description: 'Temperature coefficient for efficiency loss as a decimal. Typical value: 0.004 (-0.4% per °C). Efficiency decreases linearly with temperature above reference.',
  },
  tankVolume: {
    label: 'Tank Volume (L)',
    description: 'Total volume of the storage tank in liters. Larger tanks store more thermal energy but have more surface area for heat loss.',
  },
  initialTankTemp: {
    label: 'Initial Tank Temp (°C)',
    description: 'Starting temperature of the storage tank in °C. Typically matches ambient temperature at startup.',
  },
  tankSurfaceArea: {
    label: 'Tank Surface Area (m²)',
    description: 'Exposed surface area of the storage tank in m². Used to calculate heat loss to environment.',
  },
  tankInsulationUValue: {
    label: 'Tank U-Value (W/m²·K)',
    description: 'Overall heat transfer coefficient for the tank insulation in W/(m²*K). Lower values indicate better insulation (less heat loss).',
  },
  massFlowRate: {
    label: 'Mass Flow Rate (kg/s)',
    description: 'Rate of fluid circulation through the solar panel in kg/s. Higher flow rates increase heat transfer but require more pump power.',
  },
  ambientTemp: {
    label: 'Ambient Temperature (°C)',
    description: 'Surrounding air temperature in °C. Used for calculating heat loss from panel and tank to environment.',
  },
}

// Default physics parameters
const DEFAULT_PARAMETERS = {
  irradianceStartHour: 6.0,
  irradianceEndHour: 18.0,
  irradiancePeakHour: 12.0,
  solarIrradiancePeak: 800,
  panelArea: 2.0,
  panelEfficiencyRef: 0.70,
  panelMaxTemp: 80.0,
  panelUValue: 10.0,
  panelRefTemp: 25.0,
  panelTempCoefficient: 0.004,
  tankVolume: 200,
  initialTankTemp: 20.0,
  tankSurfaceArea: 2.0,
  tankInsulationUValue: 0.5,
  massFlowRate: 0.05,
  ambientTemp: 20.0,
}

function App() {
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS)
  const [plotData, setPlotData] = useState([])
  const [activeSection, setActiveSection] = useState('simulationParameters')
  const [pendingUpdates, setPendingUpdates] = useState({
    simulationParameters: false,
    solarIrradiance: false,
    solarPanel: false,
    storageTank: false,
  })
  const [lastUpdatedSection, setLastUpdatedSection] = useState('simulationParameters')


  // Update plot when parameters for the last updated section change
  useEffect(() => {
    let newData
    if (lastUpdatedSection === 'solarIrradiance') {
      newData = simulateSolarIrradiance(parameters)
    } else if (lastUpdatedSection === 'solarPanel') {
      newData = simulateSolarPanel(parameters)
    } else if (lastUpdatedSection === 'storageTank') {
      newData = simulateStorageTank(parameters)
    } else if (lastUpdatedSection === 'simulationParameters') {
      // Simulation Parameters don't have their own plot, show the first available
      newData = simulateSolarIrradiance(parameters)
    }
    setPlotData(newData)
  }, [parameters, lastUpdatedSection])

  const handleParameterChange = (key, value) => {
    setParameters({
      ...parameters,
      [key]: parseFloat(value) || 0,
    })
    // Mark the section that contains this parameter as having pending updates
    Object.entries(SECTIONS).forEach(([sectionId, section]) => {
      if (section.parameters.hasOwnProperty(key)) {
        setPendingUpdates({
          ...pendingUpdates,
          [sectionId]: true,
        })
      }
    })
  }

  const handleUpdate = (sectionId) => {
    setLastUpdatedSection(sectionId)
    setPendingUpdates({
      ...pendingUpdates,
      [sectionId]: false,
    })
  }

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
    // Display the plot for the selected section only if opening a section
    if (sectionId) {
      setLastUpdatedSection(sectionId)
    }
  }

  const handleReset = () => {
    setParameters(DEFAULT_PARAMETERS)
    setPendingUpdates({
      simulationParameters: false,
      solarIrradiance: false,
      solarPanel: false,
      storageTank: false,
    })
  }

  // Get axis titles based on the last updated section
  const getAxisTitles = () => {
    const titles = {
      simulationParameters: { x: 'Time (hours)', y: 'Solar Irradiance (W/m²)', title: 'Solar Irradiance Profile' },
      solarIrradiance: { x: 'Time (hours)', y: 'Solar Irradiance (W/m²)', title: 'Solar Irradiance Profile' },
      solarPanel: { x: 'Time (hours)', y: 'Value', title: 'Solar Panel Performance (Temperature, Efficiency, Heat Output)' },
      storageTank: { x: 'Time (hours)', y: 'Value', title: 'Storage Tank Performance (Energy Balance and Temperature)' },
    }
    return titles[lastUpdatedSection] || titles.solarIrradiance
  }

  const axisConfig = getAxisTitles()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-6">
      <div className="mx-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Physics Simulator</h1>
          <p className="text-slate-300">Projectile Motion Simulator with Interactive Parameters</p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 h-[calc(100vh-200px)] min-h-0">
          {/* Parameters Panel - 20% width */}
          <div className="lg:col-span-2 min-h-0 flex flex-col">
            <ParametersPanel
              sections={SECTIONS}
              parameters={parameters}
              onParameterChange={handleParameterChange}
              onUpdate={handleUpdate}
              onReset={handleReset}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              pendingUpdates={pendingUpdates}
              defaultParameters={DEFAULT_PARAMETERS}
              parameterDescriptions={PARAMETER_DESCRIPTIONS}
            />
          </div>

          {/* Plot Panel - 60% width */}
          <div className="lg:col-span-6 min-h-0 flex flex-col">
            <PlotPanel
              data={plotData}
              title={axisConfig.title}
              xAxisLabel={axisConfig.x}
              yAxisLabel={axisConfig.y}
              subplots={lastUpdatedSection === 'solarPanel' || lastUpdatedSection === 'storageTank'}
            />
          </div>

          {/* Remarks Panel - 20% width */}
          <div className="lg:col-span-2 min-h-0 flex flex-col">
            <RemarksPanel activeSection={activeSection} />
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-300">
            💡 <strong>Tip:</strong> Adjust parameters in each section and click "Update" to see changes. The plot title and axes will update based on the section you modify.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
