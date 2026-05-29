import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('favorites')
@Unique(['userId', 'tmdbMovieId'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  tmdbMovieId: number;

  @Column()
  movieTitle: string;

  @Column({ nullable: true })
  posterUrl: string;

  @Column({ nullable: true })
  backdropUrl: string;

  @Column('simple-array', { default: '' })
  genreIds: number[];

  @Column('decimal', { precision: 3, scale: 1, default: 0 })
  rating: number;

  @CreateDateColumn()
  addedAt: Date;
}
