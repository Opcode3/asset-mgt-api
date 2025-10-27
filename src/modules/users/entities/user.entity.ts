import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id?: string; // 👈 Add this line

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    enum: ['admin', 'assignee'],
    default: 'assignee',
  })
  role: string;

  @Prop({
    required: false,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @Prop({ default: false })
  isEmailVerified: boolean; // 👈 true after clicking verification link

  @Prop()
  verificationToken?: string; // 👈 temporary token for verification

  @Prop()
  verificationTokenExpires?: Date; // 👈 optional expiry timestamp

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
