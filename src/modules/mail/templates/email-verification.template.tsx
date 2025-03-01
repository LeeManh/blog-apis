import * as React from 'react';

interface IProps {
  username: string;
  emailVerificationLink: string;
}

export default function VerificationEmail({
  username,
  emailVerificationLink,
}: IProps) {
  return (
    <div>
      <p>Hello {username},</p>
      <p>Click the link below to verify your email:</p>
      <a href={emailVerificationLink} target="_blank">
        Verify Email
      </a>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  );
}
