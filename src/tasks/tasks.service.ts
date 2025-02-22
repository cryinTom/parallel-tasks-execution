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
    const task = await this.takeTask();
    if (!task) {
      return;
    }
    try {
      const fetchResult = await fetch(task.url);
      await this.taskRepository.update(task.id, {
        status: TaskStatus.DONE,
        http_code: fetchResult.status,
      });
    } catch (error) {
      console.log('Failed to handle task');
      await this.taskRepository.update(task.id, {
        status: TaskStatus.ERROR,
      });
    }
  }

  async takeTask(): Promise<Task | null> {
    return await this.dataSource.transaction(async () => {
      const task = await this.taskRepository
        .createQueryBuilder('task')
        .setLock('pessimistic_write')
        .where('task.status = :status', { status: TaskStatus.NEW })
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
