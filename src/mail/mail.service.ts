import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions, MailTemplate } from './mail.interfaces';
import fetch from 'node-fetch';
import { logErrorAndThrow } from 'src/utils';
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
  }: {
    to: string;
    subject: string;
    text: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Interview App" <${this.options.user}>`, // 보내는 사람
        to, // 받는 사람
        subject, // 제목
        text, // 내용 (HTML 형식도 가능)
      });

      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }

  async sendEmail({
    to,
    subject,
    emailVars,
    template,
  }: {
    to: string;
    subject: string;
    template: MailTemplate;
    emailVars: EmailVar[];
  }) {
    try {
      const form = new FormData();

      form.append('from', `체험단플래너 <postmaster@${this.options.domain}>`);
      form.append('to', `${to}`);
      form.append('subject', `${subject}`);
      form.append('template', template);
      emailVars.forEach((emailVar) => {
        form.append(`v:${emailVar.key}`, emailVar.value);
      });

      const response = await fetch(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );

      const result = await response.json();

      console.log(result);
    } catch (error) {
      logErrorAndThrow(error, '이메일 전송에 실패했습니다.');
    }
  }

  sendVerificationEmail({ email, code }: { email: string; code: string }) {
    this.sendGmail({
      to: email,
      subject: '[인터뷰 앱] 이메일 인증이 도착했습니다.',
      text: `인증번호가 도착했습니다. \n 인증번호: ${code}`,
    });
  }

  sendResetPasswordEmail({
    email,
    nickname,
    code,
  }: {
    email: string;
    nickname: string;
    code: string;
  }) {
    this.sendGmail({
      to: email,
      subject: '[인터뷰 앱] 비밀번호 재설정 링크가 도착했습니다.',
      text: `${nickname}님의 비밀번호 재설정 링크가 도착했습니다.\n 인증번호: ${code}`,
    });
  }
}
