import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { delay, Observable } from 'rxjs';
import { ApiResult, MovieResult } from './interfaces';

// services are used to make http requests to the API
// the service is injected into the component
// similar to context in React but better

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = environment.apiKey;

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  // this is the same as environment.apiKey
  private http = inject(HttpClient);

  constructor() { }

  getTopRatedMovies(page=1): Observable<ApiResult> {
    return this.http
      .get<ApiResult>(`${BASE_URL}/movie/popular?page=${page}&api_key=${API_KEY}`)
      .pipe(delay(700)
    );
  }

  getMovieDetails(id: string): Observable<MovieResult> {
    return this.http.get<MovieResult>(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
  }  
}
