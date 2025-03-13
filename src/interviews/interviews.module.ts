import { Module } from '@nestjs/common';
import { InterviewsResolver } from './interviews.resolver';
import { InterviewsService } from './interviews.service';
import { AudioService } from 'src/audio/audio.service';
import { OpenAiService } from 'src/openAi/openAi.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audio } from 'src/audio/entities/audio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audio])],
  providers: [
    InterviewsResolver,
    InterviewsService,
    AudioService,
    OpenAiService,
  ],
})
export class InterviewsModule {}
