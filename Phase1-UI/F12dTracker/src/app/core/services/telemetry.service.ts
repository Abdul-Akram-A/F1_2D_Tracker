import { Injectable } from '@angular/core';
import { CoordinateMath } from '../../shared/utils/coordinate-math';

export interface DriverState {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  color: string;
  driverNumber: string;
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private driverStates = new Map<string, DriverState>();
  constructor(private calc: CoordinateMath) {}

  processIncomingData(drivers: any[], canvas: HTMLCanvasElement, padding: number, bbox: any) {
    drivers.forEach((driver) => {
      // Convert GPS to Screen Pixels once per WebSocket message
      const { x, y } = this.calc.normalize(driver.x, driver.y, canvas, padding, bbox);
      console.log(`Driver ${driver.driver_number} is at Pixel:`, x, y);

      if (!this.driverStates.has(driver.driver_number)) {
        this.driverStates.set(driver.driver_number, {
          currentX: x,
          currentY: y,
          targetX: x,
          targetY: y,
          color: driver.team_colour || '#ff0000', // Fallback color
          driverNumber: driver.driver_number,
        });
      } else {
        // Update only the target; the LERP loop will handle the glide
        const state = this.driverStates.get(driver.driver_number)!;
        state.targetX = x;
        state.targetY = y;
      }
    });
  }

  // Called 60 times per second by the component's requestAnimationFrame
  getSmoothPositions(): DriverState[] {
    this.driverStates.forEach((state) => {
      state.currentX = this.calc.lerp(state.currentX, state.targetX);
      state.currentY = this.calc.lerp(state.currentY, state.targetY);
    });
    return Array.from(this.driverStates.values());
  }
}
