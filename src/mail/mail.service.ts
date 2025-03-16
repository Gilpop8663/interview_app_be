import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.options.user,
        pass: this.options.pass,
      },
    });
  }
  async sendGmail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Interview App" <${this.options.user}>`, // 보내는 사람
        to, // 받는 사람
        subject, // 제목
        text, // 일반 텍스트 (html이 없을 경우)
        html, // HTML 내용
      });

      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }

  async sendVerificationEmail({
    email,
    code,
  }: {
    email: string;
    code: string;
  }) {
    const emailSubject = '이메일 인증을 완료해주세요';

    // HTML 템플릿
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>이메일 인증</title>
    </head>
    <body style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
          <div style="font-size: 24px; font-weight: bold; color: #4F46E5;">Interview App</div>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="text-align: center;">이메일 인증을 완료해주세요</h2>
          <p style="text-align: center;">안녕하세요! Interview App에 가입해주셔서 감사합니다.<br>아래의 인증 코드를 입력하여 이메일 인증을 완료해주세요.</p>
          
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px auto; text-align: center; width: 80%;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">${code}</div>
          </div>
          
          <p style="text-align: center;">인증 코드는 30분 동안 유효합니다.<br>만약 본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.</p>
  
          <p style="text-align: center;">감사합니다.<br><strong>Interview App 팀</strong></p>
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #6B7280;">
          <p>© 2025 Interview App. All rights reserved.</p>
          <p>본 메일은 발신 전용이므로 회신되지 않습니다.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    return this.sendGmail({
      to: email,
      subject: emailSubject,
      html: htmlContent,
    });
  }
  async sendResetPasswordEmail({
    email,
    nickname,
    code,
  }: {
    email: string;
    nickname: string;
    code: string;
  }) {
    const emailSubject = '[인터뷰 앱] 비밀번호 재설정 링크가 도착했습니다.';
    const domain =
      process.env.NODE_ENV === 'dev'
        ? 'http://localhost:5173/'
        : 'https://interview.coddink.com/';

    // HTML 템플릿
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>비밀번호 재설정</title>
    </head>
    <body style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
          <div style="font-size: 24px; font-weight: bold; color: #4F46E5;">Interview App</div>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="text-align: center;">비밀번호 재설정을 진행해주세요</h2>
          <p style="text-align: center;">안녕하세요, ${nickname}님!<br>아래 링크를 클릭하여 비밀번호를 재설정하세요.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${domain}reset-password?token=${code}" 
               style="background-color: #4F46E5; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
              비밀번호 재설정
            </a>
          </div>

          <p style="text-align: center; margin-top: 20px;">해당 링크는 30분 동안 유효합니다.<br>만약 본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.</p>
  
          <p style="text-align: center;">감사합니다.<br><strong>Interview App 팀</strong></p>
        </div>
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #6B7280;">
          <p>© 2025 Interview App. All rights reserved.</p>
          <p>본 메일은 발신 전용이므로 회신되지 않습니다.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.sendGmail({
      to: email,
      subject: emailSubject,
      html: htmlContent,
    });
  }
}
