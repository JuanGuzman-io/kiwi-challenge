import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from './transaction.dto';

export class PaginatedTransactionsDto {
  @ApiProperty({ type: [TransactionDto] })
  transactions: TransactionDto[];

  @ApiProperty({ nullable: true, example: 'cursor-id' })
  nextCursor?: string | null;

  @ApiProperty({ example: true })
  hasMore: boolean;

  @ApiProperty({ example: 25 })
  count: number;
}
