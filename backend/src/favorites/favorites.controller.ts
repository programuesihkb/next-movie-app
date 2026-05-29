import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';

interface AuthUser {
  userId: number;
  email: string;
}

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post()
  addFavorite(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: AddFavoriteDto,
  ) {
    return this.favoritesService.addFavorite(req.user.userId, dto);
  }

  @Get()
  getFavorites(@Req() req: Request & { user: AuthUser }) {
    return this.favoritesService.getFavorites(req.user.userId);
  }

  @Delete(':id')
  removeFavorite(
    @Req() req: Request & { user: AuthUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.favoritesService.removeFavorite(req.user.userId, id);
  }
}
