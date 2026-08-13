import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Attachment } from '../../attachment/entities/attachment.entity';
import { User } from '../entities/user.entity';

export interface UserUpdateRepositories {
  userRepository: Repository<User>;
  attachmentRepository: Repository<Attachment>;
}

@Injectable()
export class UserUpdateRepository {
  constructor(private readonly dataSource: DataSource) {}

  transaction<T>(
    operation: (repositories: UserUpdateRepositories) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (entityManager) =>
      operation({
        userRepository: entityManager.getRepository(User),
        attachmentRepository: entityManager.getRepository(Attachment),
      }),
    );
  }
}
