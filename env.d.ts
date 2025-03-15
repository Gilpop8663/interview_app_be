declare module NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'dev' | 'test' | 'production';
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_DATABASE_NAME: string;
    DB_PASSWORD: string;
    JWT_SECRET_KEY: string;
    MAILGUN_API_KEY: string;
    MAILGUN_DOMAIN_NAME: string;
    PORT: number;
    DATABASE_URL: string;
    SOLAPI_API_KEY: string;
    SOLAPI_API_SECRET_KEY: string;
    ADMIN_PASSWORD: string;
    PORTONE_API_SECRET: string;
    OPENAI_API_KEY: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    GEMINI_API_KEY: string;
    GMAIL_USER: string;
    GMAIL_PASS: string;
  }
}
