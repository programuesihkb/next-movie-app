export interface User {
  userId: number;
  email: string;
}

export interface Favorite {
  id: number;
  tmdbMovieId: number;
  movieTitle: string;
  posterUrl: string;
  backdropUrl: string;
  genreIds: number[];
  rating: number;
  addedAt: string;
}
