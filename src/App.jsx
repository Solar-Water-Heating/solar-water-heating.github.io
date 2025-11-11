import { useState, useEffect } from 'react'
import './App.css'
import { ParametersPanel } from './components/ParametersPanel'
import { PlotPanel } from './components/PlotPanel'

// Section configurations with their default parameters
const SECTIONS = {
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
  },
  environment: {
    id: 'environment',
    title: 'Environmental Factors',
    parameters: {
      windSpeed: 5,
      windAngle: 0,
      altitude: 0,
    },
  },
}

// Default physics parameters
const DEFAULT_PARAMETERS = {
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
  const [activeSection, setActiveSection] = useState('motion')
  const [pendingUpdates, setPendingUpdates] = useState({
    motion: false,
    resistance: false,
    environment: false,
  })
  const [lastUpdatedSection, setLastUpdatedSection] = useState('motion')

  // Simulate physics and update plot data
  const simulateProjectileMotion = () => {
    const { initialVelocity, angle, gravity, mass, resistance, dragCoefficient, windSpeed, windAngle } = parameters

    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180
    let vx = initialVelocity * Math.cos(angleRad)
    let vy = initialVelocity * Math.sin(angleRad)

    // Add wind effect
    const windRadians = (windAngle * Math.PI) / 180
    vx += windSpeed * Math.cos(windRadians) * 0.1

    // Calculate trajectory with air resistance approximation
    const dt = 0.01 // time step
    const maxTime = (2 * vy) / gravity // approximate total flight time
    const steps = Math.ceil(maxTime / dt)

    const trajectoryData = []
    let currentVx = vx
    let currentVy = vy
    let x = 0
    let y = 0

    for (let i = 0; i <= steps; i++) {
      if (y < 0) break

      trajectoryData.push({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(Math.max(0, y).toFixed(2)),
      })

      // Apply air resistance based on drag coefficient
      const dragFactor = 1 - ((resistance / 1000) * (dragCoefficient / 0.5))
      currentVx *= dragFactor
      currentVy *= dragFactor

      // Update velocity and position
      currentVy -= gravity * dt
      x += currentVx * dt
      y += currentVy * dt
    }

    return [
      {
        id: 'Projectile Motion',
        color: 'hsl(210, 100%, 50%)',
        data: trajectoryData,
      },
    ]
  }

  // Update plot when parameters for the last updated section change
  useEffect(() => {
    const newData = simulateProjectileMotion()
    setPlotData(newData)
  }, [parameters])

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
    // Display the plot for the selected section
    setLastUpdatedSection(sectionId)
  }

  const handleReset = () => {
    setParameters(DEFAULT_PARAMETERS)
    setPendingUpdates({
      motion: false,
      resistance: false,
      environment: false,
    })
  }

  // Get axis titles based on the last updated section
  const getAxisTitles = () => {
    const titles = {
      motion: { x: 'Distance (m)', y: 'Height (m)', title: 'Projectile Motion Trajectory' },
      resistance: { x: 'Distance (m)', y: 'Height (m)', title: 'Trajectory with Drag Coefficient' },
      environment: { x: 'Distance (m)', y: 'Height (m)', title: 'Environmental Effect on Trajectory' },
    }
    return titles[lastUpdatedSection] || titles.motion
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Parameters Panel - 1/4 width */}
          <div className="lg:col-span-1">
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
            />
          </div>

          {/* Plot Panel - 3/4 width */}
          <div className="lg:col-span-3">
            <PlotPanel
              data={plotData}
              title={axisConfig.title}
              xAxisLabel={axisConfig.x}
              yAxisLabel={axisConfig.y}
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
