import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocaleService } from './core/locale/locale.service';
import { DirectionService } from './core/services/direction.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly localeService = inject(LocaleService);
  protected readonly directionService = inject(DirectionService);
}
