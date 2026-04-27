import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

import { DbService } from "./db.service";

@Global()
@Module({})

export class DbModule {
    static forRoot(): DynamicModule {
        return {
            module: DbModule,
            providers: [DbService],
            exports: [DbService],
            imports: [
                TypeOrmModule.forRootAsync({
                    useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
                        type: 'postgres',
                        host: configService.getOrThrow<string>("POSTGRES_HOST"),
                        port: +(configService.getOrThrow<number>("POSTGRES_PORT")),
                        username: configService.getOrThrow<string>("POSTGRES_USER"),
                        password: configService.getOrThrow<string>("POSTGRES_PASSWORD"),
                        database: configService.getOrThrow<string>("POSTGRES_DB"),
                        entities: [],
                        synchronize: false,
                    }),
                    inject: [ConfigService],
                }),
            ],
        }
    }
}