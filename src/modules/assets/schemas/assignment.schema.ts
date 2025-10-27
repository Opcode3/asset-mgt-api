import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'Asset', required: true })
  assetId: Types.ObjectId; // Reference to Asset

  @Prop({ required: true })
  assignedTo: string; // Could later reference User

  @Prop({ required: true })
  assignedBy: string; // Admin or staff assigning

  @Prop()
  comment?: string;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
