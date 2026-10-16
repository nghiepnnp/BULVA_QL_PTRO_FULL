import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Check whether the API is running' })
  @ApiOkResponse({ description: 'API welcome message', type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test/:message')
  @ApiOperation({
    summary: 'Echo a test message through the application service',
  })
  @ApiParam({ name: 'message', type: String, description: 'Message to echo' })
  @ApiOkResponse({ description: 'Processed test message', type: String })
  test(@Param('message') message: string): string {
    return this.appService.testService(message);
  }
}
