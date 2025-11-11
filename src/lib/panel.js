/**
 * Solar Panel Calculations
 * Functions for panel efficiency, temperature, output, and performance simulation
 */

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

  return Math.max(0, solarCollected)
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
    // Calculate solar irradiance inline
    let irradiance = 0
    if (t >= irradianceStartHour && t <= irradianceEndHour) {
      const fractionOfDay = (t - irradianceStartHour) / (irradianceEndHour - irradianceStartHour)
      const peakFraction = (irradiancePeakHour - irradianceStartHour) / (irradianceEndHour - irradianceStartHour)
      irradiance = solarIrradiancePeak * Math.cos((fractionOfDay - peakFraction) * Math.PI)
      irradiance = Math.max(0, irradiance)
    }

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

