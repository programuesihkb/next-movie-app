import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonSegment, IonSegmentButton, IonLabel, IonChip,
  IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent,
  IonText, IonButton, IonCard, IonCardTitle, IonBadge,
  ToastController,
} from '@ionic/angular/standalone';
import { MovieGridComponent } from '../shared/components/movie-grid/movie-grid.component';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { Movie, MovieListResponse, Genre } from '../core/models/movie.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSegment, IonSegmentButton, IonLabel, IonChip,
    IonInfiniteScroll, IonInfiniteScrollContent,
    IonText, IonButton, IonCard, IonCardTitle, IonBadge,
    MovieGridComponent,
  ],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);
  private toastCtrl = inject(ToastController);

  movies = signal<Movie[]>([]);
  recommendations = signal<Movie[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal(false);

  activeSegment = signal<'popular' | 'top-rated'>('popular');
  activeGenreId = signal<number | null>(null);
  currentPage = 1;
  allLoaded = false;

  ngOnInit() {
    this.loadGenres();
    this.loadMovies(true);
    if (this.auth.isLoggedIn()) this.loadRecommendations();
  }

  loadGenres() {
    this.api.get<Genre[]>('/movies/genres').subscribe({
      next: (genres) => this.genres.set(genres),
    });
  }

  loadRecommendations() {
    this.api.get<Movie[]>('/recommendations').subscribe({
      next: (recs) => this.recommendations.set(recs),
    });
  }

  onSegmentChange(event: CustomEvent) {
    this.activeSegment.set(event.detail.value);
    this.activeGenreId.set(null);
    this.loadMovies(true);
  }

  clearGenre() {
    this.activeGenreId.set(null);
    this.loadMovies(true);
  }

  selectGenre(genreId: number) {
    this.activeGenreId.set(this.activeGenreId() === genreId ? null : genreId);
    this.loadMovies(true);
  }

  loadMovies(reset = false, event?: InfiniteScrollCustomEvent) {
    if (reset) {
      this.currentPage = 1;
      this.allLoaded = false;
      if (!event) this.loading.set(true);
    }

    const params: Record<string, string | number> = { page: this.currentPage };
    if (this.activeGenreId()) params['genreId'] = this.activeGenreId()!;
    if (this.activeSegment() === 'top-rated') params['minRating'] = 7;

    this.api.get<MovieListResponse>('/movies', params).subscribe({
      next: (res) => {
        const next = reset ? res.results : [...this.movies(), ...res.results];
        this.movies.set(next);
        this.currentPage++;
        this.allLoaded = this.currentPage > res.totalPages;
        this.loading.set(false);
        event?.target.complete();
        if (this.allLoaded && event) event.target.disabled = true;
      },
      error: async () => {
        this.loading.set(false);
        event?.target.complete();
        const toast = await this.toastCtrl.create({ message: 'Failed to load movies', duration: 2000, color: 'danger' });
        await toast.present();
      },
    });
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    if (this.allLoaded) { event.target.complete(); return; }
    this.loadMovies(false, event);
  }
}
