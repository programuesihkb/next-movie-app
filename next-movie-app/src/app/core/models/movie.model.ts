export interface Movie {
  id: number;
  title: string;
  overview: string;
  rating: number;
  releaseYear: string;
  posterUrl: string;
  backdropUrl: string;
  genreIds: number[];
  genres?: string[];
}

export interface MovieListResponse {
  results: Movie[];
  page: number;
  totalPages: number;
}

export interface Genre {
  id: number;
  name: string;
}
