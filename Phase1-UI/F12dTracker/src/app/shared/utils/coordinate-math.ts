import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CoordinateMath {
  lerp(start: number, end: number, factor: number = 0.08): number {
    return start + factor * (end - start);
  }

  normalize(
    lon: number,
    lat: number,
    canvas: HTMLCanvasElement,
    padding: number,
    bbox: { minLon: number; maxLon: number; minLat: number; maxLat: number },
  ) {
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Standard normalization formula
    const x = ((lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * width + padding;

    // Y is inverted because Latitude increases upwards, but Canvas pixels increase downwards
    const y = (1 - (lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * height + padding;

    return { x, y };
  }
}
