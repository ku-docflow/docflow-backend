import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventManager } from './event-manager';

@Module({
	imports: [EventEmitterModule.forRoot()],
	providers: [EventManager],
	exports: [EventManager],
})
export class EventsModule { }
