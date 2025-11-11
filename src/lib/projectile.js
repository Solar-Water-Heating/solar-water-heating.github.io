/**
 * Projectile Motion Calculations
 * Functions for simulating projectile motion with air resistance
 */

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

