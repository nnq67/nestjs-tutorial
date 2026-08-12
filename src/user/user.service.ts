import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { CurrentUserResponseDto } from './dto/responses/current-user-response.dto';
import { User } from './entities/user.entity';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18nService: I18nService,
  ) {}

  async create(userData: CreateUserData): Promise<User> {
    const user = this.userRepository.create(userData);

    return this.userRepository.save(user);
  }

  async findById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        username,
      },
    });
  }

  async getCurrentUser(userId: number): Promise<CurrentUserResponseDto> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException(
        this.i18nService.t('auth.errors.userNotFound'),
      );
    }

    return plainToInstance(
      CurrentUserResponseDto,
      {
        user,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
