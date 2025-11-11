/**
 * Simulation Library
 * Contains all helper functions for physics and solar thermal simulations
 */

/**
 * Calculate solar irradiance at a given time
 * @param {number} t - Time in hours (0-24)
 * @param {object} params - Parameters object containing irradiance settings
 * @returns {number} Solar irradiance in W/m²
 */
export const calculateSolarIrradiance = (t, params) => {
  const { irradianceStartHour, irradianceEndHour, irradiancePeakHour, solarIrradiancePeak } = params

  let irradiance = 0
  if (t >= irradianceStartHour && t <= irradianceEndHour) {
    // Daytime: model as a cosine curve peaking at specified peak hour
    const fractionOfDay = (t - irradianceStartHour) / (irradianceEndHour - irradianceStartHour)
    // Calculate where the peak occurs as a fraction of the day
    const peakFraction = (irradiancePeakHour - irradianceStartHour) / (irradianceEndHour - irradianceStartHour)
    // Apply cosine curve centered at the specified peak hour
    irradiance = solarIrradiancePeak * Math.cos((fractionOfDay - peakFraction) * Math.PI)
    irradiance = Math.max(0, irradiance)
  }
  return irradiance
}

/**
 * Calculate panel efficiency based on temperature
 * @param {number} panelTemp - Panel temperature in °C
 * @param {number} ambientTemp - Ambient temperature in °C
 * @param {number} efficiencyRef - Reference efficiency (at 25°C)
 * @returns {number} Efficiency as a decimal (0-1)
 */
export const calculatePanelEfficiency = (panelTemp, ambientTemp, efficiencyRef) => {
  const refTemp = 25.0
  const tempCoefficient = 0.004 // -0.4% per °C
  let efficiency = efficiencyRef * (1 - tempCoefficient * (panelTemp - refTemp))
  efficiency = Math.max(0.1, Math.min(efficiency, efficiencyRef))
  return efficiency
}

/**
 * Calculate panel temperature at equilibrium
 * @param {number} irradiance - Solar irradiance in W/m²
 * @param {number} ambientTemp - Ambient temperature in °C
 * @param {number} panelArea - Panel area in m²
 * @param {number} efficiencyRef - Reference efficiency
 * @param {number} tankTemp - Tank temperature in °C
 * @param {number} panelUValue - Panel U-value in W/(m²*K)
 * @returns {number} Panel temperature in °C
 */
export const calculatePanelTemperature = (irradiance, ambientTemp, panelArea, efficiencyRef, tankTemp, panelUValue) => {
  // Heat loss coefficient for panel surface
  const uPanel = panelUValue // W/(m²*K)

  // Solar energy collected
  const efficiency = calculatePanelEfficiency(ambientTemp + 20, ambientTemp, efficiencyRef)
  const solarCollected = irradiance * panelArea * efficiency

  // Estimate panel temperature where solar gain ≈ losses
  if (solarCollected > 0) {
    return ambientTemp + (solarCollected / (uPanel * panelArea))
  } else {
    return ambientTemp
  }
}

/**
 * Simulate solar irradiance profile over 24 hours
 * @param {object} parameters - All simulation parameters
 * @returns {array} Array of plot data series
 */
export const simulateSolarIrradiance = (parameters) => {
  const irradianceData = []
  const hoursInDay = 24

  for (let t = 0; t < hoursInDay; t += 0.5) {
    const irradiance = calculateSolarIrradiance(t, parameters)
    irradianceData.push({
      x: parseFloat(t.toFixed(2)),
      y: parseFloat(irradiance.toFixed(2)),
    })
  }

  return [
    {
      id: 'Solar Irradiance',
      color: 'hsl(44, 100%, 50%)',
      data: irradianceData,
    },
  ]
}

/**
 * Simulate solar panel performance profile
 * @param {object} parameters - All simulation parameters
 * @returns {array} Array of plot data series
 */
