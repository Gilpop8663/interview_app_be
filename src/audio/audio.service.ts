import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audio } from './entities/audio.entity';
import { Repository } from 'typeorm';
import {
  UploadSpeechFileInput,
  UploadSpeechFileOutput,
} from './dtos/upload-speech-file.dto';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import speech, { protos } from '@google-cloud/speech';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class AudioService {
  private readonly client = new speech.SpeechClient();

  constructor(
    @InjectRepository(Audio)
    private audioRepository: Repository<Audio>,
  ) {}

  private async convertMp3ToFlac(
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .audioCodec('flac')
        .audioChannels(1)
        .on('end', () => {
          console.log(`파일 변환 완료: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error('파일 변환 실패:', err);
          reject(err);
        })
        .run();
    });
  }

  // 음성 파일 저장
  async saveFile({
    file,
  }: UploadSpeechFileInput): Promise<UploadSpeechFileOutput> {
    const base64Data = file.split(';base64,').pop();
    if (!base64Data) {
      throw new Error('잘못된 파일 형식입니다.');
    }

    // 파일 이름 설정 (임시로 timestamp를 파일 이름으로 사용)
    const fileName = `${Date.now()}.mp3`;
    // 디렉토리 생성 (없으면 생성)
    const directoryPath = join(__dirname, '..', 'uploads');
    await fsPromises.mkdir(directoryPath, { recursive: true });
    const filePath = join(__dirname, '..', 'uploads', fileName);

    const buffer = Buffer.from(base64Data, 'base64');
    try {
      await fsPromises.writeFile(filePath, buffer);
      console.log('파일 저장 성공:', filePath);
    } catch (err) {
      console.error('파일 저장 실패:', err);
      throw new Error('파일 저장 실패');
    }

    // MP3를 FLAC로 변환
    const outputFilePath = join(directoryPath, `${Date.now()}.flac`);
    await this.convertMp3ToFlac(filePath, outputFilePath);

    // 변환된 FLAC 파일을 사용하여 텍스트 변환
    const transcribedText = await this.transcribeAudio(outputFilePath);

    // 파일 경로와 텍스트를 데이터베이스에 저장
    const audio = this.audioRepository.create({
      filePath: outputFilePath, // FLAC 파일 경로를 저장
      transcribedText,
    });

    await this.audioRepository.save(audio);

    return { ok: true, feedback: '업로드 성공' };
  }

  private async transcribeAudio(audioPath: string): Promise<string> {
    const audio = {
      content: await fsPromises.readFile(audioPath, 'base64'),
    };

    const request = {
      audio,
      config: {
        encoding:
          protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.FLAC,
        languageCode: 'ko', // 언어 코드
      },
    };

    try {
      const [response] = await this.client.recognize(request);
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join('\n');
      return transcription;
    } catch (error) {
      console.error('음성 인식 실패:', error);
      throw new Error('음성 인식 실패');
    }
  }
}
