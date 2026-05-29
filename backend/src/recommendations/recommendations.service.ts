/**
 * RECOMMENDATION STRATEGY
 *
 * CURRENT:  Genre-based via TMDB /discover (free, no ML).
 *           Fetches genres from user's favorites, then discovers movies per genre.
 *
 * FUTURE A: TMDB /movie/{id}/recommendations — 1-day effort, better signal quality.
 * FUTURE B: Collaborative filtering using a user_views tracking table.
 * FUTURE C: OpenAI embeddings + pgvector for production-grade semantic matching.
 */
import { Injectable } from '@nestjs/common';
import { FavoritesService } from '../favorites/favorites.service';
import { MoviesService, Movie } from '../movies/movies.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private favoritesService: FavoritesService,
    private moviesService: MoviesService,
  ) {}

  async getRecommendations(userId: number): Promise<Movie[]> {
    const genreIds = await this.favoritesService.getFavoriteGenreIds(userId);

    if (genreIds.length === 0) {
      const fallback = await this.moviesService.getPopular(1);
      return fallback.results.slice(0, 10);
    }

    const topGenres = genreIds.slice(0, 3);

    const results = await Promise.all(
      topGenres.map((genreId) =>
        this.moviesService
          .discover({ genreId, minRating: 6 })
          .then((r) => r.results)
          .catch(() => [] as Movie[]),
      ),
    );

    const flat = results.flat();
    const deduped = new Map<number, Movie>();
    for (const movie of flat) {
      if (!deduped.has(movie.id)) deduped.set(movie.id, movie);
    }

    const favorites = await this.favoritesService.getFavorites(userId);
    const favoritedIds = new Set(favorites.map((f) => f.tmdbMovieId));

    const filtered = [...deduped.values()].filter((m) => !favoritedIds.has(m.id));

    if (filtered.length === 0) {
      const fallback = await this.moviesService.getPopular(1);
      return fallback.results.slice(0, 10);
    }

    return filtered.slice(0, 10);
  }
}
