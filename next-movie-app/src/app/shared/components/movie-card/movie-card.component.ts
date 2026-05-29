import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonChip, IonLabel],
  template: `
    <ion-card class="movie-card" (click)="cardClick.emit(movie.id)" button>
      <div class="poster-wrapper">
        <img
          [src]="movie.posterUrl || 'assets/img/no-poster.png'"
          [alt]="movie.title + ' poster'"
          class="poster-img"
        />
        <div class="rating-badge">⭐ {{ movie.rating | number:'1.1-1' }}</div>
        <div class="gradient-overlay"></div>
        <div class="card-footer">
          <ion-card-title class="card-title">{{ movie.title }}</ion-card-title>
          <p class="release-year">{{ movie.releaseYear }}</p>
        </div>
      </div>
    </ion-card>
  `,
  styles: [`
    .movie-card {
      margin: 4px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .movie-card:active { transform: scale(0.97); }

    .poster-wrapper {
      position: relative;
      aspect-ratio: 2 / 3;
    }
    .poster-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .gradient-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 60%;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
    }
    .rating-badge {
      position: absolute;
      top: 8px; right: 8px;
      background: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
    }
    .card-footer {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 8px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .release-year {
      font-size: 11px;
      color: rgba(255,255,255,0.7);
      margin: 2px 0 0;
    }
  `],
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Output() cardClick = new EventEmitter<number>();
}
