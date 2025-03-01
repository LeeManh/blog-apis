import { registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  client: {
    url: process.env.CLIENT_URL,
  },
}));
