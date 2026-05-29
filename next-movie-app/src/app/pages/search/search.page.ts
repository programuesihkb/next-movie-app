import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { MovieGridComponent } from '../../shared/components/movie-grid/movie-grid.component';
import { ApiService } from '../../core/services/api.service';
import { Movie, MovieListResponse } from '../../core/models/movie.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonIcon,
    SearchBarComponent, MovieGridComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Search</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <app-search-bar (searched)="onSearch($event)" />

      @if (!query()) {
        <div class="empty-state">
          <ion-icon name="search-outline" size="large" />
          <ion-text><p>Search for movies</p></ion-text>
        </div>
      } @else if (loading()) {
        <app-movie-grid [movies]="[]" [loading]="true" />
      } @else if (movies().length === 0) {
        <div class="empty-state">
          <ion-text color="medium"><p>No results for "{{ query() }}"</p></ion-text>
        </div>
      } @else {
        <app-movie-grid [movies]="movies()" [loading]="false" />
      }
    </ion-content>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      ion-icon { font-size: 64px; color: var(--ion-color-medium); margin-bottom: 16px; }
      p { color: var(--ion-color-medium); font-size: 16px; }
    }
  `],
})
export class SearchPage {
  private api = inject(ApiService);
  private toastCtrl = inject(ToastController);

  query = signal('');
  movies = signal<Movie[]>([]);
  loading = signal(false);

  constructor() {
    addIcons({ searchOutline });
  }

  async onSearch(q: string) {
    this.query.set(q);
    if (!q.trim()) { this.movies.set([]); return; }

    this.loading.set(true);
    this.api.get<MovieListResponse>('/movies/search', { q }).subscribe({
      next: (res) => { this.movies.set(res.results); this.loading.set(false); },
      error: async () => {
        this.loading.set(false);
        const toast = await this.toastCtrl.create({ message: 'Search failed', duration: 2000, color: 'danger' });
        await toast.present();
      },
    });
  }
}
