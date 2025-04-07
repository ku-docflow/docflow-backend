import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from './org.entity';
import { CreateOrgDto } from './dto/create-org.dto';
import { EditOrgDto } from './dto/edit-org.dto';

@Injectable()
export class OrgService {
  constructor(
    @InjectRepository(Org)
    private readonly orgRepo: Repository<Org>,
  ) {}

  async create(dto: CreateOrgDto) {
    const org = this.orgRepo.create({
      name: dto.name,
      email: dto.email,
    });

    try {
      const saved = await this.orgRepo.save(org);
      return {
        success: true,
        org_id: saved.id,
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Organization name already exists.');
      }
      throw error;
    }
  }

  async edit(id: number, dto: EditOrgDto) {
    // check priviledges

    const result = await this.orgRepo.update(id, {
      name: dto.name,
      email: dto.email,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Organization not found');
    }

    return {
      success: true,
    };
  }

  async delete(id: number) {
    // check priviledges

    const result = await this.orgRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Organization not found');
    }

    return {
      success: true,
    };
  }
}
