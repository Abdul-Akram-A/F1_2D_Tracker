import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrackMapComponent } from './features/track-map.component/track-map.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,TrackMapComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('F12dTracker');
}
