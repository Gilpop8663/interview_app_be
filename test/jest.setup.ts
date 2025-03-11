import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { User, UserRole } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { AdminGuard } from 'src/admin/admin.guard';

let app: INestApplication;
let dataSource: DataSource;
let usersRepository: Repository<User>;
let productsRepository: Repository<Product>;
let ordersRepository: Repository<Order>;
let paymentsRepository: Repository<Payment>;
let mailService: MailService;

const originalError = console.error;
const originalLog = console.log;

const mockMailService = {
  sendEmail: jest.fn().mockReturnValue(true),
  sendVerificationEmail: jest.fn().mockReturnValue(true),
  sendResetPasswordEmail: jest.fn().mockReturnValue(true),
};

export const TEST_USER_ID = 5;

beforeEach(() => jest.useRealTimers());

beforeAll(async () => {
  const mockAuthGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => {
      const gqlContext = GqlExecutionContext.create(context).getContext();
      gqlContext['user'] = {
        id: TEST_USER_ID,
        role: UserRole.ADMIN,
      };

      return true;
    },
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .overrideGuard(AdminGuard)
    .useValue(mockAuthGuard)
    .overrideProvider(MailService)
    .useValue(mockMailService)
    .compile();

  app = moduleFixture.createNestApplication();

  usersRepository = moduleFixture.get<Repository<User>>(
    getRepositoryToken(User),
  );
  productsRepository = moduleFixture.get<Repository<Product>>(
    getRepositoryToken(Product),
  );
  ordersRepository = moduleFixture.get<Repository<Order>>(
    getRepositoryToken(Order),
  );
  paymentsRepository = moduleFixture.get<Repository<Payment>>(
    getRepositoryToken(Payment),
  );

  mailService = moduleFixture.get<MailService>(MailService);

  dataSource = moduleFixture.get<DataSource>(DataSource);
  await app.init();

  console.error = (...args) => {
    const errorMessage = args[0] || '';
    if (
      typeof errorMessage === 'string' &&
      (errorMessage.includes('포인트가 부족합니다.') ||
        errorMessage.includes('유효 기간이 남아 구매할 수 없습니다.') ||
        errorMessage.includes('INVALID_TYPE'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.log = (...args) => {
    const logs = args[0] || '';

    if (
      typeof logs?.message === 'string' &&
      logs.message.includes('INVALID_TYPE')
    ) {
      return;
    }

    originalLog.call(console, ...args);
  };
});

afterAll(async () => {
  await dataSource.dropDatabase();
  await dataSource.destroy();

  console.error = originalError;
});

export {
  app,
  dataSource,
  usersRepository,
  productsRepository,
  mailService,
  ordersRepository,
  paymentsRepository,
};
