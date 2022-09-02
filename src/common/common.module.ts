import { Module } from '@nestjs/common';
import { AxiosAdapter } from './interfaces/adapters/axios.adapter';

@Module({
  providers: [AxiosAdapter],
  exports: [AxiosAdapter],
})
export class CommonModule {}
