import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class CreateIncomeDto {
  @ApiProperty({ example: 50.0, description: 'Amount to credit to user balance' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Test top-up for QA', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
