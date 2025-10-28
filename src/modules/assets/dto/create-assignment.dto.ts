import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  assignedToEmail: string;

  @IsString()
  @IsNotEmpty()
  assignedToName: string;

  @IsString()
  @IsNotEmpty()
  assignedBy: string;

  @IsString()
  comment?: string;

  @IsString()
  returnedComment?: string;
}
