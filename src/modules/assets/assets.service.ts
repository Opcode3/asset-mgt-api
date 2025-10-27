import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from './schemas/asset.schema';
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
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

  async assignAsset(dto: CreateAssignmentDto): Promise<Assignment> {
    const asset = await this.assetModel.findById(dto.assetId);
    if (!asset) throw new NotFoundException('Asset not found');

    asset.status = 'assigned';
    await asset.save();

    const assignment = new this.assignmentModel(dto);
    return await assignment.save();
  }

  async getAllAssets() {
    return await this.assetModel
      .find()
      .populate('createdBy', 'name email')
      .exec();
  }

  // ✅ Get assigned assets for a specific user
  async getAssignedAssets(userId: string) {
    // Step 1: Find all assignments for this user
    const assignments = await this.assignmentModel
      .find({ assignedTo: userId })
      .populate('assetId')
      .exec();

    // Step 2: Extract and return the actual asset documents
    return assignments.map((assign) => assign.assetId);
  }

  // ✅ Get all assignments (for admin)
  async getAllAssignments() {
    return await this.assignmentModel
      .find()
      .populate('assetId', 'assetNo assetType serialNo location description')
      .sort({ createdAt: -1 })
      .exec();
  }
}
