import { Controller, Get } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BankAccountsResponseDto } from './dto/bank-accounts-response.dto';

@ApiTags('Bank Accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get linked bank accounts for current user' })
  @ApiResponse({ status: 200, type: BankAccountsResponseDto })
  async findAll(@CurrentUser() user: any): Promise<BankAccountsResponseDto> {
    return this.bankAccountsService.findAllByUserId(user.id);
  }
}
