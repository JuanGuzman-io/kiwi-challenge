import { Controller, Get, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RewardsSummaryDto } from './dto/rewards-summary.dto';
import { PaginatedTransactionsDto } from './dto/paginated-transactions.dto';
import { Body, Post, ForbiddenException } from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';

const INCOME_ENABLED = process.env.NODE_ENV !== 'production';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get rewards balance summary for current user' })
  @ApiResponse({ status: 200, type: RewardsSummaryDto })
  async getSummary(@CurrentUser() user: any): Promise<RewardsSummaryDto> {
    return this.rewardsService.calculateBalance(user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated transaction history for current user' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: PaginatedTransactionsDto })
  async getTransactions(
    @CurrentUser() user: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTransactionsDto> {
    const l = limit ? Number(limit) : undefined;
    return this.rewardsService.getTransactionHistory(user.id, l);
  }

  @Post('income')
  @ApiOperation({ summary: 'Create INCOME transaction (dev/test only)', description: 'Adds a manual INCOME transaction for testing. Disabled in production.' })
  @ApiResponse({ status: 201, description: 'Income transaction created' })
  @ApiResponse({ status: 403, description: 'Disabled in production' })
  async createIncome(@CurrentUser() user: any, @Body() body: CreateIncomeDto) {
    if (!INCOME_ENABLED) throw new ForbiddenException('Income endpoint disabled in production');

    return this.rewardsService.createIncomeTransaction(user.id, body.amount, body.description);
  }
}
