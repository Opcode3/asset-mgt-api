import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  //   async create(createUserDto: CreateUserDto): Promise<User> {
  //     const createdUser = new this.userModel(createUserDto);

  //   // ✅ hash the password before saving
  //   const saltRounds = 10;
  //   createdUser.password = await bcrypt.hash(createUserDto.password, saltRounds);

  //     const token: string = crypto.randomBytes(32).toString('hex');

  //     // set token + expiry in DB
  //     createdUser.verificationToken = token;
  //     createdUser.verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 2);  // 2 hours from now

  //     // save user
  //     const savedUser = await createdUser.save();

  //     // send welcome mail
  //     await this.mailService.sendVerificationEmail(savedUser.email, savedUser.name);

  //     return savedUser;
  //   }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const token = crypto.randomBytes(32).toString('hex');

      const user = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        verificationToken: token,
        verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 2),
      });

      // ❗ You must save the user before sending the email
      const savedUser = await user.save();

      await this.mailService.sendVerificationEmail(
        createUserDto.email,
        token,
        createUserDto.password,
      );

      return savedUser;
    } catch (error) {
      // ✅ log full error for debugging

      console.error('❌ User creation failed:', error);
      if (error.code === 11000) {
        // Duplicate email
        // throw new ConflictException('Email already exists');

        throw new ConflictException('A user with this email already exists');
      }

      // throw new InternalServerErrorException('User creation failed');

      throw new InternalServerErrorException('Failed to create user');
      // rethrow so global filter still formats response
      // throw error;
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: User }> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
    }

    // generate JWT
    const payload = { sub: user._id, email: user.email };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET, // ⚡ make sure it's unique per app
      expiresIn: '1h',
      issuer: 'issuer.asset-mgt.com',
      audience: 'web-client',
    });

    return { access_token: token, user: user };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(currentUserId?: string): Promise<User[]> {
    if (!currentUserId) {
      throw new UnauthorizedException('Current user not found or unauthorized');
    }

    // if (currentUserId) {
    return this.userModel
      .find({ _id: { $ne: currentUserId } })
      .populate('createdBy', 'name email')
      .exec();
    // }
    // return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User with ID "${id}" not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser)
      throw new NotFoundException(`User with ID "${id}" not found`);
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`User with ID "${id}" not found`);
  }

  // 🟢 2. Verify user by token
  async verifyEmail(token: string): Promise<User> {
    const user = await this.userModel.findOne({ verificationToken: token });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token.');
    }

    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires < new Date()
    ) {
      throw new BadRequestException('Verification token has expired.');
    }

    user.isEmailVerified = true;
    user.status = 'active';
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    return await user.save();
  }
}
