/**
 * Storage Tank Calculations
 * Functions for tank heat loss and temperature simulation
 */

import { calculatePanelOutput } from './panel.js'

/**
 * Calculate heat loss from storage tank to environment
 * Q_loss = U * A * ΔT
 * 
 * @param {number} tankTemp - Tank temperature in °C
 * @param {number} ambientTemp - Ambient temperature in °C
 * @param {number} surfaceArea - Tank surface area in m²
 * @param {number} uValue - Heat transfer coefficient in W/(m²*K)
 * @returns {number} Heat loss power in Watts
 */
export const calculateTankHeatLoss = (tankTemp, ambientTemp, surfaceArea, uValue) => {
  const deltaT = tankTemp - ambientTemp
  const heatLoss = uValue * surfaceArea * deltaT
  return Math.max(0, heatLoss)
}

/**
 * Simulate storage tank temperature profile over 24 hours
 * Implements full energy balance with time-varying solar input and dynamic heat loss
 * 
 * @param {object} parameters - All simulation parameters
 * @returns {array} Array of plot data series
 */
export const simulateStorageTank = (parameters) => {
  const {
    tankVolume,
    initialTankTemp,
    tankSurfaceArea,
    tankInsulationUValue,
    ambientTemp,
    panelArea,
    panelEfficiencyRef,
    panelUValue,
    panelRefTemp,
    panelTempCoefficient,
    irradianceStartHour,
    irradianceEndHour,
    irradiancePeakHour,
    solarIrradiancePeak,
  } = parameters

  const tankMass = tankVolume // kg (1 liter ~ 1 kg)
  const specificHeat = 4186 // J/(kg*K) for water
  const dt = 10 // timestep in seconds
  const totalTime = 24 * 3600 // 24 hours
  const numSteps = Math.floor(totalTime / dt)
  const samplingInterval = 3600 // sample every hour (3600 seconds)

  const tankTempData = []
  const heatInData = []
  const heatLossData = []
  const ambientTempData = []

  let currentTankTemp = initialTankTemp
  let lastQPanel = 0
  let lastQTankLoss = 0

  // Add initial data point (t=0)
  tankTempData.push({
    x: 0,
    y: parseFloat(initialTankTemp.toFixed(2)),
  })
  heatInData.push({
    x: 0,
    y: 0,
  })
  heatLossData.push({
    x: 0,
    y: 0,
  })
  ambientTempData.push({
    x: 0,
    y: ambientTemp,
  })

  for (let i = 1; i < numSteps; i++) {
    const currentTime = i * dt
    const timeHours = currentTime / 3600

    // Calculate solar irradiance for this timestep
    let irradiance = 0
    if (timeHours >= irradianceStartHour && timeHours <= irradianceEndHour) {
      const fractionOfDay = (timeHours - irradianceStartHour) / (irradianceEndHour - irradianceStartHour)
      const peakFraction = (irradiancePeakHour - irradianceStartHour) / (irradianceEndHour - irradianceStartHour)
      irradiance = solarIrradiancePeak * Math.cos((fractionOfDay - peakFraction) * Math.PI)
      irradiance = Math.max(0, irradiance)
    }

    // Calculate panel temperature at equilibrium
    let panelTemp = ambientTemp
    if (irradiance > 0) {
      const solarCollected = irradiance * panelArea * panelEfficiencyRef
      panelTemp = ambientTemp + (solarCollected / (panelUValue * panelArea))
    }

    // Calculate heat output from panel to tank
    const qPanel = calculatePanelOutput(irradiance, panelTemp, currentTankTemp, ambientTemp, panelArea, panelUValue, panelEfficiencyRef, panelRefTemp, panelTempCoefficient)

    // Calculate tank heat loss to environment
    const qTankLoss = calculateTankHeatLoss(currentTankTemp, ambientTemp, tankSurfaceArea, tankInsulationUValue)

    // Store current values for sampling
    lastQPanel = qPanel
    lastQTankLoss = qTankLoss

    // Energy balance: net energy into tank per timestep
    // Q_net = (heat_in - heat_loss) * dt (in Joules)
    const qNet = (qPanel - qTankLoss) * dt

    // Update tank temperature
    // ΔT = Q / (m * c_p)
    const deltaT = qNet / (tankMass * specificHeat)
    currentTankTemp = Math.max(ambientTemp, currentTankTemp + deltaT)

    // Store data every hour for clean visualization
    if (i % (samplingInterval / dt) === 0) {
      const roundedHours = parseFloat(timeHours.toFixed(2))
      tankTempData.push({
        x: roundedHours,
        y: parseFloat(currentTankTemp.toFixed(2)),
      })
      heatInData.push({
        x: roundedHours,
        y: parseFloat(lastQPanel.toFixed(2)),
      })
      heatLossData.push({
        x: roundedHours,
        y: parseFloat(lastQTankLoss.toFixed(2)),
      })
      ambientTempData.push({
        x: roundedHours,
        y: ambientTemp,
      })
    }
  }

  return [
    {
      id: 'Heat In (W)',
      color: 'hsl(120, 100%, 50%)',
      data: heatInData,
    },
    {
      id: 'Heat Loss (W)',
      color: 'hsl(210, 100%, 50%)',
      data: heatLossData,
    },
    {
      id: 'Tank Temperature (°C)',
      color: 'hsl(0, 100%, 50%)',
      data: tankTempData,
    },
    {
      id: 'Ambient Temperature (°C)',
      color: 'hsl(0, 60%, 50%)',
      data: ambientTempData,
      dashed: true,
    },
  ]
}

