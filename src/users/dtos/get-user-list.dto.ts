import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class GetUserListOutput extends CoreOutput {
  @Field(() => [User], { nullable: true })
  userList?: User[];
}
