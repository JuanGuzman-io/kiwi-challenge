import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ProblemDetailsBuilder } from '../exceptions/problem-details';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let problemDetails;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      // If the exception already has RFC 7807 format, use it
      if (
        typeof exceptionResponse === 'object' &&
        'type' in exceptionResponse &&
        'title' in exceptionResponse
      ) {
        problemDetails = exceptionResponse;
      } else {
        // Convert standard NestJS exception to RFC 7807
        const status = exception.getStatus();
        const message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || 'An error occurred';

        problemDetails = ProblemDetailsBuilder.build(
          this.getTypeFromStatus(status),
          this.getTitleFromStatus(status),
          status,
          message,
          request.url,
        );
      }
    } else {
      // Handle unknown errors
      problemDetails = ProblemDetailsBuilder.build(
        'internal-server-error',
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred',
        request.url,
      );
    }

    response
      .status(problemDetails.status)
      .header('Content-Type', 'application/problem+json')
      .json(problemDetails);
  }

  private getTypeFromStatus(status: number): string {
    const types: Record<number, string> = {
      400: 'validation-error',
      401: 'unauthorized',
      403: 'forbidden',
      404: 'not-found',
      409: 'conflict',
      500: 'internal-server-error',
    };
    return types[status] || 'error';
  }

  private getTitleFromStatus(status: number): string {
    const titles: Record<number, string> = {
      400: 'Validation Error',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      500: 'Internal Server Error',
    };
    return titles[status] || 'Error';
  }
}
