import { Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value))
      throw new BadRequestException(`${value} is not a valid id`);
    return value;
  }
}
