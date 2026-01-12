import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ example: 100.5, description: 'Amount to withdraw' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: '8a7d6c5b-4f3e-21d0-a123-9b8c7d6e5f4a' })
  @IsUUID()
  bankAccountId: string;

  @ApiProperty({ example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}
