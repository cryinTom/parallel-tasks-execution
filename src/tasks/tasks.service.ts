import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
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
      console.log('Failed to handle task', error);
      await this.taskRepository.update(task.id, {
        status: TaskStatus.ERROR,
      });
    }
  }

  async takeTask(): Promise<Task | null> {
    console.log('taking task');
    return await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Task);

      const task = await repo
        .createQueryBuilder('task')
        .setLock('pessimistic_write')
        .where('task.status = :status', { status: TaskStatus.NEW })
        .getOne();

      if (!task) {
        return null;
      }

      task.status = TaskStatus.PROCESSING;
      await repo.save(task);
      console.log('returning tasks');
      return task;
    });
  }
}
