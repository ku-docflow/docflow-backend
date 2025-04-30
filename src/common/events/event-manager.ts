import { EventEmitter2 } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
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

	once<K extends keyof AppEventMap>(
		event: K,
		handler: (payload: AppEventMap[K]) => void,
	) {
		this.emitter.once(event, handler);
	}

	off<K extends keyof AppEventMap>(
		event: K,
		handler: (payload: AppEventMap[K]) => void,
	) {
		this.emitter.off(event, handler);
	}
}
