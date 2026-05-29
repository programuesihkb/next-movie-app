import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

interface AuthUser {
  userId: number;
  email: string;
}

@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getRecommendations(@Req() req: Request & { user: AuthUser }) {
    return this.recommendationsService.getRecommendations(req.user.userId);
  }
}
