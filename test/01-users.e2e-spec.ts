import * as request from 'supertest';
import { app, usersRepository } from './jest.setup';

const GRAPHQL_ENDPOINT = '/graphql';

const TEST_USER = {
  email: 'asdf1234@naver.com',
  password: '12341234',
};

describe('AppController (e2e)', () => {
  beforeAll(async () => {
    const createUser = async ({ email, password }) => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
          mutation {
            createAccount(
              input: { email: "${email}",
                password: "${password}",  }
            ) {
              ok
              error
            }
          }
        `,
        });
    };

    for (let index = 0; index < 5; index++) {
      await createUser({
        email: index,
        password: index,
      });
    }

    await usersRepository.update(1, { point: 3000 });
    await usersRepository.update(2, { point: 3000 });
  });

  describe('아이디 생성', () => {
    test('아이디를 생성한다.', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              createAccount(
                input: { email: "${TEST_USER.email}",
                  password: "${TEST_USER.password}",  }
              ) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;

          expect(createAccount.ok).toBe(true);
          expect(createAccount.error).toBe(null);
        });
    });
  });

  describe('로그인', () => {
    test('로그인한다 ', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
          mutation {
            login(input: { password: "${TEST_USER.password}", email: "${TEST_USER.email}" , rememberMe: false}) {
              ok
              error
              token
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
        });
    });

    test('잘못된 비밀번호로 로그인을 시도한다.', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
          mutation {
            login(input: { password: "test", email: "${TEST_USER.email}" , rememberMe: false}) {
              ok
              error
              token
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(false);
          expect(login.error).toBe('비밀번호가 맞지 않습니다.');
          expect(login.token).toEqual(null);
        });
    });
  });

  test(`유저 정보를 조회했을 때 아이디, 포인트, 내이야기, 닉네임, 
    이메일, 댓글, 관심 이야기, 좋아요를 누른 작품이나 회차를 알 수 있다.`, async () => {
    const [initialUser] = await usersRepository.find({
      relations: [],
    });

    const requiredKeys = ['id', 'createdAt', 'updatedAt', 'email', 'nickname'];

    expect(initialUser).toEqual(expect.any(Object));

    requiredKeys.forEach((key) => {
      expect(initialUser).toHaveProperty(key);
    });
  });
});

test.each([
  [`asd${TEST_USER.email}`, true, null],
  [TEST_USER.email, false, '이미 사용 중인 이메일입니다.'],
])(
  '이메일: %s를 중복 확인 한다. 중복 확인에 결과는 %s를 반환한다.',
  (email, result, errorResult) => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: /* GraphQL */ `
      mutation {
        checkEmail(input: { email: "${email}" }) {
          ok
          error
        }
      }
    `,
      })
      .expect(200)
      .expect((res) => {
        const {
          body: {
            data: { checkEmail },
          },
        } = res;

        expect(checkEmail.ok).toBe(result);
        expect(checkEmail.error).toBe(errorResult);
      });
  },
);

test('회원이 탈퇴한다.', async () => {
  const [initialUser] = await usersRepository.find();

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
    mutation {
      deleteAccount(input: { userId: ${initialUser.id} }) {
        ok
        error
      }
    }
  `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { deleteAccount },
        },
      } = res;

      expect(deleteAccount.ok).toBe(true);
      expect(deleteAccount.error).toBe(null);
    });

  const updatedUser = await usersRepository.findOne({
    where: { id: initialUser.id },
  });

  expect(updatedUser).toBe(null);
});

describe('구독 유형 업데이트', () => {
  test('구독 유형을 PREMIUM으로 변경한다.', async () => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: /* GraphQL */ `
          mutation {
            updateSubscriptionType(input: { subscriptionType: PREMIUM }) {
              ok
              error
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        const {
          body: {
            data: { updateSubscriptionType },
          },
        } = res;

        expect(updateSubscriptionType.ok).toBe(true);
        expect(updateSubscriptionType.error).toBe(null);
      });
  });

  test('구독 유형을 FREE로 변경한다.', async () => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: /* GraphQL */ `
          mutation {
            updateSubscriptionType(input: { subscriptionType: FREE }) {
              ok
              error
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        const {
          body: {
            data: { updateSubscriptionType },
          },
        } = res;

        expect(updateSubscriptionType.ok).toBe(true);
        expect(updateSubscriptionType.error).toBe(null);
      });
  });

  test('잘못된 구독 유형으로 업데이트 시도한다.', async () => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query: /* GraphQL */ `
          mutation {
            updateSubscriptionType(
              input: { subscriptionType: "INVALID_TYPE" }
            ) {
              ok
              error
            }
          }
        `,
      })
      .expect(400);
  });
});

test('포인트를 감소하고, 통계를 업데이트한다.', async () => {
  const USER_ID = 5;

  const user = await usersRepository.findOne({ where: { id: USER_ID } });
  const POINTS_TO_DEDUCT = 2;

  await request(app.getHttpServer())
    .post(GRAPHQL_ENDPOINT)
    .send({
      query: /* GraphQL */ `
        mutation {
          updateUserPointsAndStatistics(input: { 
            pointsToDeduct: ${POINTS_TO_DEDUCT} ,
            taskType: THREADS_UNFOLLOW}) {
            ok
            error
          }
        }
      `,
    })
    .expect(200)
    .expect((res) => {
      const {
        body: {
          data: { updateUserPointsAndStatistics },
        },
      } = res;

      expect(updateUserPointsAndStatistics.ok).toBe(true);
      expect(updateUserPointsAndStatistics.error).toBe(null);
    });

  const updatedUser = await usersRepository.findOne({ where: { id: USER_ID } });

  expect(updatedUser.point).toBe(user.point - POINTS_TO_DEDUCT);
  expect(updatedUser.threadsUnfollowCount).toBe(POINTS_TO_DEDUCT);
});
