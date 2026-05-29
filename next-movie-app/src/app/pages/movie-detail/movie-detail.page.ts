import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonChip, IonLabel, IonIcon, IonSpinner, IonBadge,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, heart, heartOutline, checkmark } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Movie } from '../../core/models/movie.model';
import { Favorite } from '../../core/models/user.model';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonButton, IonChip, IonLabel, IonIcon, IonSpinner, IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home" />
        </ion-buttons>
        <ion-title>{{ movie()?.title ?? 'Movie' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <div class="loading-center"><ion-spinner /></div>
      } @else if (movie()) {
        <!-- Backdrop hero -->
        <div class="backdrop"
          [style.background-image]="'url(' + movie()!.backdropUrl + ')'">
          <div class="backdrop-gradient"></div>
        </div>

        <!-- Info section -->
        <div class="info-section">
          <div class="poster-row">
            <img [src]="movie()!.posterUrl" [alt]="movie()!.title + ' poster'" class="poster" />
            <div class="title-block">
              <h1 class="title">{{ movie()!.title }}</h1>
              <div class="meta">
                <ion-badge color="warning">⭐ {{ movie()!.rating | number:'1.1-1' }}</ion-badge>
                <span class="year">{{ movie()!.releaseYear }}</span>
              </div>
              <div class="genres">
                @for (g of movie()!.genres; track g) {
                  <ion-chip>
                    <ion-label>{{ g }}</ion-label>
                  </ion-chip>
                }
              </div>
            </div>
          </div>

          <!-- Overview -->
          <div class="section">
            <h2>Overview</h2>
            <p [class.collapsed]="!expanded()">{{ movie()!.overview }}</p>
            <button class="read-more" (click)="expanded.set(!expanded())">
              {{ expanded() ? 'Show less' : 'Read more' }}
            </button>
          </div>

          <!-- Favorite action -->
          <div class="action-section">
            @if (!auth.isLoggedIn()) {
              <ion-button expand="block" (click)="router.navigate(['/login'])">
                Login to Save
              </ion-button>
            } @else if (isFavorited()) {
              <ion-button expand="block" color="success" disabled>
                <ion-icon slot="start" name="checkmark" />
                Saved
              </ion-button>
            } @else {
              <ion-button expand="block" [disabled]="savingFav()" (click)="addToFavorites()">
                <ion-icon slot="start" name="heart-outline" />
                {{ savingFav() ? 'Saving...' : 'Add to Favorites' }}
              </ion-button>
            }
          </div>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .loading-center { display: flex; justify-content: center; padding: 80px; }
    .backdrop {
      width: 100%; height: 250px;
      background-size: cover; background-position: center;
      position: relative;
    }
    .backdrop-gradient {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 40%, var(--ion-background-color) 100%);
    }
    .info-section { padding: 0 16px 32px; }
    .poster-row { display: flex; gap: 16px; margin-top: -48px; align-items: flex-end; }
    .poster {
      width: 100px; height: 150px;
      object-fit: cover; border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      flex-shrink: 0;
    }
    .title-block { flex: 1; padding-bottom: 8px; }
    .title { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
    .meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .year { color: var(--ion-color-medium); font-size: 14px; }
    .genres { display: flex; flex-wrap: wrap; gap: 4px; }
    .section { margin-top: 20px; }
    .section h2 { font-size: 16px; font-weight: 600; margin: 0 0 8px; }
    p.collapsed {
      display: -webkit-box; -webkit-line-clamp: 3;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .read-more {
      background: none; border: none; padding: 4px 0;
      color: var(--ion-color-primary); font-size: 14px; cursor: pointer;
    }
    .action-section { margin-top: 24px; }
  `],
})
export class MovieDetailPage implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private toastCtrl = inject(ToastController);

  movie = signal<Movie | null>(null);
  loading = signal(true);
  expanded = signal(false);
  isFavorited = signal(false);
  savingFav = signal(false);

  constructor() {
    addIcons({ star, heart, heartOutline, checkmark });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.get<Movie>(`/movies/${id}`).subscribe({
      next: (m) => { this.movie.set(m); this.loading.set(false); this.checkFavorited(m.id); },
      error: async () => {
        this.loading.set(false);
        const toast = await this.toastCtrl.create({ message: 'Failed to load movie', duration: 2000, color: 'danger' });
        await toast.present();
      },
    });
  }

  checkFavorited(tmdbId: number) {
    if (!this.auth.isLoggedIn()) return;
    this.api.get<Favorite[]>('/favorites').subscribe({
      next: (favs) => this.isFavorited.set(favs.some((f) => f.tmdbMovieId === tmdbId)),
    });
  }

  async addToFavorites() {
    const m = this.movie();
    if (!m) return;
    this.savingFav.set(true);

    const dto = {
      tmdbMovieId: m.id,
      movieTitle: m.title,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
      genreIds: m.genreIds,
      rating: m.rating,
    };

    this.api.post('/favorites', dto).subscribe({
      next: async () => {
        this.isFavorited.set(true);
        this.savingFav.set(false);
        const toast = await this.toastCtrl.create({ message: 'Added to favorites!', duration: 2000, color: 'success' });
        await toast.present();
      },
      error: async (err) => {
        this.savingFav.set(false);
        const msg = err.status === 409 ? 'Already in favorites' : 'Failed to add';
        const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color: 'danger' });
        await toast.present();
      },
    });
  }
}
