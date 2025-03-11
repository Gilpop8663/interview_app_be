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
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
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
        max_tokens: 500,
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

  async generateInterviewFeedback({
    userAnswer,
    jobTitle,
    yearsOfExperience,
    preferredLanguage,
    question,
  }: GenerateInterviewFeedbackInput): Promise<GenerateInterviewFeedbackOutput> {
    try {
      const prompt = `Provide detailed feedback on this interview answer: "${userAnswer}". The answer is for a ${jobTitle} with ${yearsOfExperience} years of experience. The interview question was: "${question}". Please respond in ${preferredLanguage}. Consider the job title, years of experience, and preferred language in your feedback.`;

      // Gemini 모델로 피드백을 생성
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
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
        jobTitle,
        yearsOfExperience,
        preferredLanguage,
        question,
      });
    }
  }

  async generateInterviewFeedbackFromOpenAI({
    userAnswer,
    jobTitle,
    yearsOfExperience,
    preferredLanguage,
    question,
  }: GenerateInterviewFeedbackInput): Promise<GenerateInterviewFeedbackOutput> {
    try {
      const prompt = `Provide detailed feedback on this interview answer: "${userAnswer}". The answer is for a ${jobTitle} with ${yearsOfExperience} years of experience. The interview question was: "${question}". Please respond in ${preferredLanguage}. Consider the job title, years of experience, and preferred language in your feedback.`;

      // OpenAI GPT 모델로 피드백을 생성
      const result = await this.openAi.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
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
