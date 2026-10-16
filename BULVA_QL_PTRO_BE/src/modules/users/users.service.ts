import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity.js';
import { Repository } from 'typeorm';
import { hashPassword } from '#/common/utils/bcrypt.utils';
import { PagedQueryDto } from '#/common/specifications/paged-query.dto';
import { UsersSpecification } from './users.specification.js';
import { executePagedQuery } from '#/common/specifications/execute-paged-query';
import { LoginType, UserStatus } from '../../common/enums/enum.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { date } from 'joi';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    // Check user exists
    const isExists = await this.userRepository.existsBy({ email: dto.email });
    if (isExists) {
      throw new BadRequestException('User đã tồn tại');
    }

    const { password, ...data } = dto;
    const hasedPassword = await hashPassword(password);
    const user = this.userRepository.create({
      ...data,
      password: hasedPassword,
      status: UserStatus.PENDING,
      loginType: LoginType.INTERNAL,
      emailVerified: false,
    });
    return this.userRepository.save(user);
  }
  async update(id: string, dto: UpdateUserDto) {
    // Check user exists
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Check mail unique
    if (dto.email && dto.email !== user.email) {
      if (await this.userRepository.existsBy({ email: dto.email })) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    console.log(dto);

    const dataUdpate = {
      ...dto,
      ...(dto.password && {
        password: await hashPassword(dto.password),
      }),
    };

    console.log(dataUdpate);

    this.userRepository.merge(user, dataUdpate);

    return this.userRepository.save(user);
  }

  // Update trạng thái sau khi ACTIVE E-MAIL
  async updateStatusEmailVerify(email: string) {
    // Check user exists
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    user.status = UserStatus.ACTIVE;
    user.emailVerified = true;

    return this.userRepository.save(user);
  }

  async list(query: PagedQueryDto) {
    return executePagedQuery(
      this.userRepository.createQueryBuilder(),
      new UsersSpecification(query),
    );
  }

  async findOne(id: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      // .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
  }

  async delete(id: string) {
    return this.userRepository.delete(id);
  }

  //////////// for AuthService
  async findByEmail(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOneOrFail();
  }

  async checkExistsEmail(email: string) {
    return await this.userRepository.existsBy({ email: email });
  }

  async checkExistUsername(username: string) {
    return await this.userRepository.existsBy({ username: username });
  }

  async updateUserActive(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    user.status = UserStatus.ACTIVE;
    user.emailVerified = true;

    return await this.userRepository.save(user);
  }
}
