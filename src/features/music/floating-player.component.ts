import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicPlayerService } from '../../core/services/music-player.service';

@Component({
  selector: 'app-floating-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingPlayerComponent {
  player = inject(MusicPlayerService);
}
