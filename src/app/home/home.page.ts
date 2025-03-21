import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  InfiniteScrollCustomEvent,
  IonItem,
  IonAvatar,
  IonSkeletonText,
  IonAlert,
} from '@ionic/angular/standalone';
import { MovieService } from '../services/movie.service';
import { catchError, finalize } from 'rxjs';
import { MovieResult } from '../services/interfaces';
import { IonLabel } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonAvatar,
    IonSkeletonText,
    IonAlert,
    DatePipe,
    RouterModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage {
  private movieService = inject(MovieService);
  private currentPage = 1;
  public error = null;
  public isLoading = false;
  public movies: MovieResult[] = [];
  public imageBaseUrl = 'https://image.tmdb.org/t/p';
  public dummyArray = new Array(7);

  constructor() {
    this.loadMovies();
  }

  loadMovies(event?: InfiniteScrollCustomEvent) {
    //in case of infinite scroll, increment the page number
    this.error = null;

    if (!event) {
      this.isLoading = true;
    }

    this.movieService
      .getTopRatedMovies(this.currentPage)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (event) {
            event.target.complete();
          }
        }),
        catchError((err: any) => {
          console.log(err);
          this.error = err.error.status_message;
          return [];
        })
      )
      .subscribe({
        // this is the same as the .then() method in JavaScript
        next: (data: any) => {
          console.log(data);

          this.movies = [...this.movies, ...data.results];
          this.currentPage++;
          if (event) {
            event.target.disabled = this.currentPage >= data.total_pages;
          }
        },
      });
  }

  loadMoreMovies(event: InfiniteScrollCustomEvent) {
    this.loadMovies(event);
  }
}
