import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditUserSubscriptionTypeOutput extends CoreOutput {}

@InputType()
export class EditUserSubscriptionTypeInput extends PartialType(
  PickType(User, ['subscriptionType']),
) {
  @Field(() => Number)
  userId: number;
}
