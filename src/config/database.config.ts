import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGO_URI || 'mongodb+srv://opcode3:1j0aVry7SIuD2Vh5@cluster-0.6n3mf.mongodb.net/asset-mgt',
}));
