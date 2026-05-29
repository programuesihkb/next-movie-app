import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonGrid, IonRow, IonCol, IonSkeletonText, IonCard } from '@ionic/angular/standalone';
import { Movie } from '../../../core/models/movie.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-movie-grid',
  standalone: true,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonSkeletonText, IonCard, MovieCardComponent],
  template: `
    @if (loading) {
      <ion-grid>
        <ion-row>
          @for (item of skeletons; track $index) {
            <ion-col size="6" size-md="4">
              <ion-card style="margin:4px; border-radius:12px; aspect-ratio:2/3; overflow:hidden;">
                <ion-skeleton-text animated style="width:100%;height:100%;"></ion-skeleton-text>
              </ion-card>
            </ion-col>
          }
        </ion-row>
      </ion-grid>
    } @else {
      <ion-grid>
        <ion-row>
          @for (movie of movies; track movie.id) {
            <ion-col size="6" size-md="4">
              <app-movie-card
                [movie]="movie"
                (cardClick)="onMovieClick($event)"
              />
            </ion-col>
          }
        </ion-row>
      </ion-grid>
    }
  `,
})
export class MovieGridComponent {
  private router = inject(Router);

  @Input() movies: Movie[] = [];
  @Input() loading = false;
  @Output() movieSelected = new EventEmitter<number>();

  readonly skeletons = new Array(6);

  onMovieClick(id: number) {
    this.movieSelected.emit(id);
    this.router.navigate(['/movie', id]);
  }
}
