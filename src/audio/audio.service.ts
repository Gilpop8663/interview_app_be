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
import { exec } from 'child_process';

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
    const { habits, speed } = await this.analyzeSpeech(outputFilePath);

    // 파일 경로와 텍스트를 데이터베이스에 저장
    const audio = this.audioRepository.create({
      filePath: outputFilePath, // FLAC 파일 경로를 저장
      transcribedText,
    });

    await this.audioRepository.save(audio);

    return {
      ok: true,
      audioId: audio.id,
      answer: audio.transcribedText,
      habits,
      speed,
    };
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
      speechContexts: [
        {
          phrases: [
            // 영어
            'React',
            'useState',
            'useEffect',
            'useReducer',
            'Custom Hook',
            'Virtual DOM',
            'Reconciliation',
            'Redux',
            'Context API',
            'Flux architecture',
            'Provider',
            'Reducer',
            'CSR',
            'Client-Side Rendering',
            'SSR',
            'Server-Side Rendering',
            'Next.js',
            'getServerSideProps',
            'getStaticProps',
            'Static Generation',
            'React SyntheticEvent',
            'onClick',
            'onChange',
            'Fiber',
            'Repaint',
            'Reflow',
            'Lazy Loading',
            'Code Splitting',
            'Suspense',
            'Concurrent Mode',
            'ARIA attributes',
            'CORS',
            'Cross-Origin Resource Sharing',
            'Critical Rendering Path',
            'Closure',
            'Hoisting',
            'Event Loop',
            'Callback Queue',
            'Microtask Queue',
            'Promise',
            'async await',
            'Semantic tags',
            'SEO optimization',
            'Flexbox',
            'CSS Grid',
            'CSS position',
            'absolute',
            'relative',
            'fixed',
            'sticky',
            'Responsive Web Design',
            'Media Query',
            'CSS performance optimization',
            'BEM methodology',
            'z-index',
            'CSS pseudo-elements',
            'before',
            'after',
            'Cross-browser compatibility',
            'Rendering engine',
            'Browser network',
            'Browser UI',
            'HTTP',
            'HTTPS',
            'SSL certificate',
            'HTTP status codes',
            'REST API',
            'GraphQL',
            'HTTP/2',
            'HTTP/3',
            'DNS lookup',
            'DNS prefetch',
            'CSRF',
            'XSS',
            'Security vulnerabilities',
            'Webpack',
            'Tree Shaking',
            'Image optimization',
            'TTI',
            'Time to Interactive',
            'Lighthouse',
            'Website performance analysis',
            'this keyword',
            'JavaScript this',
            'bind',
            'call',
            'apply',
            'ES6 features',
            'Arrow function',
            'Template literals',
            'Destructuring',
            'Map object',
            'Object object',
            'Event delegation',
            'Debounce',
            'Throttle',
            'Scroll optimization',

            // 한글
            '리액트',
            '상태 관리',
            '유스스테이트',
            '유스이펙트',
            '유스리듀서',
            '리액트 훅',
            '커스텀 훅',
            '버츄얼 돔',
            '디핑 알고리즘',
            '리컨실리에이션',
            '리덕스',
            '컨텍스트 API',
            '플럭스 아키텍처',
            '프로바이더',
            '리듀서',
            '씨에스알',
            '클라이언트 사이드 렌더링',
            '에스에스알',
            '서버 사이드 렌더링',
            '넥스트 제이에스',
            '겟서버사이드프롭스',
            '겟스태틱프롭스',
            '스태틱 제너레이션',
            '리액트 신세틱이벤트',
            '온클릭',
            '온체인지',
            '파이버',
            '리페인트',
            '리플로우',
            '레이지 로딩',
            '코드 스플리팅',
            '서스펜스',
            '컨커런트 모드',
            '아리아 속성',
            '코르스',
            '크로스 오리진 리소스 셰어링',
            '크리티컬 렌더링 패스',
            '클로저',
            '호이스팅',
            '이벤트 루프',
            '콜백 큐',
            '마이크로태스크 큐',
            '프라미스',
            '어싱크 어웨이트',
            '시맨틱 태그',
            '에스이오 최적화',
            '플렉스박스',
            '씨에스에스 그리드',
            '씨에스에스 포지션',
            '앱솔루트',
            '릴레이티브',
            '픽스드',
            '스티키',
            '반응형 웹 디자인',
            '미디어 쿼리',
            '씨에스에스 성능 최적화',
            '벰 방법론',
            '지 인덱스',
            '씨에스에스 가상 요소',
            '비포',
            '애프터',
            '크로스 브라우징',
            '렌더링 엔진',
            '브라우저 네트워크',
            '브라우저 UI',
            '에이치티티피',
            '에이치티티피에스',
            '에스에스엘 인증서',
            '에이치티티피 상태 코드',
            '레스트 API',
            '그래프큐엘',
            '에이치티티피 2',
            '에이치티티피 3',
            '디엔에스 조회',
            '디엔에스 프리페치',
            '씨에스알에프',
            '엑스에스에스',
            '보안 취약점',
            '웹팩',
            '트리 쉐이킹',
            '이미지 최적화',
            '티티아이',
            '타임 투 인터랙티브',
            '라이트하우스',
            '웹사이트 성능 분석',
            '디스 키워드',
            '자바스크립트 디스',
            '바인드',
            '콜',
            '어플라이',
            '이이식스 기능',
            '화살표 함수',
            '템플릿 리터럴',
            '디스트럭처링',
            '맵 객체',
            '오브젝트 객체',
            '이벤트 위임',
            '디바운스',
            '스로틀',
            '스크롤 최적화',
          ],
          boost: 20,
        },
      ],
    };

    try {
      const [operation] = await this.client.longRunningRecognize(request);
      const [response] = await operation.promise();

      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join('\n');
      return transcription;
    } catch (error) {
      console.error('음성 인식 실패:', error);
      throw new Error('음성 인식 실패');
    }
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

  async analyzeSpeech(
    audioPath: string,
  ): Promise<{ speed: string; habits: string }> {
    const transcribedText = await this.transcribeAudio(audioPath);
    const audioDuration = await this.getAudioDuration(audioPath); // 음성 길이 계산

    const speed = this.calculateSpeechRate(audioDuration, transcribedText);
    const habits = this.analyzeHabitualPhrases(transcribedText);

    return { speed, habits };
  }
}
