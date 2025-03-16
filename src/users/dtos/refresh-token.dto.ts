import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class RefreshTokenInput {
  @Field(() => String)
  refreshToken: string;
}

@ObjectType()
export class RefreshTokenOutput extends CoreOutput {
  @Field(() => String, {
    nullable: true,
  })
  token?: string;

  @Field(() => String, {
    nullable: true,
  })
  refreshToken?: string;
}
