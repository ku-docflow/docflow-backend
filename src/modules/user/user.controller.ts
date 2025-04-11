import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { UserService } from './user.service';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('init')
  @UseGuards(FirebaseAuthGuard)
  async getUserInitData(@Req() req: FirebaseRequest) {
    const userId = req.user.id;
    return this.userService.getInitData(userId);
  }
}
