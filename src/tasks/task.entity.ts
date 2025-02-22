import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TaskStatus {
  NEW = 'NEW',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.NEW,
  })
  status: TaskStatus;

  @Column({ type: 'int', nullable: true })
  http_code: number | null;
}
