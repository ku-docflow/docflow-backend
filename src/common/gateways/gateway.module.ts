import { Module } from "@nestjs/common";
import { UserGateway } from "./user.gateway";
import { EventsModule } from "../events/events.module.";

@Module({
	imports: [EventsModule],
	providers: [UserGateway],
})
export class GatewayModule { }
