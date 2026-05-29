import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { FavoritesModule } from '../favorites/favorites.module';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [FavoritesModule, MoviesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
