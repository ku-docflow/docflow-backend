import {
	Controller,
	Post,
	UseGuards,
	Req,
	Body,
	HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('login')
	@UseGuards(FirebaseAuthGuard)
	@HttpCode(200)
	login(@Req() req: FirebaseRequest, @Body() dto: LoginDto) {
		const { id, email } = req.user;

		return this.authService.loginOrSignup(id, email, dto.provider);
	}
}
