import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('login')
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Post('signup')
	signup(@Body() dto: SignupDto) {
		return this.authService.signup(dto);
	}

	@Post('logout')
	logout(@Body() dto: LogoutDto) {
		return this.authService.logout(dto);
	}
}
