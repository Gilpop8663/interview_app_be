import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audio } from './entities/audio.entity';
import { Repository } from 'typeorm';
import { promises as fsPromises, createReadStream, unlink } from 'fs';
import { join } from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import OpenAI from 'openai';
import {
  UploadSpeechFileInput,
  UploadSpeechFileOutput,
} from './dtos/upload-speech-file.dto';
import { exec } from 'child_process';

@Injectable()
export class AudioService {
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(Audio)
    private audioRepository: Repository<Audio>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async convertMp3ToWav(
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav') // WAV 형식으로 변환
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => {
          console.log('Conversion successful:', outputPath);
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  async transcribeAudio(audioPath: string): Promise<string> {
    const audioStream = createReadStream(audioPath);

    const translation = await this.openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
    });

    return translation.text;
  }

  async saveFile({
    file,
  }: UploadSpeechFileInput): Promise<UploadSpeechFileOutput> {
    const directoryPath = join(__dirname, '..', 'uploads');
    await fsPromises.mkdir(directoryPath, { recursive: true });

    const mp3Path = join(directoryPath, `${Date.now()}.mp3`);
    const base64Data = file.replace(/^data:audio\/mp3;base64,/, ''); // Base64 헤더 제거
    const buffer = Buffer.from(base64Data, 'base64'); // Base64 디코딩
    await fsPromises.writeFile(mp3Path, buffer); // 이제 정상적인 MP3 파일 저장됨

    const wavPath = mp3Path.replace('.mp3', '.wav'); // 변환된 파일 경로

    try {
      // MP3 -> WAV 변환
      await this.convertMp3ToWav(mp3Path, wavPath);

      // Whisper API로 변환된 WAV 파일 전송
      const transcribedText = await this.transcribeAudio(wavPath);

      console.log(transcribedText);

      // 데이터베이스 저장
      const audio = this.audioRepository.create({
        filePath: wavPath,
        transcribedText,
      });
      await this.audioRepository.save(audio);

      return {
        ok: true,
        audioId: audio.id,
        answer: transcribedText,
      };
    } finally {
      await unlink(mp3Path, () => {}); // 변환된 WAV 삭제
      await unlink(wavPath, () => {}); // 변환된 WAV 삭제
    }
  }

  async analyzeSpeech(
    audioPath: string,
  ): Promise<{ speed: string; habits: string }> {
    const transcribedText = await this.transcribeAudio(audioPath);
    const audioDuration = await this.getAudioDuration(audioPath); // 음성 길이 계산

    const speed = this.calculateSpeechRate(audioDuration, transcribedText);
    const habits = this.analyzeHabitualPhrases(transcribedText);

    return { speed, habits };
  }

  calculateSpeechRate = (
    audioDuration: number,
    transcribedText: string,
  ): string => {
    const wordsPerMinute =
      (transcribedText.split(' ').length / audioDuration) * 60;

    if (wordsPerMinute > 150) {
      return '말하는 속도가 조금 빠릅니다. (분당 150단어 이상)\n말하는 속도가 빠른 편입니다. 천천히 말하는 연습을 해보세요. 중요한 내용을 전달할 때는 조금 더 여유를 가지고 말하는 것이 좋습니다.';
    } else if (wordsPerMinute < 90) {
      return '말하는 속도가 너무 느립니다. (분당 90단어 이하)';
    } else {
      return '말하는 속도가 적당합니다. (분당 90~150단어 사이)';
    }
  };

  analyzeHabitualPhrases = (transcribedText: string): string => {
    const habitualPhrases = ['음', '어', '그냥', '저기', '그럼']; // 예시
    let count = 0;

    habitualPhrases.forEach((phrase) => {
      const regex = new RegExp(phrase, 'g');
      count += (transcribedText.match(regex) || []).length;
    });

    if (count > 3) {
      return '말 중에 ‘음’, ‘어’와 같은 습관적인 표현이 많습니다. 지나치게 많이 사용하지 않도록 주의해보세요.\n‘음’, ‘어’와 같은 표현을 줄이는 연습을 해보세요. 이를 위해 주의 깊게 말할 때 천천히 생각하는 방법을 추천합니다.';
    } else {
      return '말 중에 자연스러운 표현들이 많았습니다. 좋은 습관을 유지하세요!';
    }
  };

  getAudioDuration = (audioPath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      exec(
        `ffprobe -i ${audioPath} -show_entries format=duration -v quiet -of csv="p=0"`,
        (err, stdout) => {
          if (err) reject(err);
          resolve(parseFloat(stdout.trim()));
        },
      );
    });
  };
}
