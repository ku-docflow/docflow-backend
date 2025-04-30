import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { AppEventMap } from './types';

@Injectable()
export class EventManager {
	constructor(private readonly emitter: EventEmitter2) { }

	emit<K extends keyof AppEventMap>(event: K, payload: AppEventMap[K]) {
		this.emitter.emit(event, payload);
	}

	on<K extends keyof AppEventMap>(
		event: K,
		handler: (payload: AppEventMap[K]) => void,
	) {
		this.emitter.on(event, handler);
	}
}
