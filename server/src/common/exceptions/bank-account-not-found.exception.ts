import { HttpException, HttpStatus } from '@nestjs/common';
import { ProblemDetailsBuilder } from './problem-details';

export class BankAccountNotFoundException extends HttpException {
  constructor(bankAccountId: string) {
    const problemDetails = ProblemDetailsBuilder.build(
      'bank-account-not-found',
      'Bank Account Not Found',
      HttpStatus.NOT_FOUND,
      'The specified bank account does not exist or is not accessible',
      '/withdrawals',
      {
        bankAccountId,
      },
    );

    super(problemDetails, HttpStatus.NOT_FOUND);
  }
}
