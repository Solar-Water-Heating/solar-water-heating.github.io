import { useState, useEffect } from 'react'
import './App.css'
import { ParametersPanel } from './components/ParametersPanel'
import { PlotPanel } from './components/PlotPanel'
import {
  calculateSolarIrradiance,
  calculatePanelEfficiency,
  calculatePanelTemperature,
  simulateSolarIrradiance,
  simulateSolarPanel,
  simulateStorageTank,
  simulateProjectileMotion,
} from './lib/simulations'

// Section configurations with their default parameters
const SECTIONS = {
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
      panelUValue: 5.0,
    },
    dependencies: ['solarIrradiance'],
  },
  storageTank: {
    id: 'storageTank',
    title: 'Storage Tank',
    parameters: {
      tankVolume: 200,
      initialTankTemp: 20.0,
      tankSurfaceArea: 2.0,
      tankInsulationUValue: 0.5,
      massFlowRate: 0.05,
      ambientTemp: 20.0,
    },
    dependencies: ['solarPanel'],
  },
  motion: {
    id: 'motion',
    title: 'Projectile Motion',
    parameters: {
      initialVelocity: 20,
      angle: 45,
      gravity: 9.81,
    },
  },
  resistance: {
    id: 'resistance',
    title: 'Air Resistance',
    parameters: {
      mass: 1,
      resistance: 0.1,
      dragCoefficient: 0.5,
    },
    dependencies: ['motion'],
  },
  environment: {
    id: 'environment',
    title: 'Environmental Factors',
    parameters: {
      windSpeed: 5,
      windAngle: 0,
      altitude: 0,
    },
    dependencies: ['motion'],
  },
}

