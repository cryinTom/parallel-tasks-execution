import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async taskExecution(): Promise<void> {
    try {
    } catch (error) {
      console.log('Failed to handle tasks');
    }
  }

  async takeTask(): Promise<Task | null> {
    return await this.dataSource.transaction(async () => {
      const task = await this.taskRepository
        .createQueryBuilder('task')
        .setLock('pessimistic_write')
        .where('task.status = :status', { status: TaskStatus.NEW })
        .orderBy('task.createdAt', 'ASC')
        .getOne();

      if (!task) {
        return null;
      }

      task.status = TaskStatus.PROCESSING;
      await this.taskRepository.save(task);

      return task;
    });
  }
}
