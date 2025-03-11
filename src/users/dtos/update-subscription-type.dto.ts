import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class UpdateSubscriptionTypeInput extends PickType(User, [
  'subscriptionType',
]) {
  @Field(() => String)
  subscriptionPeriod: string; // 'MONTHLY' 또는 'YEARLY'
}

@ObjectType()
export class UpdateSubscriptionTypeOutput extends CoreOutput {}
