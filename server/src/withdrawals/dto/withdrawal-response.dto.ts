import { ApiProperty } from '@nestjs/swagger';

export class WithdrawalResponseDto {
  @ApiProperty({ example: '5f6b8c7d-1234-4abc-9def-0123456789ab' })
  id: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  userId: string;

  @ApiProperty({ example: 100.5 })
  amount: number;

  @ApiProperty({ example: '8a7d6c5b-4f3e-21d0-a123-9b8c7d6e5f4a' })
  bankAccountId: string;

  @ApiProperty({ example: 'USD', required: false })
  currency?: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: '2026-01-10T12:00:00.000Z' })
  createdAt: string;
}
