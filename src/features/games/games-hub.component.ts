import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../core/services/games.service';

@Component({
  selector: 'app-games-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games-hub.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesHubComponent {
  private games = inject(GamesService);

  // Идентификаторы игр
  readonly EMOTION_ID = 'emotion-guesser';
  readonly ASSOCIATIONS_ID = 'associations';

  // Сигналы для рекордов
  bestEmotion = signal(0);
  bestAssociations = signal(0);

  constructor() {
    // Инициализация лучших результатов
    this.refreshBestScores();
  }

  refreshBestScores(): void {
    this.bestEmotion.set(this.games.getBestScore(this.EMOTION_ID));
    this.bestAssociations.set(this.games.getBestScore(this.ASSOCIATIONS_ID));
  }
}
