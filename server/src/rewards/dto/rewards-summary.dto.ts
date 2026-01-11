import { ApiProperty } from '@nestjs/swagger';

export class RewardsSummaryDto {
  @ApiProperty({ example: 123.45 })
  balance: number;

  @ApiProperty({ example: 'USD' })
  currency: string;
}
