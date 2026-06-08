import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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

export interface MovieDetail extends Movie {
  tagline: string;
  runtime: number;
  budget: number;
  revenue: number;
  status: string;
  originalLanguage: string;
  voteCount: number;
  productionCompanies: { name: string; logoUrl: string }[];
}

export interface MovieListResponse {
  results: Movie[];
  page: number;
  totalPages: number;
}

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

@Injectable()
export class MoviesService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {}

  private buildUrl(path: string, params: Record<string, string | number> = {}) {
    const apiKey = this.config.get<string>('TMDB_API_KEY');
    const qs = new URLSearchParams({ api_key: apiKey!, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
    return `${this.baseUrl}${path}?${qs}`;
  }

  private mapMovie(raw: Record<string, unknown>): Movie {
    const genreObjects = raw['genres'] as Array<{ id: number; name: string }> | undefined;
    return {
      id: raw['id'] as number,
      title: raw['title'] as string,
      overview: raw['overview'] as string,
      rating: raw['vote_average'] as number,
      releaseYear: ((raw['release_date'] as string) ?? '').substring(0, 4),
      posterUrl: raw['poster_path'] ? `${IMAGE_BASE}/w500${raw['poster_path']}` : '',
      backdropUrl: raw['backdrop_path'] ? `${IMAGE_BASE}/w1280${raw['backdrop_path']}` : '',
      genreIds: (raw['genre_ids'] as number[]) ?? [],
      genres: genreObjects ? genreObjects.map((g) => g.name) : undefined,
    };
  }

  async getPopular(page = 1): Promise<MovieListResponse> {
    try {
      const url = this.buildUrl('/movie/popular', { page });
      const { data } = await firstValueFrom(this.http.get<Record<string, unknown>>(url));
      const results = (data['results'] as Record<string, unknown>[]).map((m) => this.mapMovie(m));
      return { results, page: data['page'] as number, totalPages: data['total_pages'] as number };
    } catch (err: unknown) {
      this.handleHttpError(err);
    }
  }

  async getById(id: number): Promise<MovieDetail> {
    try {
      const url = this.buildUrl(`/movie/${id}`);
      const { data } = await firstValueFrom(this.http.get<Record<string, unknown>>(url));
      return this.mapMovieDetail(data);
    } catch (err: unknown) {
      this.handleHttpError(err);
    }
  }

  private mapMovieDetail(raw: Record<string, unknown>): MovieDetail {
    const base = this.mapMovie(raw);
    const companies = (raw['production_companies'] as Array<Record<string, unknown>> | undefined) ?? [];
    return {
      ...base,
      genres: ((raw['genres'] as Array<{ id: number; name: string }>) ?? []).map((g) => g.name),
      tagline: (raw['tagline'] as string) ?? '',
      runtime: (raw['runtime'] as number) ?? 0,
      budget: (raw['budget'] as number) ?? 0,
      revenue: (raw['revenue'] as number) ?? 0,
      status: (raw['status'] as string) ?? '',
      originalLanguage: (raw['original_language'] as string) ?? '',
      voteCount: (raw['vote_count'] as number) ?? 0,
      productionCompanies: companies.map((c) => ({
        name: c['name'] as string,
        logoUrl: c['logo_path'] ? `${IMAGE_BASE}/w200${c['logo_path']}` : '',
      })),
    };
  }

  async searchByTitle(query: string, page = 1): Promise<MovieListResponse> {
    try {
      const url = this.buildUrl('/search/movie', { query, page });
      const { data } = await firstValueFrom(this.http.get<Record<string, unknown>>(url));
      const results = (data['results'] as Record<string, unknown>[]).map((m) => this.mapMovie(m));
      return { results, page: data['page'] as number, totalPages: data['total_pages'] as number };
    } catch (err: unknown) {
      this.handleHttpError(err);
    }
  }

  async getGenres(): Promise<Array<{ id: number; name: string }>> {
    try {
      const url = this.buildUrl('/genre/movie/list');
      const { data } = await firstValueFrom(this.http.get<{ genres: Array<{ id: number; name: string }> }>(url));
      return data.genres;
    } catch (err: unknown) {
      this.handleHttpError(err);
    }
  }

  async discover(params: { genreId?: number; minRating?: number; page?: number } = {}): Promise<MovieListResponse> {
    try {
      const qp: Record<string, string | number> = {
        page: params.page ?? 1,
        vote_count_gte: 100,
      };
      if (params.genreId) qp['with_genres'] = params.genreId;
      if (params.minRating) qp['vote_average.gte'] = params.minRating;

      const url = this.buildUrl('/discover/movie', qp);
      const { data } = await firstValueFrom(this.http.get<Record<string, unknown>>(url));
      const results = (data['results'] as Record<string, unknown>[]).map((m) => this.mapMovie(m));
      return { results, page: data['page'] as number, totalPages: data['total_pages'] as number };
    } catch (err: unknown) {
      this.handleHttpError(err);
    }
  }

  private handleHttpError(err: unknown): never {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) throw new NotFoundException('Movie not found');
    throw new InternalServerErrorException('Failed to fetch movie data');
  }
}
