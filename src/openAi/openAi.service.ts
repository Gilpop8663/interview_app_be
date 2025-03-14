import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
  GenerateChatInput,
  GenerateChatOutput,
} from './dtos/generate-chat.dto';
import { logErrorAndThrow } from 'src/utils';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GenerateInterviewQuestionInput,
  GenerateInterviewQuestionOutput,
} from './dtos/generate-interview-question.dto';
import {
  GenerateInterviewFeedbackInput,
  GenerateInterviewFeedbackOutput,
} from './dtos/genertate-interview-feedback.dto';

@Injectable()
export class OpenAiService {
  private openAi: OpenAI;
  private genAI: GoogleGenerativeAI;
  private userQuestions: Map<string, string[]>;

  constructor(private readonly i18n: I18nService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    this.openAi = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.userQuestions = new Map();
  }

  async generateInterviewGeminiQuestion({
    userId,
    jobTitle,
    yearsOfExperience,
    preferredLanguage,
  }: GenerateInterviewQuestionInput): Promise<GenerateInterviewQuestionOutput> {
    try {
      let prompt = `Generate an interview question for a ${jobTitle} with ${yearsOfExperience} years of experience, preferred language: ${preferredLanguage}.`;

      const previousQuestions = this.userQuestions.get(userId) || [];

      if (previousQuestions.length > 0) {
        // 모든 이전 질문을 연결하여 전달
        const previousQuestionsList = previousQuestions.join(' ');
        prompt = `Generate a new interview question for a ${jobTitle} with ${yearsOfExperience} years of experience, preferred language: ${preferredLanguage}, that doesn't overlap with the previous questions: "${previousQuestionsList}".`;
      }

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash', // 사용하고자 하는 Gemini 모델을 명시
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
      });

      const result = await model.generateContent(prompt);

      const generatedQuestion = result.response.text(); // Gemini에서 생성된 응답 내용

      if (generatedQuestion.length === 0) {
        throw new Error('No response from Gemini');
      }

      const newQuestion = generatedQuestion;

      // 새 질문을 이전 질문 목록에 추가
      previousQuestions.push(newQuestion);

      // Map에 업데이트
      this.userQuestions.set(userId, previousQuestions);

