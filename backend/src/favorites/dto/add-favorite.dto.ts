import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddFavoriteDto {
  @IsInt()
  tmdbMovieId: number;

  @IsString()
  movieTitle: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsString()
  backdropUrl?: string;

  @IsArray()
  genreIds: number[];

  @IsNumber()
  rating: number;
}
