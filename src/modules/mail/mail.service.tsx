import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateEmailOptions, CreateEmailRequestOptions, Resend } from 'resend';
import VerificationEmail from './templates/email-verification.template';
import * as React from 'react';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(configService.get('mail.apiKey'));
  }

  async sendEmail(
    payload: CreateEmailOptions,
    options?: CreateEmailRequestOptions,
  ) {
    await this.resend.emails.send(payload, options);
  }

  async sendEmailVerification({
    email,
    username,
    emailVerificationToken,
  }: {
    email: string;
    username: string;
    emailVerificationToken: string;
  }) {
    const clientUrl = this.configService.get<string>('common.client.url');
    const emailVerificationLink = `${clientUrl}/auth/verify-email?token=${emailVerificationToken}`;

    await this.sendEmail({
      from: 'no-reply <no-reply@leem.io.vn>',
      to: [email],
      subject: 'Email Verification',
      react: (
        <VerificationEmail
          username={username}
          emailVerificationLink={emailVerificationLink}
        />
      ),
    });
  }
}
