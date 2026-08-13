import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { Not, Repository } from 'typeorm';

import { AttachmentService } from '../attachment/attachment.service';
import type { UploadedAvatarFile } from '../attachment/interfaces/uploaded-avatar-file.interface';
import { BCRYPT_SALT_ROUNDS } from '../common/constants/auth.constant';
import { CurrentUserResponseDto } from './dto/responses/current-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  UserUpdateRepositories,
  UserUpdateRepository,
} from './repositories/user-update.repository';

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

    private readonly attachmentService: AttachmentService,

    private readonly userUpdateRepository: UserUpdateRepository,

    private readonly i18nService: I18nService,
  ) {}

  async create(userData: CreateUserData): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      bio: null,
    });

    return this.userRepository.save(user);
  }

  findById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        username,
      },
    });
  }

  async getCurrentUser(userId: number): Promise<CurrentUserResponseDto> {
    const user = await this.getUserOrFail(userId);

    return this.buildCurrentUserResponse(user);
  }

  async updateCurrentUser(
    userId: number,
    dto: UpdateUserDto,
    avatar?: UploadedAvatarFile,
  ): Promise<CurrentUserResponseDto> {
    if (avatar) {
      this.attachmentService.validateAvatar(avatar);
    }

    const updatedUser = await this.userUpdateRepository.transaction(
      async (repositories) =>
        this.updateUserWithinTransaction(
          userId,
          dto,
          avatar,
          repositories,
        ),
    );

    return this.buildCurrentUserResponse(updatedUser);
  }

  private async updateUserWithinTransaction(
    userId: number,
    dto: UpdateUserDto,
    avatar: UploadedAvatarFile | undefined,
    repositories: UserUpdateRepositories,
  ): Promise<User> {
    const user = await this.getUserOrFail(
      userId,
      repositories.userRepository,
    );

    await this.applyUserUpdates(
      user,
      dto,
      repositories.userRepository,
    );

    const updatedUser = await repositories.userRepository.save(user);

    if (avatar) {
      await this.attachmentService.createOrReplaceAvatar(
        userId,
        avatar,
        repositories.attachmentRepository,
      );
    }

    return updatedUser;
  }

  private async applyUserUpdates(
    user: User,
    dto: UpdateUserDto,
    userRepository: Repository<User>,
  ): Promise<void> {
    if (dto.username !== undefined) {
      const username = dto.username.trim();

      if (!username) {
        throw new BadRequestException(
          this.i18nService.t('user.errors.usernameRequired'),
        );
      }

      await this.ensureUsernameAvailable(
        username,
        user.id,
        userRepository,
      );

      user.username = username;
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();

      await this.ensureEmailAvailable(
        email,
        user.id,
        userRepository,
      );

      user.email = email;
    }

    if (dto.bio !== undefined) {
      const bio = dto.bio.trim();

      user.bio = bio || null;
    }

    if (dto.password !== undefined) {
      user.password = await bcrypt.hash(
        dto.password,
        BCRYPT_SALT_ROUNDS,
      );
    }
  }

  private async getUserOrFail(
    userId: number,
    userRepository: Repository<User> = this.userRepository,
  ): Promise<User> {
    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        this.i18nService.t('user.errors.userNotFound'),
      );
    }

    return user;
  }

  private async ensureUsernameAvailable(
    username: string,
    currentUserId: number,
    userRepository: Repository<User> = this.userRepository,
  ): Promise<void> {
    const existingUser = await userRepository.findOne({
      where: {
        username,
        id: Not(currentUserId),
      },
    });

    if (existingUser) {
      throw new ConflictException(
        this.i18nService.t('user.errors.usernameAlreadyInUse'),
      );
    }
  }

  private async ensureEmailAvailable(
    email: string,
    currentUserId: number,
    userRepository: Repository<User> = this.userRepository,
  ): Promise<void> {
    const existingUser = await userRepository.findOne({
      where: {
        email,
        id: Not(currentUserId),
      },
    });

    if (existingUser) {
      throw new ConflictException(
        this.i18nService.t('user.errors.emailAlreadyInUse'),
      );
    }
  }

  private async buildCurrentUserResponse(
    user: User,
  ): Promise<CurrentUserResponseDto> {
    const avatar = await this.attachmentService.findAvatarByUserId(
      user.id,
    );

    return plainToInstance(
      CurrentUserResponseDto,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          image: avatar?.url ?? null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
