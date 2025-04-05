import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
	login(dto: LoginDto) {
		return {
			success: true,
			userId: 'user123',
		};
	}

	signup(dto: SignupDto) {
		return {
			success: true,
			userId: 'user123',
		};
	}

	logout(dto: LogoutDto) {
		return {
			success: true,
		};
	}
}
