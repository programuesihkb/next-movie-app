import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs/home', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then((m) => m.RegisterPage),
  },

  // Movie detail — full screen outside tabs
  {
    path: 'movie/:id',
    loadComponent: () => import('./pages/movie-detail/movie-detail.page').then((m) => m.MovieDetailPage),
  },

  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'favorites',
        loadComponent: () => import('./pages/favorites/favorites.page').then((m) => m.FavoritesPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  // Legacy detail route kept for backward compatibility
  {
    path: 'details/:id',
    redirectTo: 'movie/:id',
    pathMatch: 'full',
  },

  { path: '**', redirectTo: 'tabs/home' },
];
