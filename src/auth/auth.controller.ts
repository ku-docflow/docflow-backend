import { Controller, Post, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('login')
	@UseGuards(FirebaseAuthGuard)
	login(@Req() req: FirebaseRequest) {
		const { id, email } = req.user;

		return this.authService.loginOrSignup(id, email);
	}
}
