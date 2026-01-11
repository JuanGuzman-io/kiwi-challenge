import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { ProblemDetailsBuilder } from '../exceptions/problem-details';

@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];

    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const allowFallback = this.configService.get<boolean>(
      'ALLOW_IDENTITY_FALLBACK',
      true,
    );
    const defaultUserId = this.configService.get<string>(
      'DEFAULT_TEST_USER_ID',
      'test-user-001',
    );

    // In production, require x-user-id header
    if (nodeEnv === 'production' && !userId) {
      const problemDetails = ProblemDetailsBuilder.build(
        'unauthorized',
        'Unauthorized',
        401,
        'Missing x-user-id header in production environment',
        request.url,
      );
      throw new UnauthorizedException(problemDetails);
    }

    // In dev/test, allow fallback to default user if configured
    const effectiveUserId =
      userId || (allowFallback ? defaultUserId : null);

    if (!effectiveUserId) {
      const problemDetails = ProblemDetailsBuilder.build(
        'unauthorized',
        'Unauthorized',
        401,
        'Missing x-user-id header',
        request.url,
      );
      throw new UnauthorizedException(problemDetails);
    }

    // Look up user
    const user = await this.usersService.findById(effectiveUserId);

    if (!user) {
      const problemDetails = ProblemDetailsBuilder.build(
        'unauthorized',
        'Unauthorized',
        401,
        'Invalid user identifier',
        request.url,
      );
      throw new UnauthorizedException(problemDetails);
    }

    // Attach user to request
    request.user = user;

    return true;
  }
}
