import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(FirebaseAuthGuard)
  login(@Req() req: FirebaseRequest, @Body() dto: LoginDto) {
    const { id, email } = req.user;

    return this.authService.login(id, email, dto.name);
  }
}
