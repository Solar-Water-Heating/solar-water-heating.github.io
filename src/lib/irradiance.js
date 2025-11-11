/**
 * Solar Irradiance Calculations
 * Functions for calculating and simulating solar irradiance
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

