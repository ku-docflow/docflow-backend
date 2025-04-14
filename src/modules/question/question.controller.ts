import {Controller, Post, UseGuards} from '@nestjs/common';
import {FirebaseAuthGuard} from "../../common/guards/firebase-auth.guard";

@UseGuards(FirebaseAuthGuard)
@Controller('question')
export class QuestionController {


}

