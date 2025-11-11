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
 * Model temperature-dependent panel efficiency.
 * Efficiency decreases as panel temperature increases.
 * 
 * Typical temperature coefficient: ~0.4-0.5% per °C above reference (25°C)
 * 
 * @param {number} panelTemp - Current panel temperature (°C)
 * @param {number} efficiencyRef - Reference efficiency at standard conditions
 * @param {number} panelRefTemp - Reference temperature for efficiency rating (°C). Default: 25°C
 * @param {number} panelTempCoefficient - Temperature coefficient for efficiency loss (fraction per °C). Default: 0.004
 * @returns {number} Efficiency as a decimal (0-1), clamped between 0.1 and efficiency_ref
 */
export const calculatePanelEfficiency = (panelTemp, efficiencyRef, panelRefTemp = 25.0, panelTempCoefficient = 0.004) => {
  let efficiency = efficiencyRef * (1 - panelTempCoefficient * (panelTemp - panelRefTemp))
  efficiency = Math.max(0.1, Math.min(efficiency, efficiencyRef))
  return efficiency
}

/**
 * Calculate panel temperature at equilibrium
 * At equilibrium: solar_in = heat_loss_to_ambient
 * panel_solar = U_panel * A_panel * (T_panel - T_ambient)
 * Solving for T_panel: T_panel = T_ambient + (panel_solar / (U_panel * A_panel))
 * 
 * @param {number} irradiance - Solar irradiance in W/m²
 * @param {number} ambientTemp - Ambient temperature in °C
 * @param {number} panelArea - Panel area in m²
 * @param {number} efficiencyRef - Reference efficiency
 * @param {number} panelUValue - Panel U-value in W/(m²*K)
 * @param {number} panelRefTemp - Reference temperature for efficiency rating in °C
 * @param {number} panelTempCoefficient - Temperature coefficient for efficiency loss
 * @returns {number} Panel temperature in °C
 */
export const calculatePanelTemperature = (irradiance, ambientTemp, panelArea, efficiencyRef, panelUValue, panelRefTemp = 25.0, panelTempCoefficient = 0.004) => {
  // At equilibrium: solar_in * efficiency = heat_loss_to_ambient
  // We need to solve: irradiance * panelArea * efficiency(T) = panelUValue * panelArea * (T - ambientTemp)
  // This requires iteration since efficiency is temperature-dependent
  
  if (irradiance <= 0) {
    return ambientTemp
  }

  // Use iterative approach to find equilibrium temperature
  let panelTemp = ambientTemp
  for (let i = 0; i < 10; i++) {
    const efficiency = calculatePanelEfficiency(panelTemp, efficiencyRef, panelRefTemp, panelTempCoefficient)
    const solarCollected = irradiance * panelArea * efficiency
    panelTemp = ambientTemp + (solarCollected / (panelUValue * panelArea))
  }
  
  return panelTemp
}

/**
 * Calculate heat output from the solar panel to the tank
 * The panel collects solar energy but also loses heat to the environment.
 * Net output = solar_collected - heat_loss_from_panel
 * 
 * @param {number} solarIrradiance - Solar irradiance in W/m²
 * @param {number} panelTemp - Panel temperature in °C
 * @param {number} tankTemp - Tank temperature in °C
 * @param {number} ambientTemp - Ambient temperature in °C
 * @param {number} panelArea - Panel area in m²
 * @param {number} panelUValue - Panel U-value in W/(m²*K)
 * @param {number} efficiencyRef - Reference efficiency
 * @param {number} panelRefTemp - Reference temperature for efficiency rating in °C
 * @param {number} panelTempCoefficient - Temperature coefficient for efficiency loss
 * @returns {number} Heat power output in Watts
 */
export const calculatePanelOutput = (solarIrradiance, panelTemp, tankTemp, ambientTemp, panelArea, panelUValue = 5.0, efficiencyRef = 0.70, panelRefTemp = 25.0, panelTempCoefficient = 0.004) => {
  // Collect solar energy (accounting for temperature-dependent efficiency)
  const efficiency = calculatePanelEfficiency(panelTemp, efficiencyRef, panelRefTemp, panelTempCoefficient)
  const solarCollected = solarIrradiance * panelArea * efficiency

  // Heat loss from panel to ambient (proportional to temperature difference)
  // U_panel is heat transfer coefficient for panel surface
  const heatLossFromPanel = panelUValue * panelArea * (panelTemp - ambientTemp)
  console.log('panelTemp', panelUValue , panelArea , (panelTemp - ambientTemp))
  console.log('solarCollected', solarCollected)
  console.log('heatLossFromPanel', heatLossFromPanel)
  // Net heat transferred to fluid
  const netHeat = solarCollected - heatLossFromPanel
  return Math.max(0, solarCollected)
}

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
  const { panelArea, panelEfficiencyRef, panelMaxTemp, panelUValue, panelRefTemp, panelTempCoefficient, ambientTemp } = parameters

  const panelTempData = []
  const ambientTempData = []
  const panelEfficiencyData = []
  const panelHeatOutputData = []

  const hoursInDay = 24

  for (let t = 0; t < hoursInDay; t += 0.5) {
    const irradiance = calculateSolarIrradiance(t, parameters)
    const panelTemp = calculatePanelTemperature(irradiance, ambientTemp, panelArea, panelEfficiencyRef, panelUValue, panelRefTemp, panelTempCoefficient)
    const efficiency = calculatePanelEfficiency(panelTemp, panelEfficiencyRef, panelRefTemp, panelTempCoefficient)

    // Calculate net heat output from panel
    const heatOutput = calculatePanelOutput(irradiance, panelTemp, ambientTemp, ambientTemp, panelArea, panelUValue, panelEfficiencyRef, panelRefTemp, panelTempCoefficient)
    console.log('heatOutput', heatOutput)
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