// Parameter descriptions and metadata
const PARAMETER_DESCRIPTIONS = {
  irradianceStartHour: {
    label: 'Start Hour',
    description: 'Hour of day when solar irradiance becomes non-zero (sunrise). Typical: 6 AM.',
  },
  irradianceEndHour: {
    label: 'End Hour',
    description: 'Hour of day when solar irradiance becomes zero (sunset). Typical: 6 PM.',
  },
  irradiancePeakHour: {
    label: 'Peak Hour',
    description: 'Hour of day at which solar irradiance reaches maximum (solar noon). Typical: 12 PM.',
  },
  solarIrradiancePeak: {
    label: 'Peak Solar Irradiance',
    description: 'Maximum solar radiation intensity in W/m² during peak daylight. Standard value: 1000 W/m² at sea level on clear day.',
  },
  panelArea: {
    label: 'Panel Area',
    description: 'Total surface area of the solar panel in square meters. Larger area increases energy collection capacity.',
  },
  panelEfficiencyRef: {
    label: 'Panel Efficiency',
    description: 'Reference efficiency at standard test conditions (25°C). Typical solar panels: 15-22%. Higher efficiency means better energy conversion.',
  },
  panelMaxTemp: {
    label: 'Max Panel Temp',
    description: 'Maximum safe operating temperature for the panel in °C. Efficiency decreases as temperature increases due to thermal effects.',
  },
  panelUValue: {
    label: 'Panel U-Value',
    description: 'Heat transfer coefficient for the panel surface in W/(m²*K). Represents panel thermal resistance and heat loss rate to environment.',
  },
  tankVolume: {
    label: 'Tank Volume',
    description: 'Total volume of the storage tank in liters. Larger tanks store more thermal energy but have more surface area for heat loss.',
  },
  initialTankTemp: {
    label: 'Initial Tank Temp',
    description: 'Starting temperature of the storage tank in °C. Typically matches ambient temperature at startup.',
  },
  tankSurfaceArea: {
    label: 'Tank Surface Area',
    description: 'Exposed surface area of the storage tank in m². Used to calculate heat loss to environment.',
  },
  tankInsulationUValue: {
    label: 'Tank U-Value',
    description: 'Overall heat transfer coefficient for the tank insulation in W/(m²*K). Lower values indicate better insulation (less heat loss).',
  },
  massFlowRate: {
    label: 'Mass Flow Rate',
    description: 'Rate of fluid circulation through the solar panel in kg/s. Higher flow rates increase heat transfer but require more pump power.',
  },
  ambientTemp: {
    label: 'Ambient Temperature',
    description: 'Surrounding air temperature in °C. Used for calculating heat loss from panel and tank to environment.',
  },
  initialVelocity: {
    label: 'Initial Velocity',
    description: 'Launch velocity of the projectile in m/s. Affects range and height of trajectory.',
  },
  angle: {
    label: 'Launch Angle',
    description: 'Angle of launch in degrees (0-90). 45° provides maximum range in ideal conditions.',
  },
  gravity: {
    label: 'Gravity',
    description: 'Gravitational acceleration in m/s². Earth: 9.81 m/s², Moon: 1.62 m/s².',
  },
  mass: {
    label: 'Mass',
    description: 'Mass of the projectile in kg. Affects drag force impact on trajectory.',
  },
  resistance: {
    label: 'Air Resistance',
    description: 'Air resistance coefficient. Higher values increase drag effect on trajectory.',
  },
  dragCoefficient: {
    label: 'Drag Coefficient',
    description: 'Dimensionless drag coefficient (Cd). Sphere: ~0.47, Streamlined: ~0.04. Affects air resistance.',
  },
  windSpeed: {
    label: 'Wind Speed',
    description: 'Wind speed in m/s. Affects projectile trajectory by applying lateral force.',
  },
  windAngle: {
    label: 'Wind Angle',
    description: 'Wind direction in degrees. 0° = head-on, 90° = perpendicular, 180° = tailwind.',
  },
  altitude: {
    label: 'Altitude',
    description: 'Launch altitude in meters above sea level. Higher altitude reduces air density and drag.',
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
  panelUValue: 5.0,
  tankVolume: 200,
  initialTankTemp: 20.0,
  tankSurfaceArea: 2.0,
  tankInsulationUValue: 0.5,
  massFlowRate: 0.05,
  ambientTemp: 20.0,
  initialVelocity: 20,
  angle: 45,
  gravity: 9.81,
  mass: 1,
  resistance: 0.1,
  dragCoefficient: 0.5,
  windSpeed: 5,
  windAngle: 0,
  altitude: 0,
}

function App() {
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS)
  const [plotData, setPlotData] = useState([])
  const [activeSection, setActiveSection] = useState('solarIrradiance')
  const [pendingUpdates, setPendingUpdates] = useState({
    solarIrradiance: false,
    solarPanel: false,
    storageTank: false,
    motion: false,
    resistance: false,
    environment: false,
  })
  const [lastUpdatedSection, setLastUpdatedSection] = useState('solarIrradiance')


  // Update plot when parameters for the last updated section change
  useEffect(() => {
    let newData
    if (lastUpdatedSection === 'solarIrradiance') {
      newData = simulateSolarIrradiance(parameters)
    } else if (lastUpdatedSection === 'solarPanel') {
      newData = simulateSolarPanel(parameters)
    } else if (lastUpdatedSection === 'storageTank') {
      newData = simulateStorageTank(parameters)
    } else {
      newData = simulateProjectileMotion(parameters)
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
      solarIrradiance: false,
      solarPanel: false,
      storageTank: false,
      motion: false,
      resistance: false,
      environment: false,
    })
  }

  // Get axis titles based on the last updated section
  const getAxisTitles = () => {
    const titles = {
      solarIrradiance: { x: 'Time (hours)', y: 'Solar Irradiance (W/m²)', title: 'Solar Irradiance Profile' },
      solarPanel: { x: 'Time (hours)', y: 'Value', title: 'Solar Panel Performance (Temperature, Efficiency, Heat Output)' },
      storageTank: { x: 'Time (hours)', y: 'Value', title: 'Storage Tank Performance (Energy Balance and Temperature)' },
      motion: { x: 'Distance (m)', y: 'Height (m)', title: 'Projectile Motion Trajectory' },
      resistance: { x: 'Distance (m)', y: 'Height (m)', title: 'Trajectory with Drag Coefficient' },
      environment: { x: 'Distance (m)', y: 'Height (m)', title: 'Environmental Effect on Trajectory' },
    }
    return titles[lastUpdatedSection] || titles.solarIrradiance
  }

  const axisConfig = getAxisTitles()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Physics Simulator</h1>
          <p className="text-slate-300">Projectile Motion Simulator with Interactive Parameters</p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)] min-h-0">
          {/* Parameters Panel - 1/4 width */}
          <div className="lg:col-span-1 min-h-0 flex flex-col">
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

          {/* Plot Panel - 3/4 width */}
          <div className="lg:col-span-3 min-h-0 flex flex-col">
            <PlotPanel
              data={plotData}
              title={axisConfig.title}
              xAxisLabel={axisConfig.x}
              yAxisLabel={axisConfig.y}
              subplots={lastUpdatedSection === 'solarPanel' || lastUpdatedSection === 'storageTank'}
            />
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
