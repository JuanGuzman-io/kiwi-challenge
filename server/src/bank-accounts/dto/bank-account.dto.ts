import { ApiProperty } from '@nestjs/swagger';

export class BankAccountDto {
  @ApiProperty({ example: '8a7d6c5b-4f3e-21d0-a123-9b8c7d6e5f4a' })
  id: string;

  @ApiProperty({ example: '1234', description: 'Last 4 digits of the account' })
  lastFourDigits: string;

  @ApiProperty({ example: 'checking' })
  accountType: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-01-10T12:00:00.000Z' })
  createdAt: string;
}
