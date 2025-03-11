import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UsersService } from './users/users.service';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { OpenAiService } from './openAi/openAi.service';
import { OpenAiModule } from './openAi/openAi.module';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { PaypalService } from './orders/paypal.service';
import { CouponModule } from './coupon/coupon.module';
import { Coupon } from './coupon/entities/coupon.entity';
import * as fs from 'fs';

const getEnvFilePath = () => {
  if (process.env.NODE_ENV === 'dev') {
    return '.env.dev';
  }

  if (process.env.NODE_ENV === 'production') {
    console.log('hi');
    return '.env';
  }

  if (process.env.NODE_ENV === 'test') {
    return '.env.test';
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: getEnvFilePath(),
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'production', 'test')
          .default('dev'),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string(),
        DB_DATABASE_NAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        JWT_SECRET_KEY: Joi.string(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        PORTONE_API_SECRET: Joi.string().required(),
        ADMIN_PASSWORD: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().required(),
        PAYPAL_CLIENT_ID: Joi.string().required(),
        PAYPAL_CLIENT_SECRET: Joi.string().required(),
        GEMINI_API_KEY: Joi.string().required(),
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',

      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE_NAME,
          }),
      entities: [User, Product, Order, Payment, Coupon],
      logging: process.env.NODE_ENV === 'dev',
      synchronize: true,
      ssl:
        process.env.NODE_ENV === 'production'
          ? {
              // 다운로드한 인증서 파일 경로 추가
              ca: fs.readFileSync('./global-bundle.pem'),
            }
          : false,
      extra: {
        // SSL 연결을 강제 설정
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req, res }) => ({ user: req['user'], req, res }),
      introspection: true,
      playground: true,
      formatError: (error) => {
        console.log(error);
        return {
          message: error.message,
          code: error.extensions.code,
        };
      },
    }),
    UsersModule,
    CommonModule,
    JwtModule.forRoot({
      secretKey: process.env.JWT_SECRET_KEY,
    }),
    AuthModule,
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
    }),
    AdminModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    OpenAiModule,
    CouponModule,
  ],
  controllers: [],
  providers: [OpenAiService, PaypalService],
})
export class AppModule implements NestModule {
  constructor(private readonly usersService: UsersService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }

  async onModuleInit() {
    await this.usersService.createAdminUser();
  }
}
