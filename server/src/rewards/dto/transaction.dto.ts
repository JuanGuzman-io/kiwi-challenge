import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ example: '5f6b8c7d-1234-4abc-9def-0123456789ab' })
  id: string;

  @ApiProperty({ example: 'CASHBACK' })
  type: string;

  @ApiProperty({ example: 12.34 })
  amount: number;

  @ApiProperty({ example: 'Order #1234 cashback' })
  description: string;

  @ApiProperty({ example: '2026-01-10T12:00:00.000Z' })
  createdAt: string;
}
