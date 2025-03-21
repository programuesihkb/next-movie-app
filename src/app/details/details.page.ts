import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonChip,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, calendar, time, cash } from 'ionicons/icons';
import { MovieService } from '../services/movie.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonChip,
    CommonModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe
],
})
export class DetailsPage implements OnInit {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  movie: any;
  
  constructor() {
    addIcons({ star, calendar, time, cash });
  }
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieService.getMovieDetails(id).subscribe(movie => {
        this.movie = movie;
        console.log('Movie details:', this.movie);
      });
    }
  }
}
