import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepo: Repository<Favorite>,
  ) {}

  async addFavorite(userId: number, dto: AddFavoriteDto): Promise<Favorite> {
    const favorite = this.favoritesRepo.create({ ...dto, userId });
    try {
      return await this.favoritesRepo.save(favorite);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === '23505') throw new ConflictException('Already in favorites');
      throw err;
    }
  }

  async getFavorites(userId: number): Promise<Favorite[]> {
    return this.favoritesRepo.find({
      where: { userId },
      order: { addedAt: 'DESC' },
    });
  }

  async removeFavorite(userId: number, favoriteId: number): Promise<void> {
    const favorite = await this.favoritesRepo.findOne({ where: { id: favoriteId } });
    if (!favorite) throw new NotFoundException('Favorite not found');
    if (favorite.userId !== userId) throw new ForbiddenException('Access denied');
    await this.favoritesRepo.remove(favorite);
  }

  async getFavoriteGenreIds(userId: number): Promise<number[]> {
    const favorites = await this.getFavorites(userId);
    const all = favorites.flatMap((f) => f.genreIds.map((id) => Number(id)));
    return [...new Set(all)];
  }
}