export const simulateSolarPanel = (parameters) => {
  const { irradianceStartHour, irradianceEndHour, irradiancePeakHour, solarIrradiancePeak } = parameters
  const { panelArea, panelEfficiencyRef, panelMaxTemp, panelUValue } = parameters
  const ambientTemp = 25.0 // Assume constant ambient temperature
  const tankTemp = 40.0 // Assume constant tank temperature for this simulation

  const panelTempData = []
  const ambientTempData = []
  const panelEfficiencyData = []
  const panelHeatOutputData = []

  const hoursInDay = 24

  for (let t = 0; t < hoursInDay; t += 0.5) {
    const irradiance = calculateSolarIrradiance(t, parameters)
    const panelTemp = calculatePanelTemperature(irradiance, ambientTemp, panelArea, panelEfficiencyRef, tankTemp, panelUValue)
    const efficiency = calculatePanelEfficiency(panelTemp, ambientTemp, panelEfficiencyRef)

    // Calculate heat loss from panel
    const uPanel = panelUValue
    const heatLossFromPanel = uPanel * panelArea * (panelTemp - ambientTemp)

    // Calculate net heat output
    const solarCollected = irradiance * panelArea * efficiency
    const heatOutput = Math.max(0, solarCollected - heatLossFromPanel)

    panelTempData.push({
      x: parseFloat(t.toFixed(2)),
      y: parseFloat(Math.min(panelTemp, panelMaxTemp).toFixed(2)),
    })

    ambientTempData.push({
      x: parseFloat(t.toFixed(2)),
      y: ambientTemp,
    })

    panelEfficiencyData.push({
      x: parseFloat(t.toFixed(2)),
      y: parseFloat((efficiency * 100).toFixed(2)), // Convert to percentage
    })

    panelHeatOutputData.push({
      x: parseFloat(t.toFixed(2)),
      y: parseFloat(heatOutput.toFixed(2)),
    })
  }

  return [
    {
      id: 'Panel Temperature (°C)',
      color: 'hsl(0, 100%, 50%)',
      data: panelTempData,
    },
    {
      id: 'Ambient Temperature (°C)',
      color: 'hsl(0, 60%, 50%)',
      data: ambientTempData,
      dashed: true,
    },
    {
      id: 'Panel Efficiency (%)',
      color: 'hsl(120, 100%, 50%)',
      data: panelEfficiencyData,
    },
    {
      id: 'Heat Output (W)',
      color: 'hsl(210, 100%, 50%)',
      data: panelHeatOutputData,
    },
  ]
}

/**
 * Simulate storage tank temperature profile over 24 hours
 * @param {object} parameters - All simulation parameters
 * @returns {array} Array of plot data series
 */
export const simulateStorageTank = (parameters) => {
  const { tankVolume, initialTankTemp, tankSurfaceArea, tankInsulationUValue, massFlowRate, ambientTemp, panelArea, panelEfficiencyRef, panelUValue, irradianceStartHour, irradianceEndHour, irradiancePeakHour, solarIrradiancePeak } = parameters

  const tankMass = tankVolume // kg (1 liter ~ 1 kg)
  const specificHeat = 4186 // J/(kg*K) for water
  const dt = 10 // timestep in seconds
  const totalTime = 24 * 3600 // 24 hours
  const numSteps = Math.floor(totalTime / dt)
  const samplingInterval = 3600 // sample every hour (3600 seconds)
  const uPanel = 5.0 // W/(m²*K) - hardcoded panel U-value for heat loss calc (not the configurable panelUValue)

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

    // Calculate solar irradiance
    let irradiance = 0
    if (timeHours >= irradianceStartHour && timeHours <= irradianceEndHour) {
      const fractionOfDay = (timeHours - irradianceStartHour) / (irradianceEndHour - irradianceStartHour)
      const peakFraction = (irradiancePeakHour - irradianceStartHour) / (irradianceEndHour - irradianceStartHour)
      irradiance = solarIrradiancePeak * Math.cos((fractionOfDay - peakFraction) * Math.PI)
      irradiance = Math.max(0, irradiance)
    }

    // Calculate panel temperature using hardcoded U-value (5.0 W/(m²*K))
    let panelTemp = ambientTemp
    if (irradiance > 0) {
      const solarCollected = irradiance * panelArea * panelEfficiencyRef
      panelTemp = ambientTemp + (solarCollected / (uPanel * panelArea))
    }

    // Calculate heat from panel to tank
    // Temperature-dependent efficiency (same as Python: -0.4% per °C above 25°C)
    let efficiency = panelEfficiencyRef * (1 - 0.004 * (panelTemp - 25))
    efficiency = Math.max(0.1, Math.min(efficiency, panelEfficiencyRef)) // Clamp between 10% and reference

    const solarCollected = irradiance * panelArea * efficiency
    const heatLossFromPanel = uPanel * panelArea * (panelTemp - ambientTemp)
    const qPanel = Math.max(0, solarCollected - heatLossFromPanel)

    // Calculate tank heat loss
    const qTankLoss = tankInsulationUValue * tankSurfaceArea * (currentTankTemp - ambientTemp)

    // Store current values for sampling
    lastQPanel = qPanel
    lastQTankLoss = qTankLoss

    // Energy balance
    const qNet = (qPanel - qTankLoss) * dt
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

/**
 * Simulate projectile motion with air resistance
 * @param {object} parameters - All simulation parameters
 * @returns {array} Array of plot data series
 */
export const simulateProjectileMotion = (parameters) => {
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

