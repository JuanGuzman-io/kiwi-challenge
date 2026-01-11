import { ApiProperty } from '@nestjs/swagger';
import { BankAccountDto } from './bank-account.dto';

export class BankAccountsResponseDto {
  @ApiProperty({ type: [BankAccountDto] })
  accounts: BankAccountDto[];

  @ApiProperty({ example: 2 })
  count: number;
}
