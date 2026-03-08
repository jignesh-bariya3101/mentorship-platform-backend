import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

interface HandlerResponse {
  message?: string;
  data?: unknown;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value: HandlerResponse | unknown) => {
        if (
          value &&
          typeof value === 'object' &&
          ('message' in (value as object) || 'data' in (value as object))
        ) {
          const typedValue = value as HandlerResponse;
          return {
            success: true,
            message: typedValue.message ?? 'Request processed successfully',
            data: typedValue.data ?? null,
          };
        }

        return {
          success: true,
          message: 'Request processed successfully',
          data: value ?? null,
        };
      }),
    );
  }
}
