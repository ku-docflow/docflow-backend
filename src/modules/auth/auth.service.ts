import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async login(id: string, email: string | undefined, name: string) {
    let user = await this.userRepo.findOneBy({ id });

    if (!user) {
      user = this.userRepo.create({ id, email, name });
      user = await this.userRepo.save(user);
    }

    return {
      success: true,
      user,
    };
  }
}
