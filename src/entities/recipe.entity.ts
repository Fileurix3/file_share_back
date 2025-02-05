import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("recipes")
@Index("idx_recipes_cook_time_seconds", ["cook_time_seconds"])
@Index("idx_recipes_category", ["category"])
@Index("idx_recipes_difficulty", ["difficulty"])
export class RecipeEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: false })
  creator_id: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  title: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "text", array: true })
  steps: string[];

  @Column({ type: "varchar", length: 100, array: true })
  ingredients: string[];

  @Column({ type: "integer", nullable: false })
  cook_time_seconds: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  cook_time: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  category: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  difficulty: string;

  @Column({ type: "varchar", length: 255 })
  image: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: "creator_id" })
  creator: UserEntity;
}
