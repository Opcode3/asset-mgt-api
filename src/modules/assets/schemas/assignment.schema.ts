import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'Asset', required: true })
  assetId: Types.ObjectId; // Reference to Asset

  @Prop({ required: true })
  assignedToEmail: string;

  @Prop({ required: true })
  assignedToName: string;

  // @Prop({ required: true })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedBy: string; // Admin or staff assigning

  @Prop()
  comment?: string;

  @Prop()
  returnedComment?: string;

  @Prop({
    default: 'in_use',
    enum: ['in_use', 'returned'],
  })
  status: string;

  @Prop({ default: false })
  signed?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  collectedBy?: string;

  // 👇 Add these for TypeScript awareness
  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
