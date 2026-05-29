import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonText,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../core/services/auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonText,
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="wrap">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Create Account</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <form [formGroup]="form" (ngSubmit)="register()">
              <ion-item>
                <ion-label position="floating">Email</ion-label>
                <ion-input type="email" formControlName="email" autocomplete="email" />
              </ion-item>

              <ion-item>
                <ion-label position="floating">Password</ion-label>
                <ion-input type="password" formControlName="password" autocomplete="new-password" />
              </ion-item>

              <ion-item>
                <ion-label position="floating">Confirm Password</ion-label>
                <ion-input type="password" formControlName="confirmPassword" autocomplete="new-password" />
              </ion-item>

              @if (form.errors?.['mismatch'] && form.get('confirmPassword')?.touched) {
                <ion-text color="danger"><p class="error-msg">Passwords do not match</p></ion-text>
              }

              <ion-button
                expand="block"
                type="submit"
                class="ion-margin-top"
                [disabled]="form.invalid || loading()"
              >
                @if (loading()) { <ion-spinner name="crescent" slot="start" /> }
                {{ loading() ? 'Registering…' : 'Register' }}
              </ion-button>
            </form>

            <p class="login-link">
              <ion-text color="medium">Already have an account? </ion-text>
              <a routerLink="/login">Login</a>
            </p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    .wrap {
      display: flex; align-items: center; justify-content: center;
      min-height: 100%; padding: 24px 16px;
    }
    ion-card { width: 100%; max-width: 420px; }
    .error-msg { font-size: 13px; padding: 4px 0 0; }
    .login-link {
      text-align: center; margin-top: 16px; font-size: 14px;
      a { color: var(--ion-color-primary); text-decoration: none; font-weight: 600; }
    }
  `],
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  async register() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.value;

    this.auth.register(email!, password!).subscribe({
      next: async () => {
        this.loading.set(false);
        const toast = await this.toastCtrl.create({
          message: 'Account created! Please log in.',
          duration: 2500,
          color: 'success',
        });
        await toast.present();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: async (err) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Registration failed';
        const toast = await this.toastCtrl.create({ message: msg, duration: 3000, color: 'danger' });
        await toast.present();
      },
    });
  }
}
