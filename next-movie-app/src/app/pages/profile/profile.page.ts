import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
  IonList, IonItem, IonLabel, IonText, IonLoading, ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonButton,
    IonList, IonItem, IonLabel, IonText, IonLoading,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (user()) {
        <div class="profile-header">
          <ion-avatar class="avatar">
            <div class="initials">{{ initials() }}</div>
          </ion-avatar>
          <ion-text>
            <h2>{{ user()!.email }}</h2>
          </ion-text>
        </div>

        <ion-list>
          <ion-item>
            <ion-label>
              <p>Favorites</p>
              <h3>{{ favoriteCount() }} movies saved</h3>
            </ion-label>
          </ion-item>
          <ion-item button (click)="router.navigate(['/tabs/favorites'])">
            <ion-label>My Favorites</ion-label>
          </ion-item>
          <ion-item button (click)="router.navigate(['/tabs/home'])">
            <ion-label>Personalized Picks</ion-label>
          </ion-item>
        </ion-list>

        <div class="logout-section">
          <ion-button expand="block" color="danger" fill="outline" (click)="doLogout()">
            Logout
          </ion-button>
        </div>
      } @else {
        <div class="not-logged-in">
          <ion-text color="medium"><p>Not logged in</p></ion-text>
          <ion-button (click)="router.navigate(['/login'])">Login</ion-button>
        </div>
      }
    </ion-content>

    <ion-loading [isOpen]="loggingOut()" message="Logging out..." />
  `,
  styles: [`
    .profile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 0 24px;
      gap: 12px;
    }
    .avatar {
      width: 80px; height: 80px;
      background: var(--ion-color-primary);
      display: flex; align-items: center; justify-content: center;
    }
    .initials {
      font-size: 28px; font-weight: 700;
      color: var(--ion-color-primary-contrast);
      text-align: center; line-height: 80px; width: 100%;
    }
    .logout-section { padding: 32px 0 0; }
    .not-logged-in {
      display: flex; flex-direction: column; align-items: center;
      padding: 60px 20px; gap: 16px;
    }
  `],
})
export class ProfilePage implements OnInit {
  router = inject(Router);
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private toastCtrl = inject(ToastController);

  user = signal<User | null>(null);
  favoriteCount = signal(0);
  loggingOut = signal(false);

  initials() {
    const email = this.user()?.email ?? '';
    return email.charAt(0).toUpperCase();
  }

  ngOnInit() {
    this.auth.currentUser$.subscribe((u) => this.user.set(u));
    if (this.auth.isLoggedIn()) {
      this.auth.me().subscribe((u) => this.user.set(u));
      this.api.get<unknown[]>('/favorites').subscribe((list) => this.favoriteCount.set(list.length));
    }
  }

  doLogout() {
    this.loggingOut.set(true);
    this.auth.logout().subscribe({
      next: () => this.loggingOut.set(false),
      error: async () => {
        this.loggingOut.set(false);
        const toast = await this.toastCtrl.create({ message: 'Logout failed', duration: 2000, color: 'danger' });
        await toast.present();
      },
    });
  }
}
