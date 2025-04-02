import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCard,
  IonCol,
  IonItem,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonLabel,
  IonButton,
  IonInput,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonLabel,
    IonCardTitle,
    IonCardContent,
    IonCardHeader,
    IonItem,
    IonCol,
    IonCard,
    IonContent,
    IonInput,
    CommonModule,
    FormsModule,
  ],
})
export class LoginPage implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  loginPage: boolean = true;

  constructor(private router: Router) {}

  login() {
    // Implement login logic here
    console.log('Login attempt with:', this.email, this.password);
    this.router.navigate(['/home']);
  }

  register() {
    // Implement registration logic here
    console.log('Register attempt with:', this.username, this.email, this.password);
    this.router.navigate(['/home']);
  }

  ngOnInit() {}
}