      return {
        ok: true,
        question: generatedQuestion,
      };
    } catch (error) {
      return this.generateInterviewQuestion({
        userId,
        jobTitle,
        yearsOfExperience,
        preferredLanguage,
      });
    }
  }

  async generateInterviewQuestion({
    userId,
    jobTitle,
    yearsOfExperience,
    preferredLanguage,
  }: GenerateInterviewQuestionInput): Promise<GenerateInterviewQuestionOutput> {
    try {
      let prompt = `Generate an interview question for a ${jobTitle} with ${yearsOfExperience} years of experience, preferred language: ${preferredLanguage}.`;

      const previousQuestions = this.userQuestions.get(userId) || [];

      if (previousQuestions.length > 0) {
        // 모든 이전 질문을 연결하여 전달
        const previousQuestionsList = previousQuestions.join(' ');
        prompt = `Generate a new interview question for a ${jobTitle} with ${yearsOfExperience} years of experience, preferred language: ${preferredLanguage}, that doesn't overlap with the previous questions: "${previousQuestionsList}".`;
      }

      const result = await this.openAi.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      });

      if (!result.choices || result.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      const newQuestion = result.choices[0].message.content;

      // 새 질문을 이전 질문 목록에 추가
      previousQuestions.push(newQuestion);

      // Map에 업데이트
      this.userQuestions.set(userId, previousQuestions);

      return {
        ok: true,
        question: newQuestion,
      };
    } catch (error) {
      console.error('Error generating question:', error);
      throw new Error('Error generating question');
    }
  }

  async correctSpeechTextGemini(rawText: string) {
    try {
      const prompt = `
  아래의 텍스트는 프론트엔드에 관한 면접 내용입니다. 가능한 한 최소한으로 자연스러운 표현으로 다듬어 주세요. 너무 많이 변환하지 말고, 의미를 크게 변경하지 않도록 해 주세요:
  "${rawText}"
`;

      // Gemini 모델로 피드백을 생성
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
      });

      const result = await model.generateContent(prompt);

      const generatedFeedback = result.response.text(); // Gemini에서 생성된 피드백

      if (generatedFeedback.length === 0) {
        throw new Error('No response from Gemini');
      }

      return {
        ok: true,
        translatedText: generatedFeedback,
      };
    } catch (error) {
      // Gemini에서 실패 시 fallback
      return this.correctSpeechTextChatGPT(rawText);
    }
  }

  async correctSpeechTextChatGPT(rawText: string) {
    try {
      const prompt = `
  아래의 텍스트는 프론트엔드에 관한 면접 내용입니다. 가능한 한 최소한으로 자연스러운 표현으로 다듬어 주세요. 너무 많이 변환하지 말고, 의미를 크게 변경하지 않도록 해 주세요:
  "${rawText}"
`;

      // OpenAI GPT 모델로 피드백을 생성
      const result = await this.openAi.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.5,
      });

      if (!result.choices || result.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      return {
        ok: true,
        translatedText: result.choices[0].message.content,
      };
    } catch (error) {
      const ai_message_creation_failed = this.i18n.t(
        'error.ai_message_creation_failed',
        { lang: I18nContext.current().lang },
      );
      return logErrorAndThrow(error, ai_message_creation_failed);
    }
  }

  async generateInterviewFeedback({
    userAnswer,
    question,
  }: GenerateInterviewFeedbackInput): Promise<GenerateInterviewFeedbackOutput> {
    try {
      const prompt = `다음 면접 질문에 대한 답변을 상세히 피드백해 주세요. 면접 질문: "${question}". 면접자의 답변: "${userAnswer}". 이 답변은 프론트엔드 개발자가 한 것입니다. 답변에서 잘못 변환된 텍스트가 있을 수 있으므로, 비슷한 의미를 유추하여 피드백을 제공해주세요. 피드백은 기술적인 측면과 태도적인 측면 모두를 고려해 주세요. 기술적인 측면에서는 개념 설명의 정확성, 핵심 내용 포함 여부, 면접관이 기대하는 전문성을 평가해 주세요. 태도적인 측면에서는 소통 능력, 문제 해결 접근법, 자신감, 신중함 등을 포함해 주세요. 또한, 피드백을 제공할 때 문장이 너무 길어지지 않도록 줄바꿈이 적절하게 포함되도록 해주세요. 중요한 내용이 잘 보이도록 논리적인 단락을 유지해 주세요. 피드백은 한국어로 작성해 주세요.`;

      // Gemini 모델로 피드백을 생성
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
      });

      const result = await model.generateContent(prompt);

      const generatedFeedback = result.response.text(); // Gemini에서 생성된 피드백

      if (generatedFeedback.length === 0) {
        throw new Error('No response from Gemini');
      }

      return {
        ok: true,
        feedback: generatedFeedback,
      };
    } catch (error) {
      // Gemini에서 실패 시 fallback
      return this.generateInterviewFeedbackFromOpenAI({
        userAnswer,
        question,
      });
    }
  }

  async generateInterviewFeedbackFromOpenAI({
    userAnswer,
    question,
  }: GenerateInterviewFeedbackInput): Promise<GenerateInterviewFeedbackOutput> {
    try {
      const prompt = `다음 면접 질문에 대한 답변을 상세히 피드백해 주세요. 면접 질문: "${question}". 면접자의 답변: "${userAnswer}". 이 답변은 프론트엔드 개발자가 한 것입니다. 답변에서 잘못 변환된 텍스트가 있을 수 있으므로, 비슷한 의미를 유추하여 피드백을 제공해주세요. 피드백은 기술적인 측면과 태도적인 측면 모두를 고려해 주세요. 기술적인 측면에서는 개념 설명의 정확성, 핵심 내용 포함 여부, 면접관이 기대하는 전문성을 평가해 주세요. 태도적인 측면에서는 소통 능력, 문제 해결 접근법, 자신감, 신중함 등을 포함해 주세요. 또한, 피드백을 제공할 때 문장이 너무 길어지지 않도록 줄바꿈이 적절하게 포함되도록 해주세요. 중요한 내용이 잘 보이도록 논리적인 단락을 유지해 주세요. 피드백은 한국어로 작성해 주세요.`;

      // OpenAI GPT 모델로 피드백을 생성
      const result = await this.openAi.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.5,
      });

      if (!result.choices || result.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      return {
        ok: true,
        feedback: result.choices[0].message.content,
      };
    } catch (error) {
      const ai_message_creation_failed = this.i18n.t(
        'error.ai_message_creation_failed',
        { lang: I18nContext.current().lang },
      );
      return logErrorAndThrow(error, ai_message_creation_failed);
    }
  }

  async generateChatGemini({
    message,
  }: GenerateChatInput): Promise<GenerateChatOutput> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 0.8, maxOutputTokens: 150 },
      });

      const prompt = message;

      const result = await model.generateContent(prompt);

      const generatedContent = result.response.text();

      if (generatedContent.length === 0) {
        throw new Error('No response from OpenAI');
      }

      return {
        ok: true,
        message: generatedContent,
      };
    } catch (error) {
      // Gemini 실패 시 ChatGPT로 fallback
      return this.generateChat({ message });
    }
  }

  async generateChat({
    message,
  }: GenerateChatInput): Promise<GenerateChatOutput> {
    try {
      const response = await this.openAi.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: message }],
        max_tokens: 150,
        temperature: 0.8,
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      return {
        ok: true,
        message: response.choices[0].message.content,
      };
    } catch (error) {
      const ai_message_creation_failed = this.i18n.t(
        'error.ai_message_creation_failed',
        {
          lang: I18nContext.current().lang,
        },
      );
      return logErrorAndThrow(error, ai_message_creation_failed);
    }
  }
}
