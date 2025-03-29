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
          'React에서 SyntheticEvent(합성 이벤트)란 무엇이며, 이벤트 핸들링은 어떻게 하나요?',
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
          'React의 Suspense와 Concurrent Mode(동시성 모드)는 무엇이며, 각각의 역할과 차이점은?',
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
      {
        id: 51,
        question:
          'JavaScript의 클래스(class)와 프로토타입(prototype)의 차이점은 무엇인가요?',
      },
      {
        id: 52,
        question:
          'CSS에서 Flexbox와 Grid 시스템을 사용할 때 각각의 장단점은 무엇인가요?',
      },
      {
        id: 53,
        question:
          'React에서 상태를 업데이트할 때, 직접적인 상태 변경을 피해야 하는 이유는 무엇인가요?',
      },
      {
        id: 54,
        question:
          'React에서 `useReducer` 훅은 언제 사용해야 하며, `useState`와 어떻게 다른가요?',
      },
      {
        id: 55,
        question:
          'React의 컴포넌트 리렌더링 최적화를 위해 어떤 기법을 사용하나요?',
      },
      {
        id: 56,
        question:
          'JavaScript에서 async/await을 사용할 때의 장점은 무엇이며, 콜백 지옥을 어떻게 해결하나요?',
      },
      {
        id: 57,
        question:
          'JavaScript의 `map()`과 `forEach()`의 차이점과 언제 각각을 사용해야 하는지 설명해주세요.',
      },
      {
        id: 58,
        question:
          'Event Bubbling과 Event Capturing의 차이점은 무엇이며, 이를 제어하는 방법은?',
      },
      {
        id: 59,
        question:
          'Single Page Application(SPA)와 Multi-Page Application(MPA)의 차이점은 무엇인가요?',
      },
      {
        id: 60,
        question:
          'CSS에서 가상 클래스(:hover, :focus 등)와 가상 요소(::before, ::after)의 차이점은 무엇인가요?',
      },
      {
        id: 61,
        question: 'WebSocket과 HTTP의 차이점은 무엇이며, 각각의 사용 사례는?',
      },
      {
        id: 62,
        question:
          'Service Worker란 무엇이며, PWA(Progressive Web App)에서 어떻게 활용되나요?',
      },
      {
        id: 63,
        question:
          '웹 성능 최적화를 위해 자주 사용하는 도구나 방법은 무엇인가요?',
      },
      {
        id: 64,
        question:
          'React에서 `shouldComponentUpdate`와 `React.memo`의 차이점은 무엇인가요?',
      },
      {
        id: 65,
        question:
          'TypeScript의 장점과 JavaScript와 비교했을 때의 주요 차이점은 무엇인가요?',
      },
      {
        id: 66,
        question:
          'ES6에서 화살표 함수(Arrow Function)의 특징과 일반 함수와의 차이점은 무엇인가요?',
      },
      {
        id: 67,
        question:
          'Web Accessibility (웹 접근성)를 개선하기 위한 주요 기술과 표준은 무엇인가요?',
      },
      {
        id: 68,
        question:
          'CSS에서 Transition과 Animation의 차이점과 각각의 사용 사례는 무엇인가요?',
      },
      {
        id: 69,
        question:
          'HTML5에서 새로 추가된 주요 요소와 그 사용 목적은 무엇인가요?',
      },
      {
        id: 70,
        question:
          'React에서 상태를 끌어올리기(lifting state up)란 무엇이며, 그 사용 사례는?',
      },
      {
        id: 71,
        question: 'React에서 `useRef` 훅의 사용 사례와 장점은 무엇인가요?',
      },
      {
        id: 72,
        question:
          'CSS에서 Grid 시스템을 사용하여 두 개의 열이 서로 다른 크기로 배치되는 방법을 설명해주세요.',
      },
      {
        id: 73,
        question: 'React에서 상태(state)와 속성(props)의 차이점은 무엇인가요?',
      },
      {
        id: 74,
        question:
          'React에서 컴포넌트를 렌더링할 때, key 값이 중요한 이유와 잘못된 key 값 사용 시 발생할 수 있는 문제는 무엇인가요?',
      },
      {
        id: 75,
        question:
          'ES6의 모듈 시스템(import/export)을 사용하면 어떤 이점이 있나요?',
      },
      {
        id: 76,
        question:
          'REST API와 SOAP API의 차이점과 각각의 사용 사례는 무엇인가요?',
      },
      {
        id: 77,
        question:
          'React에서 컴포넌트의 상태를 조건부로 업데이트하는 방법을 설명해주세요.',
      },
      {
        id: 78,
        question: 'JSX에서 조건부 렌더링을 구현하는 방법은 무엇인가요?',
      },
      {
        id: 79,
        question:
          'JavaScript에서 `bind()`, `call()`, `apply()` 메서드의 차이점은 무엇인가요?',
      },
      {
        id: 80,
        question:
          'CSS에서 Z-Index를 사용할 때 발생할 수 있는 문제점과 해결 방법은 무엇인가요?',
      },
      {
        id: 81,
        question:
          'React에서 `useState` 훅을 사용할 때, 상태 초기화가 비동기적으로 처리되는 이유는 무엇인가요?',
      },
      {
        id: 82,
        question:
          'HTTP/2와 HTTP/3에서의 성능 개선 사항과 주요 차이점은 무엇인가요?',
      },
      {
        id: 83,
        question: 'JavaScript에서 Set과 Map 객체의 차이점은 무엇인가요?',
      },
      {
        id: 84,
        question:
          'React에서 `useEffect` 훅을 사용하여 컴포넌트가 마운트될 때 API 요청을 보내는 방법을 설명해주세요.',
      },
      {
        id: 85,
        question: 'Progressive Web App(PWA)의 주요 특징과 이점을 설명해주세요.',
      },
      {
        id: 86,
        question:
          'React에서 `useMemo`와 `useCallback` 훅의 차이점은 무엇인가요?',
      },
      {
        id: 87,
        question:
          'JavaScript에서 `this` 키워드를 사용할 때, 화살표 함수와 일반 함수의 차이점은 무엇인가요?',
      },
      {
        id: 88,
        question:
          'Webpack에서 Babel을 사용하는 이유와 그 설정 방법은 무엇인가요?',
      },
      {
        id: 89,
        question:
          'React에서 동적 import를 사용하여 코드 스플리팅을 구현하는 방법을 설명해주세요.',
      },
      {
        id: 90,
        question: 'SASS와 LESS의 차이점과 각자의 장점은 무엇인가요?',
      },
      {
        id: 91,
        question:
          'React에서 컴포넌트의 라이프 사이클 메서드에 대해 설명해주세요.',
      },
      {
        id: 92,
        question:
          'JavaScript에서 `typeof`와 `instanceof`의 차이점은 무엇인가요?',
      },
      {
        id: 93,
        question: 'CSS에서 `calc()` 함수의 사용 방법과 장점은 무엇인가요?',
      },
      {
        id: 94,
        question:
          'React에서 폼(Form) 컴포넌트를 다룰 때, 상태 관리와 관련된 모범 사례는 무엇인가요?',
      },
      {
        id: 95,
        question:
          'WebAssembly(Wasm)란 무엇이며, 프론트엔드에서의 활용 가능성은 무엇인가요?',
      },
      {
        id: 96,
        question:
          'React에서 `React.memo`와 `PureComponent`의 차이점은 무엇인가요?',
      },
      {
        id: 97,
        question:
          'React에서 에러 바운더리(Error Boundary)를 사용하는 이유와 적용 방법을 설명해주세요.',
      },
      {
        id: 98,
        question:
          'SEO 최적화를 위한 React 애플리케이션의 모범 사례는 무엇인가요?',
      },
      {
        id: 99,
        question:
          'JavaScript에서 `for...in`과 `for...of`의 차이점은 무엇인가요?',
      },
      {
        id: 100,
        question: 'CSS에서 `opacity`와 `visibility`의 차이점은 무엇인가요?',
      },
      {
        id: 101,
        question:
          'React에서 `useReducer` 훅을 사용하는 경우와 `useState` 훅을 사용하는 경우의 차이점은 무엇인가요?',
      },
      {
        id: 102,
        question:
          'RESTful API에서 HTTP 메서드(GET, POST, PUT, DELETE)의 사용 목적과 차이점은 무엇인가요?',
      },
      {
        id: 103,
        question:
          'React에서 `useContext` 훅을 사용하는 이유와 이를 활용한 상태 관리 방법은 무엇인가요?',
      },
      {
        id: 104,
        question:
          'Web Components의 개념과 이를 사용하여 만든 웹 애플리케이션의 장점은 무엇인가요?',
      },
      {
        id: 105,
        question:
          'JavaScript에서 비동기 처리 방식인 `Promise`, `async/await`와 콜백 함수의 차이점은 무엇인가요?',
      },
      {
        id: 106,
        question:
          'CSS에서 `display: flex`와 `display: grid`의 차이점과 각각의 사용 사례는 무엇인가요?',
      },
      {
        id: 107,
        question:
          'React에서 조건부 렌더링을 위해 `&&` 연산자 외에 다른 방법으로 구현하는 방법을 설명해주세요.',
      },
      {
        id: 108,
        question: 'webpack에서 `loaders`와 `plugins`의 차이점은 무엇인가요?',
      },
      {
        id: 109,
        question:
          'HTTP 요청을 최적화하는 방법과 성능을 개선하기 위한 기술은 무엇인가요?',
      },
      {
        id: 110,
        question:
          'Jest나 Mocha와 같은 테스트 프레임워크를 사용하여 React 애플리케이션을 테스트하는 방법을 설명해주세요.',
      },
      {
        id: 111,
        question:
          'CSS에서 `z-index`의 작동 원리와 겹침 순서를 제어하는 방법은 무엇인가요?',
      },
      {
        id: 112,
        question:
          'HTTP/2의 주요 기능과 이를 사용하여 성능을 최적화하는 방법은 무엇인가요?',
      },
      {
        id: 113,
        question:
          'JavaScript에서 `call()`, `apply()`, `bind()`의 차이점은 무엇인가요?',
      },
      {
        id: 114,
        question:
          '`localStorage`, `sessionStorage`, `cookies`의 차이점과 사용 사례는 무엇인가요?',
      },
      {
        id: 115,
        question:
          '웹 성능을 개선하기 위한 주요 웹 Vitals(구글 Web Vitals) 지표는 무엇인가요?',
      },
      {
        id: 116,
        question:
          'React에서 상태 관리를 위해 `useState` 외에 어떤 방법이 있고, 각각의 장단점은 무엇인가요?',
      },
      {
        id: 117,
        question:
          'React에서 커스텀 훅(Custom Hook)의 사용 이유와 예시를 들어 설명해주세요.',
      },
      {
        id: 118,
        question:
          '브라우저의 렌더링 과정 중 CSSOM(CSS Object Model)과 DOM(Document Object Model)의 차이점은 무엇인가요?',
      },
      {
        id: 119,
        question:
          'React에서 `useRef` 훅의 사용 사례와 상태와의 차이점을 설명해주세요.',
      },
      {
        id: 120,
        question:
          'React에서의 `key` 속성은 왜 중요한지, 그리고 리스트 항목의 `key`를 선택하는 올바른 방법은 무엇인가요?',
      },
      {
        id: 121,
        question:
          'JavaScript의 비동기 처리에서 `setTimeout`과 `setInterval`의 차이점은 무엇인가요?',
      },
      {
        id: 122,
        question:
          '웹에서 폰트 로딩 최적화 방법과 성능에 미치는 영향은 무엇인가요?',
      },
      {
        id: 123,
        question:
          'Node.js에서 `callback hell`이란 무엇이며, 이를 피하기 위한 방법은 무엇인가요?',
      },
      {
        id: 124,
        question:
          '웹 애플리케이션에서 `Single Page Application(SPA)`와 `Multi-Page Application(MPA)`의 차이점은 무엇인가요?',
      },
      {
        id: 125,
        question:
          'React에서 `useEffect` 훅을 사용할 때 주의할 점과 최적화하는 방법은 무엇인가요?',
      },
      {
        id: 126,
        question:
          'webpack에서 코드 스플리팅(Code Splitting) 방법과 이를 사용하여 최적화하는 방법은 무엇인가요?',
      },
      {
        id: 127,
        question:
          'JavaScript에서 `event.preventDefault()`와 `event.stopPropagation()`의 차이점은 무엇인가요?',
      },
      {
        id: 128,
        question:
          '웹 애플리케이션에서 사용자 인증(Authentication)과 권한 부여(Authorization)의 차이점은 무엇인가요?',
      },
      {
        id: 129,
        question:
          'React에서 컴포넌트를 렌더링할 때 발생하는 최적화 문제와 이를 해결하는 방법은 무엇인가요?',
      },
      {
        id: 130,
        question:
          'HTTP 상태 코드 중 `401 Unauthorized`와 `403 Forbidden`의 차이점은 무엇인가요?',
      },
      {
        id: 131,
        question: 'JavaScript에서 `let`, `const`, `var`의 차이점은 무엇인가요?',
      },
      {
        id: 132,
        question:
          '자바스크립트에서 `this` 키워드가 동작하는 방식은 무엇인가요?',
      },
      {
        id: 133,
        question:
          '자바스크립트에서 `null`과 `undefined`의 차이점은 무엇인가요?',
      },
      {
        id: 134,
        question:
          '자바스크립트에서 클로저(Closure)란 무엇이고, 언제 유용하게 사용되나요?',
      },
      {
        id: 135,
        question:
          '자바스크립트에서 프로미스(Promise)와 콜백 함수의 차이점은 무엇인가요?',
      },
      {
        id: 136,
        question:
          'JavaScript에서 `forEach`, `map`, `filter`, `reduce`의 차이점은 무엇인가요?',
      },
      {
        id: 137,
        question:
          '자바스크립트에서 `async/await`와 `Promise`의 차이점은 무엇인가요?',
      },
      {
        id: 138,
        question:
          '자바스크립트에서 `bind()`, `call()`, `apply()`의 차이점은 무엇인가요?',
      },
      {
        id: 139,
        question:
          '자바스크립트에서 이벤트 위임(Event Delegation)이란 무엇인가요?',
      },
      {
        id: 140,
        question:
          '자바스크립트에서 `setTimeout()`과 `setInterval()`의 차이점은 무엇인가요?',
      },
      {
        id: 141,
        question:
          '자바스크립트에서 `deep copy`와 `shallow copy`의 차이점은 무엇인가요?',
      },
      {
        id: 142,
        question: '자바스크립트에서 `new` 연산자의 동작 방식은 무엇인가요?',
      },
      {
        id: 143,
        question: '자바스크립트에서 모듈화란 무엇이며, 어떻게 구현하나요?',
      },
      {
        id: 144,
        question:
          '자바스크립트에서 `event.target`과 `event.currentTarget`의 차이점은 무엇인가요?',
      },
      {
        id: 145,
        question:
          '자바스크립트에서 `try/catch`를 사용한 에러 처리 방법은 무엇인가요?',
      },
      {
        id: 146,
        question:
          '자바스크립트에서 `typeof`와 `instanceof`의 차이점은 무엇인가요?',
      },
      {
        id: 147,
        question:
          '자바스크립트에서 `prototype`이란 무엇이고, 어떻게 사용하나요?',
      },
      {
        id: 148,
        question:
          '자바스크립트에서 `Object.freeze()`와 `Object.seal()`의 차이점은 무엇인가요?',
      },
      {
        id: 149,
        question:
          '자바스크립트에서 `eval()` 함수의 사용법과 보안 문제는 무엇인가요?',
      },
      {
        id: 150,
        question:
          '자바스크립트에서 `Symbol` 데이터 타입은 무엇이며, 어떤 용도로 사용되나요?',
      },
      {
        id: 151,
        question:
          'TypeScript에서 `any`, `unknown`, `never`, `void` 타입의 차이점은 무엇인가요?',
      },
      {
        id: 152,
        question:
          'TypeScript에서 인터페이스와 타입 별칭(type alias)의 차이점은 무엇인가요?',
      },
      {
        id: 153,
        question:
          'TypeScript에서 제너릭(Generics)이란 무엇이며, 어떻게 사용하나요?',
      },
      {
        id: 154,
        question:
          'TypeScript에서 타입 추론(Type Inference)과 명시적 타입 선언의 차이점은 무엇인가요?',
      },
      {
        id: 155,
        question: 'TypeScript에서 `readonly`와 `const`의 차이점은 무엇인가요?',
      },
      {
        id: 156,
        question:
          'TypeScript에서 `never` 타입은 어떤 상황에서 사용되며, 어떤 의미가 있나요?',
      },
      {
        id: 157,
        question:
          'TypeScript에서 `as` 타입 단언(type assertion)과 `<>` 타입 단언의 차이점은 무엇인가요?',
      },
      {
        id: 158,
        question:
          'TypeScript에서 `enum`을 사용할 때의 장점과 주의할 점은 무엇인가요?',
      },
      {
        id: 159,
        question: 'TypeScript에서 `interface`와 `class`의 차이점은 무엇인가요?',
      },
      {
        id: 160,
        question: 'TypeScript에서 `tuple`과 `array`의 차이점은 무엇인가요?',
      },
      {
        id: 161,
        question:
          'TypeScript에서 `strict mode`란 무엇이며, 이를 활성화하는 이유는 무엇인가요?',
      },
      {
        id: 162,
        question:
          'TypeScript에서 `Optional Chaining`(?.)과 `Nullish Coalescing`(??)의 차이점은 무엇인가요?',
      },
      {
        id: 163,
        question:
          'TypeScript에서 `type`과 `interface`를 함께 사용하는 경우는 어떤 경우인가요?',
      },
      {
        id: 164,
        question:
          'TypeScript에서 `union type`과 `intersection type`의 차이점은 무엇인가요?',
      },
      {
        id: 165,
        question: 'TypeScript에서 `declaration merging`이란 무엇인가요?',
      },
      {
        id: 166,
        question:
          'TypeScript에서 `mapped types`란 무엇이며, 어떻게 사용하나요?',
      },
      {
        id: 167,
        question:
          'TypeScript에서 `conditional types`란 무엇이며, 어떤 용도로 사용되나요?',
      },
      {
        id: 168,
        question:
          'TypeScript에서 `default` 파라미터와 `optional` 파라미터의 차이점은 무엇인가요?',
      },
      {
        id: 169,
        question:
          'TypeScript에서 `readonly` 속성이 있는 객체의 특징은 무엇인가요?',
      },
      {
        id: 170,
        question:
          'TypeScript에서 `never` 타입의 값을 반환하는 함수는 어떤 경우에 사용되나요?',
      },
      {
        id: 171,
        question:
          'TDD(테스트 주도 개발)란 무엇이며, TDD의 주요 단계는 무엇인가요?',
      },
      {
        id: 172,
        question: 'TDD를 실무에서 사용했을 때의 장점과 단점은 무엇인가요?',
      },
      {
        id: 173,
        question:
          'CD(Continuous Delivery)와 CI(Continuous Integration)의 차이점은 무엇인가요?',
      },
      {
        id: 174,
        question:
          'CD(Continuous Delivery)를 실현하기 위한 주요 도구와 프로세스는 무엇인가요?',
      },
      {
        id: 175,
        question:
          '스토리북(Storybook)이란 무엇이며, 프론트엔드 개발에서 어떤 역할을 하나요?',
      },
      {
        id: 176,
        question:
          '스토리북을 사용하여 UI 컴포넌트를 문서화하는 장점은 무엇인가요?',
      },
      {
        id: 177,
        question:
          'Jest와 Mocha의 차이점은 무엇이며, 각각 어떤 상황에서 사용하는 것이 좋은가요?',
      },
      {
        id: 178,
        question:
          'React에서의 테스트 전략에 대해 설명해주세요. 컴포넌트 단위 테스트는 어떻게 구현하나요?',
      },
      {
        id: 179,
        question: 'TDD에서 "Red-Green-Refactor" 사이클에 대해 설명해주세요.',
      },
      {
        id: 180,
        question:
          '유닛 테스트와 통합 테스트의 차이점과 각각을 작성하는 방법은 무엇인가요?',
      },
      {
        id: 181,
        question:
          '테스트 커버리지란 무엇이며, 테스트 커버리지를 높이기 위한 방법은 무엇인가요?',
      },
      {
        id: 182,
        question: '모의 객체(Mock Object)와 스텁(Stub)의 차이점은 무엇인가요?',
      },
      {
        id: 183,
        question:
          '컴포넌트 테스트에서 shallow rendering과 full DOM rendering의 차이점은 무엇인가요?',
      },
      {
        id: 184,
        question:
          'React에서 enzyme 또는 Testing Library를 사용하여 컴포넌트 테스트를 어떻게 진행하나요?',
      },
      {
        id: 185,
        question:
          '스토리북에서 `addon`을 사용하여 어떤 기능을 확장할 수 있나요?',
      },
      {
        id: 186,
        question:
          'TDD 방식으로 개발할 때, 첫 번째로 작성해야 하는 테스트 케이스는 무엇인가요?',
      },
      {
        id: 187,
        question:
          '테스트 더블(Test Double)이란 무엇인가요? 모의 객체(Mock), 스텁(Stub), 스파이(Spy)의 차이점은 무엇인가요?',
      },
      {
        id: 188,
        question: 'Test-First Approach와 TDD의 차이점은 무엇인가요?',
      },
      {
        id: 189,
        question: '스토리북에서 "스토리"는 무엇이며, 어떻게 구성하나요?',
      },
      {
        id: 190,
        question:
          'React에서 `jest`와 `react-testing-library`를 사용하여 작성한 테스트가 잘못된 경우 어떻게 디버깅을 하나요?',
      },
      {
        id: 191,
        question:
          '프론트엔드 애플리케이션에서 상태 관리 라이브러리를 사용해야 하는 이유와 그에 따른 장점은 무엇인가요?',
      },
      {
        id: 192,
        question:
          '코드 스플리팅(Code Splitting) 기술을 사용하는 이유와 Webpack에서 이를 설정하는 방법은 무엇인가요?',
      },
      {
        id: 193,
        question:
          'React에서 Context API와 Redux를 비교했을 때, 어떤 상황에서 각각을 사용하는 것이 좋을까요?',
      },
      {
        id: 194,
        question:
          '리액트의 `useMemo`와 `useCallback`의 차이점은 무엇이며, 각각을 사용하는 적절한 상황은 언제인가요?',
      },
      {
        id: 195,
        question:
          'Vue.js와 React.js를 비교했을 때, 각각의 장단점은 무엇이고, 어떤 상황에 더 적합한가요?',
      },
      {
        id: 196,
        question:
          'Promise 객체와 async/await의 차이점은 무엇이며, 각각의 장단점은 무엇인가요?',
      },
      {
        id: 197,
        question:
          '웹 애플리케이션에서 보안 취약점(XSS, CSRF)을 예방하기 위한 방법은 무엇인가요?',
      },
      {
        id: 198,
        question:
          'Node.js에서 비동기 프로그래밍의 개념과 그 장점에 대해 설명해주세요.',
      },
      {
        id: 199,
        question:
          '다양한 웹 애플리케이션의 성능을 측정하고 최적화하는 방법은 무엇인가요?',
      },
      {
        id: 200,
        question:
          '웹 애플리케이션에서 SEO 최적화를 위한 필수 요소 5가지는 무엇인가요?',
      },
      {
        id: 201,
        question:
          'React에서 React Router의 사용법과 라우팅 성능을 최적화하는 방법은 무엇인가요?',
      },
      {
        id: 202,
        question:
          '웹 접근성(WA)이 중요한 이유와 이를 향상시키기 위한 개발자의 역할은 무엇인가요?',
      },
      {
        id: 203,
        question:
          'Firebase와 AWS Amplify의 차이점과 선택 기준에 대해 설명해주세요.',
      },
      {
        id: 204,
        question:
          'GraphQL과 REST API의 차이점과 GraphQL을 사용하는 이유는 무엇인가요?',
      },
      {
        id: 205,
        question:
          '프론트엔드에서 이벤트 버스(Event Bus) 패턴을 사용하는 이유와 사용 예시는 무엇인가요?',
      },
      {
        id: 206,
        question:
          'Service Worker를 사용하여 PWA(Progressive Web App)를 구현하는 방법은 무엇인가요?',
      },
      {
        id: 207,
        question:
          'Docker를 사용하여 프론트엔드 개발 환경을 설정하는 방법은 무엇인가요?',
      },
      {
        id: 208,
        question:
          '프론트엔드 애플리케이션에서 Caching 전략을 설정하는 방법과 그 중요성은 무엇인가요?',
      },
      {
        id: 209,
        question:
          'ES6에서 클래스(Classes)를 사용하는 이유와 함수 기반 컴포넌트와 클래스 컴포넌트의 차이점은 무엇인가요?',
      },
      {
        id: 210,
        question:
          '테스트 주도 개발(TDD)을 사용하여 프론트엔드 애플리케이션을 개발하는 절차와 그 이점은 무엇인가요?',
      },
    ];
  }

  async processInterviewAudio({
    file,
    question,
  }: ProcessInterviewAudioInput): Promise<ProcessInterviewAudioOutput> {
    const { answer } = await this.audioService.saveFile({
      file,
    });

    console.log('answer: ', answer);

    const { feedback } = await this.openAIService.generateInterviewFeedback({
      question,
      userAnswer: answer,
    });

    return { ok: true, feedback };
  }
}
