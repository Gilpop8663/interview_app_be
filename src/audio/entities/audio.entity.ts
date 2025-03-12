import { Field } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Audio extends CoreEntity {
  @Column()
  @Field(() => String)
  filePath: string;

  @Column()
  @Field(() => String)
  transcribedText: string; // 텍스트 변환 결과를 저장할 필드
}
