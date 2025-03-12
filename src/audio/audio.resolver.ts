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
    await this.audioService.saveFile(input);

    return {
      ok: true,
      feedback: '파일이 성공적으로 업로드되었습니다.',
    };
  }
}
