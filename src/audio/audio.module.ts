import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioService } from './audio.service';
import { AudioResolver } from './audio.resolver';
import { Audio } from './entities/audio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audio])],
  providers: [AudioService, AudioResolver],
  exports: [AudioService],
})
export class AudioModule {}
