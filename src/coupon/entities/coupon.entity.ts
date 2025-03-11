import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Coupon extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  code: string; // 쿠폰 코드

  @Column({ type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  expirationDate: Date; // 만료일

  @Column({ default: true })
  @Field(() => Boolean)
  isActive: boolean; // 활성화 여부
}
