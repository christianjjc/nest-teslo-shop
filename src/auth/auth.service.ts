import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import * as bcrypt from 'bcrypt'; //patron Adaptador

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      const { id, fullName, roles } = await this.userRepository.save(user);
      return {
        id,
        fullName,
        roles,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async logIn(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('email/password not valid!');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('email/password not valid!');
    }
    return user;
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error!, check server logs.');
  }
}
