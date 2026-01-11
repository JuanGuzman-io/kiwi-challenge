import { HttpException, HttpStatus } from '@nestjs/common';
import { ProblemDetailsBuilder } from './problem-details';

export class InsufficientFundsException extends HttpException {
  constructor(currentBalance: number, requestedAmount: number) {
    const problemDetails = ProblemDetailsBuilder.build(
      'insufficient-funds',
      'Insufficient Funds',
      HttpStatus.CONFLICT,
      'Requested withdrawal amount exceeds available balance',
      '/withdrawals',
      {
        currentBalance,
        requestedAmount,
      },
    );

    super(problemDetails, HttpStatus.CONFLICT);
  }
}
