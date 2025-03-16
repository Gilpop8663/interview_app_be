import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @Column()
  @Field(() => String)
  email: string;

  @Column({ default: false })
  @Field(() => Boolean)
  verified: boolean;

  @Column({ default: 0 })
  @Field(() => Number)
  attempts: number; // 인증 실패 횟수 저장

  @Column({
    type: 'timestamp',
    default: () => "CURRENT_TIMESTAMP + INTERVAL '30 MINUTE'",
  })
  @Field(() => Date)
  expiresAt: Date;

  @BeforeInsert()
  createCode() {
    this.code = Math.floor(100000 + Math.random() * 900000).toString();
  }
}
