import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { WithdrawalResponseDto } from './dto/withdrawal-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Withdrawals')
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a withdrawal' })
  @ApiBody({ type: CreateWithdrawalDto })
  @ApiResponse({ status: 201, description: 'Withdrawal created', type: WithdrawalResponseDto })
  create(
    @CurrentUser() user: any,
    @Body() createWithdrawalDto: CreateWithdrawalDto,
  ): Promise<WithdrawalResponseDto> {
    return this.withdrawalsService.create(user.id, createWithdrawalDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a withdrawal by id' })
  @ApiParam({ name: 'id', description: 'Withdrawal id' })
  @ApiResponse({ status: 200, description: 'Found withdrawal', type: WithdrawalResponseDto })
  findOne(@Param('id') id: string): Promise<WithdrawalResponseDto> {
    return this.withdrawalsService.findOne(id);
  }
}
