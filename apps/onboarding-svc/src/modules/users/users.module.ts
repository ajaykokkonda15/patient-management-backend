import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersDB } from "./users.db";

@Module({
    controllers: [UsersController],
    providers: [UsersService, UsersDB],
})
export class UsersModule {}
