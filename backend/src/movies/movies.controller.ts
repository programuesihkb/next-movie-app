import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  // /api/movies/genres — must be declared before :id
  @Get('genres')
  getGenres() {
    return this.moviesService.getGenres();
  }

  @Get('search')
  search(@Query('q') q: string, @Query('page') page = '1') {
    return this.moviesService.searchByTitle(q, parseInt(page, 10));
  }

  @Get()
  getMovies(
    @Query('page') page = '1',
    @Query('genreId') genreId?: string,
    @Query('minRating') minRating?: string,
  ) {
    if (genreId || minRating) {
      return this.moviesService.discover({
        genreId: genreId ? parseInt(genreId, 10) : undefined,
        minRating: minRating ? parseFloat(minRating) : undefined,
        page: parseInt(page, 10),
      });
    }
    return this.moviesService.getPopular(parseInt(page, 10));
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getById(id);
  }
}
