import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [TasksService],
})
export class TasksModule {}
