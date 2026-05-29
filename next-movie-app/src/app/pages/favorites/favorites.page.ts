import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel,
  IonText, AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, trash } from 'ionicons/icons';
import { MovieGridComponent } from '../../shared/components/movie-grid/movie-grid.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Favorite } from '../../core/models/user.model';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel, IonText,
    MovieGridComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>My Favorites</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <app-movie-grid [movies]="[]" [loading]="true" />
      } @else if (favorites().length === 0) {
        <div class="empty-state">
          <ion-icon name="heart-outline" size="large" color="medium" />
          <ion-text color="medium"><p>No favorites yet</p></ion-text>
          <ion-button fill="outline" (click)="router.navigate(['/tabs/home'])">Browse Movies</ion-button>
        </div>
      } @else {
        <app-movie-grid [movies]="asMovies()" [loading]="false" />
      }
    </ion-content>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 16px;
      ion-icon { font-size: 72px; }
      p { margin: 0; font-size: 16px; }
    }
  `],
})
export class FavoritesPage implements OnInit {
  router = inject(Router);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  favorites = signal<Favorite[]>([]);
  loading = signal(false);

  constructor() {
    addIcons({ heartOutline, trash });
  }

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    if (!this.auth.isLoggedIn()) return;
    this.loading.set(true);
    this.api.get<Favorite[]>('/favorites').subscribe({
      next: (data) => { this.favorites.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  asMovies(): Movie[] {
    return this.favorites().map((f) => ({
      id: f.tmdbMovieId,
      title: f.movieTitle,
      overview: '',
      rating: f.rating,
      releaseYear: '',
      posterUrl: f.posterUrl,
      backdropUrl: f.backdropUrl,
      genreIds: f.genreIds,
    }));
  }

  async confirmRemove(fav: Favorite) {
    const alert = await this.alertCtrl.create({
      header: 'Remove Favorite',
      message: `Remove "${fav.movieTitle}" from favorites?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => this.remove(fav.id),
        },
      ],
    });
    await alert.present();
  }

  remove(id: number) {
    this.api.delete<void>(`/favorites/${id}`).subscribe({
      next: async () => {
        this.favorites.update((list) => list.filter((f) => f.id !== id));
        const toast = await this.toastCtrl.create({ message: 'Removed from favorites', duration: 2000 });
        await toast.present();
      },
      error: async () => {
        const toast = await this.toastCtrl.create({ message: 'Failed to remove', duration: 2000, color: 'danger' });
        await toast.present();
      },
    });
  }
}
