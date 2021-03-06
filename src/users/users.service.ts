import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleDto } from './dto/user_role_dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  // creating user
  async create(userDto: CreateUserDto): Promise<User> {
    const user = await this.prismaService.user.create({
      data: userDto,
    });

    // deleting password from object so that we dont return sensitive data
    delete user.password;
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  // find user by id
  async findById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    // removing password from object
    user && delete user.password;
    return user;
  }

  async FindByLoginDetails(field: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            email: field,
          },
          { user_name: field },
        ],
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    // remove password from users only if it exist
    user && delete user.password;

    return user;
  }

  // getting the total number of users
  async usersCount() {
    const users = await this.prismaService.user.count();
    return { count: users };
  }

  // update user data
  async setUserRole(
    user: User,
    id: string,
    roleDto: UserRoleDto,
  ): Promise<User> {
    if (user.role !== UserRole.Admin) throw new UnauthorizedException();
    return this.prismaService.user.update({ data: roleDto, where: { id } });
  }

  // update user data
  async updateUser(id: string, userDto: UpdateUserDto): Promise<User> {
    const user = await this.prismaService.user.update({
      data: userDto,
      where: { id },
    });

    // removing password from object
    delete user.password;

    return user;
  }

  userCommunities(user_id: string) {
    return this.prismaService.communityMembers.findMany({
      where: { user_id },
    });
  }

  // deleting User data
  async deleteUser(id: string): Promise<User> {
    const user = await this.prismaService.user.delete({ where: { id } });

    delete user.password;

    return user;
  }
}
