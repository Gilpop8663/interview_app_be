import { Injectable } from '@nestjs/common';
import { AudioService } from 'src/audio/audio.service';
import { OpenAiService } from 'src/openAi/openAi.service';
import {
  ProcessInterviewAudioInput,
  ProcessInterviewAudioOutput,
} from './dtos/process-interview-audio.dto';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly audioService: AudioService,
    private readonly openAIService: OpenAiService, // OpenAI or Gemini
  ) {}

  getInterviewQuestions() {
    return [
      {
        id: 1,
        question:
          'React에서 상태 관리는 어떤 방식으로 할 수 있으며, 각각의 장단점은 무엇인가요?',
      },
      {
        id: 2,
        question:
          '프레젠테이션 컴포넌트와 컨테이너 컴포넌트의 차이점과 역할은 무엇인가요?',
      },
      {
        id: 3,
        question: 'Virtual DOM이란 무엇이며, React에서 어떻게 활용되나요?',
      },
      {
        id: 4,
        question:
          'useEffect Hook의 의존성 배열을 다루는 방법과 주의할 점은 무엇인가요?',
      },
      { id: 5, question: 'Redux와 Context API의 사용 사례와 각각의 장단점은?' },
      {
        id: 6,
        question:
          'CSR(Client-Side Rendering)과 SSR(Server-Side Rendering)의 차이점과 활용 사례는?',
      },
      {
        id: 7,
        question:
          'Next.js의 getServerSideProps와 getStaticProps의 차이점과 언제 각각을 사용해야 하나요?',
      },
      {
        id: 8,
        question:
          'React에서 SyntheticEvent란 무엇이며, 이벤트 핸들링은 어떻게 하나요?',
      },
      {
        id: 9,
        question:
          'React에서 리스트를 렌더링할 때 key 속성이 필요한 이유와 적절한 key 값을 설정하는 방법은?',
      },
      {
        id: 10,
        question:
          'Reconciliation(재조정) 과정이란 무엇이며, React에서 어떻게 최적화되나요?',
      },
      {
        id: 11,
        question:
          'React 성능 최적화를 위한 주요 기법 5가지와 각각의 설명을 해주세요.',
      },
      {
        id: 12,
        question: '프론트엔드에서 성능을 개선하기 위한 최적화 기법 5가지는?',
      },
      {
        id: 13,
        question:
          'React의 Suspense와 Concurrent Mode는 무엇이며, 각각의 역할과 차이점은?',
      },
      {
        id: 14,
        question:
          '웹 접근성(WA)은 무엇이며, 이를 향상시키기 위해 개발자가 할 수 있는 방법은?',
      },
      {
        id: 15,
        question:
          'CORS(Cross-Origin Resource Sharing)란 무엇이며, 브라우저에서 이를 해결하는 방법은?',
      },
      {
        id: 16,
        question:
          '브라우저가 HTML, CSS, JavaScript를 받아서 렌더링하는 전체 과정(파싱, 레이아웃, 페인팅 등)은?',
      },
      {
        id: 17,
        question:
          '클로저(Closure)란 무엇이며, 어떤 상황에서 유용하게 사용할 수 있나요?',
      },
      {
        id: 18,
        question:
          '자바스크립트의 호이스팅(Hoisting)이란 무엇이며, 변수 선언과 함수 선언에 대해 각각 설명해주세요.',
      },
      {
        id: 19,
        question:
          '자바스크립트의 이벤트 루프(Event Loop)가 동작하는 방식과 콜백 큐, 마이크로태스크 큐의 차이점은?',
      },
      {
        id: 20,
        question:
          'Promise와 async/await의 차이점과 각각을 사용해야 하는 상황은?',
      },
      {
        id: 21,
        question: '시맨틱 태그란 무엇이며, 웹 접근성과 SEO에 미치는 영향은?',
      },
      {
        id: 22,
        question: 'CSS에서 Flexbox와 Grid의 차이점과 각각의 사용 사례는?',
      },
      {
        id: 23,
        question:
          'CSS position 속성의 종류(absolute, relative, fixed, sticky)와 각각의 동작 방식은?',
      },
      {
        id: 24,
        question:
          '반응형 웹 디자인(Responsive Web Design)을 구현하는 방법과 주요 기술은?',
      },
      { id: 25, question: 'CSS 성능 최적화를 위해 고려해야 할 3가지 방법은?' },
      {
        id: 26,
        question:
          'BEM(Block Element Modifier) 방법론이란 무엇이며, 어떤 장점이 있나요?',
      },
      { id: 27, question: 'z-index가 적용되지 않는 이유와 해결 방법은?' },
      {
        id: 28,
        question:
          'CSS에서 가상 요소(::before, ::after)의 주요 사용 사례 3가지는?',
      },
      {
        id: 29,
        question:
          '브라우저의 주요 구성 요소(렌더링 엔진, 네트워크, UI 등)와 각각의 역할은?',
      },
      {
        id: 30,
        question: '크로스 브라우징 이슈가 발생하는 이유와 해결 방법은?',
      },
      {
        id: 31,
        question:
          'Critical Rendering Path(중요 렌더링 경로)란 무엇이며, 성능을 개선하는 방법은?',
      },
      {
        id: 32,
        question:
          '리플로우(Reflow)와 리페인트(Repaint)의 차이점과 발생을 줄이는 방법은?',
      },
      {
        id: 33,
        question:
          '웹 폰트 사용이 페이지 성능에 미치는 영향과 최적화하는 방법은?',
      },
      {
        id: 34,
        question:
          '쿠키, 로컬 스토리지, 세션 스토리지의 차이점과 각각의 사용 사례는?',
      },
      {
        id: 35,
        question: 'HTTP와 HTTPS의 차이점과 HTTPS가 보안에 유리한 이유는?',
      },
      {
        id: 36,
        question:
          '자주 사용되는 HTTP 상태 코드 5가지(200, 301, 400, 403, 500)와 각각의 의미는?',
      },
      { id: 37, question: 'REST API와 GraphQL의 차이점과 각각의 장단점은?' },
      { id: 38, question: 'HTTP/2와 HTTP/3의 주요 차이점과 성능 개선 효과는?' },
      {
        id: 39,
        question: '브라우저에서 DNS 조회 과정과 이를 최적화하는 방법은?',
      },
      { id: 40, question: 'CSRF와 XSS 공격의 차이점과 이를 방어하는 방법은?' },
      {
        id: 41,
        question:
          '코드 스플리팅(Code Splitting)이란 무엇이며, Webpack에서 이를 적용하는 방법은?',
      },
      {
        id: 42,
        question:
          '프론트엔드에서 이미지 최적화를 위해 할 수 있는 3가지 방법은?',
      },
      {
        id: 43,
        question:
          'TTI(Time to Interactive)란 무엇이며, 이를 개선하기 위한 최적화 방법은?',
      },
      { id: 44, question: 'Lazy Loading이란 무엇이며, 이를 적용하는 방법은?' },
      {
        id: 45,
        question:
          'Lighthouse를 이용하여 웹사이트 성능을 분석하고 개선하는 방법은?',
      },
      {
        id: 46,
        question:
          '자바스크립트에서 this 키워드가 동작하는 방식과 주요 사용 사례는?',
      },
      { id: 47, question: 'ES6에서 추가된 주요 기능 5가지와 각각의 설명은?' },
      {
        id: 48,
        question: 'Map과 Object의 차이점과 각각을 사용해야 하는 상황은?',
      },
      {
        id: 49,
        question:
          '이벤트 위임(Event Delegation)이란 무엇이며, 어떤 상황에서 유용한가요?',
      },
      {
        id: 50,
        question: 'Debounce와 Throttle의 차이점과 각각의 활용 사례는?',
      },
    ];
  }

  async processInterviewAudio({
    file,
    question,
  }: ProcessInterviewAudioInput): Promise<ProcessInterviewAudioOutput> {
    const { answer } = await this.audioService.saveFile({ file });

    const { feedback } = await this.openAIService.generateInterviewFeedback({
      question,
      userAnswer: answer,
    });

    return { ok: true, feedback };
  }
}
