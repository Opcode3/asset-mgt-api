import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from './schemas/asset.schema';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import {
  CreateAssignmentDto,
  ReturnAssignmentDto,
} from './dto/create-assignment.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    private readonly mailService: MailService,
  ) {}

  async createAsset(dto: CreateAssetDto, creatorId: string): Promise<Asset> {
    try {
      const asset = new this.assetModel({ ...dto, createdBy: creatorId });
      return await asset.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Asset No or Serial No already exists');
      }
      throw error;
    }
  }

  // async assignAsset(
  //   dto: CreateAssignmentDto,
  //   creatorId: string,
  // ): Promise<Assignment> {
  //   const asset = await this.assetModel.findById(dto.assetId);
  //   if (!asset) throw new NotFoundException('Asset not found');

  //   asset.status = 'assigned';
  //   await asset.save();

  //   const assignment = new this.assignmentModel({
  //     ...dto,
  //     assignedBy: creatorId,
  //   });

  //   const savedAssignedAsset = await assignment.save();

  //   //   to: string,
  //   // assigneeName: string,
  //   // assignedId: string,
  //   // assetDetails: {
  //   //   assetType: string;
  //   //   serialNo: string;
  //   //   location: string;
  //   //   description?: string;
  //   // }

  //   await this.mailService.sendAssetAssignmentEmail(
  //     dto.assignedToEmail,
  //     dto.assignedToName,
  //     String(savedAssignedAsset._id),
  //     {
  //       assetType: asset.assetType,
  //       serialNo: asset.serialNo,
  //       location: asset.location,
  //       description: dto.comment || '',
  //     },
  //   );

  //   return savedAssignedAsset;
  // }

  async assignAsset(
    dto: CreateAssignmentDto,
    creatorId: string,
  ): Promise<AssignmentDocument> {
    try {
      const asset = await this.assetModel.findById(dto.assetId);
      if (!asset) throw new NotFoundException('Asset not found');

      asset.status = 'assigned';
      await asset.save();

      const assignment = new this.assignmentModel({
        ...dto,
        assignedBy: creatorId,
      });

      const savedAssignedAsset = await assignment.save();

      // ✅ Use String() to safely convert `_id`
      try {
        await this.mailService.sendAssetAssignmentEmail(
          dto.assignedToEmail,
          dto.assignedToName,
          String(savedAssignedAsset._id),
          {
            assetType: asset.assetType,
            serialNo: asset.serialNo,
            location: asset.location,
            description: dto.comment || '',
          },
        );
      } catch (mailError) {
        console.error('Failed to send asset assignment email', mailError);
      }

      return savedAssignedAsset;
    } catch (error) {
      console.error('Error assigning asset', error);

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Failed to assign asset. Please try again later.',
      );
    }
  }

  // async returnAsset(
  //   dto: ReturnAssignmentDto,
  //   creatorId: string,
  // ): Promise<AssignmentDocument> {
  //   try {
  //     // const assignment = await this.assignmentModel
  //     //   .findById(dto.assignmentId)
  //     //   .populate('assetId');

  //     const assignment = await this.assignmentModel
  //       .findById(dto.assignmentId)
  //       .populate<{ assetId: AssetDocument }>('assetId')
  //       .exec();

  //     if (!assignment) throw new NotFoundException('Assignment not found');

  //     const asset = assignment.assetId;
  //     if (!asset) throw new NotFoundException('Associated asset not found');

  //     // Update assignment status and returned comment
  //     assignment.status = 'returned';
  //     assignment.returnedComment = dto.returnedComment;
  //     assignment.updatedAt = new Date(); // Update the timestamp
  //     const savedAssignment = await assignment.save();

  //     // Update asset status
  //     asset.status = 'returned'; // Assuming `returned` is a valid status in your asset model
  //     await asset.save();

  //     return savedAssignment;
  //   } catch (error) {
  //     console.error('Error returning asset', error);
  //     if (error instanceof NotFoundException) throw error;
  //     throw new InternalServerErrorException(
  //       'Failed to return asset. Please try again later.',
  //     );
  //   }
  // }

  async returnAsset(
    dto: ReturnAssignmentDto,
    creatorId: string,
  ): Promise<AssignmentDocument> {
    try {
      // 1️⃣ Get the assignment first
      const assignment = await this.assignmentModel.findById(dto.assignmentId);
      if (!assignment) throw new NotFoundException('Assignment not found');

      // 2️⃣ Get the related asset using the assetId
      const asset = await this.assetModel.findById(assignment.assetId);
      if (!asset) throw new NotFoundException('Associated asset not found');

      // 3️⃣ Update the assignment details
      assignment.status = 'returned';
      assignment.returnedComment = dto.returnedComment;
      assignment.collectedBy = creatorId;
      // assignment.updatedAt = new Date();
      const savedAssignment = await assignment.save();

      // 4️⃣ Update the asset status
      asset.status = dto.assetStatus || 'available'; // use provided status or fallback
      await asset.save();

      // 5️⃣ Return the updated assignment
      return savedAssignment;
    } catch (error) {
      console.error('Error returning asset', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to return asset. Please try again later.',
      );
    }
  }

  async signedAssignmentAsset(
    assignmentId: string,
  ): Promise<AssignmentDocument> {
    try {
      // 1️⃣ Get the assignment first
      const assignment = await this.assignmentModel.findById(assignmentId);
      if (!assignment) throw new NotFoundException('Assignment not found');

      assignment.signed = true;
      const savedAssignment = await assignment.save();

      // 5️⃣ Return the updated assignment
      return savedAssignment;

    } catch (error) {
      
      console.error('Error returning asset', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to return asset. Please try again later.',
      );
    }
  }

  async getAllAssets() {
    return await this.assetModel
      .find()
      .populate('createdBy', 'name email')
      .exec();
  }

  async getAssignedAssets(userId: string) {
    try {
      const assignments = await this.assignmentModel
        .find({ assignedTo: userId })
        .populate({
          path: 'assetId',
          model: 'Asset',
          select:
            'assetNo serialNo assetType imageUrls description location status',
        })
        .populate({
          path: 'assignedBy',
          model: 'User',
          select: 'name email role',
        })
        .exec();

      if (!assignments.length) {
        return [];
      }

      return assignments.map((assignment) => {
        const asset = assignment.assetId as any;
        const assignedBy = assignment.assignedBy as any;

        return {
          id: String(assignment._id),
          status: assignment.status,
          comment: assignment.comment || '',
          returnedComment: assignment.returnedComment || '',
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,

          assignedTo: {
            name: assignment.assignedToName,
            email: assignment.assignedToEmail,
          },

          assignedBy: assignedBy
            ? {
                id: assignedBy._id?.toString(),
                name: assignedBy.name,
                email: assignedBy.email,
                role: assignedBy.role,
              }
            : null,

          asset: asset
            ? {
                id: asset._id?.toString(),
                assetNo: asset.assetNo,
                serialNo: asset.serialNo,
                assetType: asset.assetType,
                imageUrls: asset.imageUrls || [],
                description: asset.description,
                location: asset.location,
                status: asset.status,
              }
            : null,
        };
      });
    } catch (error) {
      console.error('Error fetching assigned assets:', error);
      throw new Error('Unable to fetch assigned assets');
    }
  }

  // ✅ Get assigned assets for a specific user
  // async getAssignedAssets(userId: string) {
  //   // Step 1: Find all assignments for this user
  //   const assignments = await this.assignmentModel
  //     .find({ assignedTo: userId })
  //     .populate('assetId')
  //     .exec();

  //   // Step 2: Extract and return the actual asset documents
  //   return assignments.map((assign) => assign.assetId);
  // }

  // ✅ Get all assignments (for admin)
  // async getAllAssignments() {
  //   return await this.assignmentModel
  //     .find()
  //     .populate('assetId', 'assetNo assetType serialNo location description')
  //     .sort({ createdAt: -1 })
  //     .exec();
  // }

  async getAllAssignments() {
    try {
      const assignments = await this.assignmentModel
        // .find()
        .find({ status: { $ne: 'returned' } })
        .populate({
          path: 'assetId',
          model: 'Asset',
          select:
            'assetNo serialNo assetType imageUrls description location status',
        })
        .populate({
          path: 'assignedBy',
          model: 'User',
          select: 'name email role',
        })
        .sort({ createdAt: -1 })
        .exec();

      if (!assignments.length) return [];

      return assignments.map((assignment) => {
        const asset = assignment.assetId as any;
        const assignedBy = assignment.assignedBy as any;
        const collectedBy = assignment.collectedBy as any;

        return {
          id: String(assignment._id),
          status: assignment.status,
          comment: assignment.comment ?? '',
          returnedComment: assignment.returnedComment ?? '',
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
          assignedTo: {
            name: assignment.assignedToName,
            email: assignment.assignedToEmail,
          },
          assignedBy: assignedBy
            ? {
                id: assignedBy._id?.toString(),
                name: assignedBy.name,
                email: assignedBy.email,
                role: assignedBy.role,
              }
            : null,
          collectedBy: collectedBy
            ? {
                id: collectedBy._id?.toString(),
                name: collectedBy.name,
                email: collectedBy.email,
                role: collectedBy.role,
              }
            : null,
          asset: asset
            ? {
                id: asset._id?.toString(),
                assetNo: asset.assetNo,
                serialNo: asset.serialNo,
                assetType: asset.assetType,
                imageUrls: asset.imageUrls ?? [],
                description: asset.description,
                location: asset.location,
                status: asset.status,
              }
            : null,
        };
      });
    } catch (error) {
      console.error('❌ Error fetching all assignments:', error);
      throw new Error('Unable to fetch all assignments');
    }
  }

  async getReturnedAssignments() {
    try {
      const assignments = await this.assignmentModel
        .find({ status: 'returned' }) // 👈 filter for returned only
        .populate({
          path: 'assetId',
          model: 'Asset',
          select:
            'assetNo serialNo assetType imageUrls description location status',
        })
        .populate({
          path: 'assignedBy',
          model: 'User',
          select: 'name email role',
        })
        .sort({ createdAt: -1 })
        .exec();

      if (!assignments.length) return [];

      return assignments.map((assignment) => {
        const asset = assignment.assetId as any;
        const assignedBy = assignment.assignedBy as any;
        const collectedBy = assignment.collectedBy as any;

        return {
          id: String(assignment._id),
          status: assignment.status,
          comment: assignment.comment ?? '',
          returnedComment: assignment.returnedComment ?? '',
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
          assignedTo: {
            name: assignment.assignedToName,
            email: assignment.assignedToEmail,
          },
          assignedBy: assignedBy
            ? {
                id: assignedBy._id?.toString(),
                name: assignedBy.name,
                email: assignedBy.email,
                role: assignedBy.role,
              }
            : null,
          collectedBy: collectedBy
            ? {
                id: collectedBy._id?.toString(),
                name: collectedBy.name,
                email: collectedBy.email,
                role: collectedBy.role,
              }
            : null,
          asset: asset
            ? {
                id: asset._id?.toString(),
                assetNo: asset.assetNo,
                serialNo: asset.serialNo,
                assetType: asset.assetType,
                imageUrls: asset.imageUrls ?? [],
                description: asset.description,
                location: asset.location,
                status: asset.status,
              }
            : null,
        };
      });
    } catch (error) {
      console.error('❌ Error fetching returned assignments:', error);
      throw new Error('Unable to fetch returned assignments');
    }
  }
}
