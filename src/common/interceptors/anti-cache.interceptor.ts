import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';

import {
  CACHE_CONTROL_HEADER,
  CACHE_CONTROL_VALUE,
  EXPIRES_HEADER,
  EXPIRES_VALUE,
  PRAGMA_HEADER,
  PRAGMA_VALUE,
} from '../constants/http-headers.constant';

@Injectable()
export class AntiCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();

    response.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);

    response.setHeader(PRAGMA_HEADER, PRAGMA_VALUE);

    response.setHeader(EXPIRES_HEADER, EXPIRES_VALUE);

    return next.handle();
  }
}
