import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { UserService } from './user.service';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';
import { UpdateNameDto } from './dto/update_name.dto';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get('init')
	@UseGuards(FirebaseAuthGuard)
	async getUserInitData(@Req() req: FirebaseRequest) {
		const userId = req.user.id;
		return this.userService.getInitData(userId);
	}

	@Patch('name')
	@UseGuards(FirebaseAuthGuard)
	async updateName(
		@Req() req: FirebaseRequest,
		@Body() body: UpdateNameDto,
	) {
		const userId = req.user.id;
		const { first_name, last_name } = body;
		return this.userService.updateName(userId, first_name, last_name);
	}
}
