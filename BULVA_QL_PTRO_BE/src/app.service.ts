import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Test ';
  }
  testService(message: string): string {
    return 'Ok : ' + message;
  }
}
 