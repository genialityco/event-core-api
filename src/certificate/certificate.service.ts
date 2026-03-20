import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Certificate } from './interfaces/certificate.interface';
import { Model, Types } from 'mongoose';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

@Injectable()
export class CertificateService {
  constructor(
    @InjectModel('Certificate') private certificateModel: Model<Certificate>,
  ) {}

  async create(certificateDto: CreateCertificateDto): Promise<Certificate> {
    const newCertificate = new this.certificateModel(certificateDto);
    return newCertificate.save();
  }

  async update(id: string, certificateDto: UpdateCertificateDto): Promise<Certificate | null> {
    return this.certificateModel
      .findByIdAndUpdate(
        id,
        { $set: { elements: certificateDto.elements } },
        { new: true },
      )
      .exec();
  }

  async findByEvent(eventId: string): Promise<Certificate[]> {
    return this.certificateModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .exec();
  }

  async findOne(id: string): Promise<Certificate | null> {
    return this.certificateModel.findById(id).exec();
  }

  async remove(id: string): Promise<Certificate | null> {
    return this.certificateModel.findByIdAndDelete(id).exec();
  }
}
