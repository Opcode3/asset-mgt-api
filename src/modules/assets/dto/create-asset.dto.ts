import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]+$/, { message: 'Asset No must be alphanumeric' })
  assetNo: string;

  @IsString()
  @IsNotEmpty()
  serialNo: string;

  @IsString()
  @IsNotEmpty()
  assetType: string;

  @IsString()
  description: string;

  @IsString()
  imageUrls: string[];

  @IsString()
  location: string;


  
}
