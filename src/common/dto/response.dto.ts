import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty()
  data: T | null;

  constructor(success: boolean, message: string, data: T | null = null) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
