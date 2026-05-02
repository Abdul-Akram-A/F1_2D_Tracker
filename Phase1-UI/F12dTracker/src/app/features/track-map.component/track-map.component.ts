import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoordinateMath } from '../../shared/utils/coordinate-math';
import { WebSocketService } from '../../core/services/web-socket.service';
import { TelemetryService } from '../../core/services/telemetry.service';

@Component({
  selector: 'app-track-map',
  imports: [],
  templateUrl: './track-map.component.html',
  styleUrls: ['./track-map.component.css'],
})
export class TrackMapComponent implements AfterViewInit, OnInit {
  @ViewChild('bgCanvas') bgCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fgCanvas') fgCanvas!: ElementRef<HTMLCanvasElement>;

  private trackLoader(): Observable<Object> {
    return this.http.get('tracks/cn-2004.geojson');
  }

  private bbox = {} as any;

  private readonly padding = 100;

  constructor(
    private http: HttpClient,
    private calc: CoordinateMath,
    private ws: WebSocketService,
    private telemetry: TelemetryService,
  ) {}

  ngOnInit(): void {
    // 1. Load Track Metadata FIRST
    this.trackLoader().subscribe((geoJson: any) => {
      const boxing = geoJson.bbox;
      this.bbox = {
        minLon: boxing[0],
        minLat: boxing[1],
        maxLon: boxing[2],
        maxLat: boxing[3],
      };

      // 2. Draw static track
      this.drawStaticTrack(geoJson.features[0].geometry.coordinates);

      // 3. ONLY NOW connect and subscribe to telemetry
      this.ws.connect();
      this.ws.messages$.subscribe((drivers: any[]) => {
        // Check if bbox is valid before processing
        if (this.bbox && this.bbox.minLon !== undefined) {
          this.telemetry.processIncomingData(
            drivers,
            this.fgCanvas.nativeElement,
            this.padding,
            this.bbox,
          );
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.initTrack();
  }

  private initTrack(): void {
    this.animate();
  }

  private animate(): void {
    const canvas = this.fgCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear only the foreground layer [cite: 2, 172]
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get smooth positions calculated via LERP in the TelemetryService
    const drivers = this.telemetry.getSmoothPositions();

    drivers.forEach((driver) => {
      // Draw Driver Dot
      ctx.beginPath();
      ctx.arc(driver.currentX, driver.currentY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0000'; // Team hex color [cite: 9]
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0000';
      ctx.fill();

      // Draw Driver Number Label
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(driver.driverNumber, driver.currentX, driver.currentY + 4);
    });

    requestAnimationFrame(() => this.animate());
  }

  private drawStaticTrack(coordinates: number[][]): void {
    const canvas = this.bgCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff'; // White track line
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Add a slight glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

    ctx.beginPath();

    coordinates.forEach((point, index) => {
      const { x, y } = this.calc.normalize(point[0], point[1], canvas, this.padding, this.bbox);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y); // Connect the dots
      }
    });

    ctx.stroke();
  }
}
