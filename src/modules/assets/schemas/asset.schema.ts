import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssetDocument = Asset & Document;

@Schema({ timestamps: true })
export class Asset {
  @Prop({ required: true, unique: true })
  assetNo: string; // Alphanumeric asset number

  @Prop({ required: true, unique: true })
  serialNo: string;

  @Prop({ required: true })
  assetType: string;

  @Prop({ required: true, type: [String], default: [] }) // ⬅️ image URLs
  imageUrls: string[];

  @Prop()
  description: string;

  @Prop()
  location: string;

  @Prop({
    default: 'available',
    enum: ['available', 'assigned', 'maintenance', 'retired'],
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy?: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
