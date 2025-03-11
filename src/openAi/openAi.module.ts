import { Module } from '@nestjs/common';
import { OpenAiResolver } from './openAi.resolver';
import { OpenAiService } from './openAi.service';

@Module({
  providers: [OpenAiResolver, OpenAiService],
})
export class OpenAiModule {}
