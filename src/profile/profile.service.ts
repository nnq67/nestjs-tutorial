import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { AttachmentService } from '../attachment/attachment.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ProfileResponseDto } from './dto/responses/profile-response.dto';
import { UserFollow } from './entities/user-follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserFollow)
    private readonly followRepository: Repository<UserFollow>,

    private readonly userService: UserService,

    private readonly attachmentService: AttachmentService,

    private readonly i18nService: I18nService,
  ) {}

  async getProfile(
    username: string,
    currentUserId?: number,
  ): Promise<ProfileResponseDto> {
    const profileUser = await this.getProfileUserOrFail(username);

    return this.buildProfileResponse(profileUser, currentUserId);
  }

  async followProfile(
    currentUserId: number,
    username: string,
  ): Promise<ProfileResponseDto> {
    const profileUser = await this.getProfileUserOrFail(username);

    this.ensureNotCurrentUser(currentUserId, profileUser.id);

    const existingFollow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: profileUser.id,
      },
    });

    if (!existingFollow) {
      const follow = this.followRepository.create({
        followerId: currentUserId,
        followingId: profileUser.id,
      });

      await this.followRepository.save(follow);
    }

    return this.buildProfileResponse(profileUser, currentUserId);
  }

  async unfollowProfile(
    currentUserId: number,
    username: string,
  ): Promise<ProfileResponseDto> {
    const profileUser = await this.getProfileUserOrFail(username);

    this.ensureNotCurrentUser(currentUserId, profileUser.id);

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: profileUser.id,
    });

    return this.buildProfileResponse(profileUser, currentUserId);
  }

  private async getProfileUserOrFail(username: string): Promise<User> {
    const normalizedUsername = username.trim();

    const user = await this.userService.findByUsername(normalizedUsername);

    if (!user) {
      throw new NotFoundException(
        this.i18nService.t('user.errors.profileNotFound'),
      );
    }

    return user;
  }

  private ensureNotCurrentUser(
    currentUserId: number,
    profileUserId: number,
  ): void {
    if (currentUserId === profileUserId) {
      throw new BadRequestException(
        this.i18nService.t('user.errors.cannotFollowYourself'),
      );
    }
  }

  private async buildProfileResponse(
    profileUser: User,
    currentUserId?: number,
  ): Promise<ProfileResponseDto> {
    const [avatar, following] = await Promise.all([
      this.attachmentService.findAvatarByUserId(profileUser.id),
      this.isFollowing(currentUserId, profileUser.id),
    ]);

    return plainToInstance(
      ProfileResponseDto,
      {
        profile: {
          username: profileUser.username,
          bio: profileUser.bio,
          image: avatar?.url ?? null,
          following,
        },
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async isFollowing(
    currentUserId: number | undefined,
    profileUserId: number,
  ): Promise<boolean> {
    if (!currentUserId) {
      return false;
    }

    if (currentUserId === profileUserId) {
      return false;
    }

    const follow = await this.followRepository.findOne({
      where: {
        followerId: currentUserId,
        followingId: profileUserId,
      },
    });

    return follow !== null;
  }
}
