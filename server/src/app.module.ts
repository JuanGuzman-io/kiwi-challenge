import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { RewardsModule } from './rewards/rewards.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { IdentityGuard } from './common/guards/identity.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Logging
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        customProps: (req: any) => ({
          userId: req.user?.id,
        }),
        redact: {
          paths: ['req.headers.authorization'],
          remove: true,
        },
      },
    }),

    // Core modules
    PrismaModule,
    UsersModule,
    WithdrawalsModule,
    RewardsModule,
    BankAccountsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: IdentityGuard,
    },
  ],
})
export class AppModule {}
