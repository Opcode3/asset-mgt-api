import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  assignedTo: string;

  @IsString()
  @IsNotEmpty()
  assignedBy: string;

  @IsString()
  comment?: string;
}
