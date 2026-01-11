import { HttpException, HttpStatus } from '@nestjs/common';
import { ProblemDetailsBuilder } from './problem-details';

export class MinimumAmountException extends HttpException {
  constructor(minimumAmount: number, requestedAmount: number) {
    const problemDetails = ProblemDetailsBuilder.build(
      'minimum-amount-not-met',
      'Minimum Amount Not Met',
      HttpStatus.CONFLICT,
      `Withdrawal amount must be at least $${minimumAmount.toFixed(2)}`,
      '/withdrawals',
      {
        minimumAmount,
        requestedAmount,
      },
    );

    super(problemDetails, HttpStatus.CONFLICT);
  }
}
