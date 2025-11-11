/**
 * Simulation Library - Facade
 * Re-exports all simulation functions from specialized modules
 * for backward compatibility and centralized access
 */

// Solar Irradiance
export { calculateSolarIrradiance, simulateSolarIrradiance } from './irradiance.js'

// Solar Panel
export {
  calculatePanelEfficiency,
  calculatePanelTemperature,
  calculatePanelOutput,
  simulateSolarPanel,
} from './panel.js'

// Storage Tank
export { calculateTankHeatLoss, simulateStorageTank } from './tank.js'

// Projectile Motion
export { simulateProjectileMotion } from './projectile.js'