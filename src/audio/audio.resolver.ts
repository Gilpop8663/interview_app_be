import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  UploadSpeechFileInput,
  UploadSpeechFileOutput,
} from './dtos/upload-speech-file.dto';
import { AudioService } from './audio.service';

@Resolver()
export class AudioResolver {
  constructor(private readonly audioService: AudioService) {}

  @Mutation(() => UploadSpeechFileOutput)
  async uploadSpeechFile(@Args('input') input: UploadSpeechFileInput) {
    return await this.audioService.saveFile(input);
  }
}
