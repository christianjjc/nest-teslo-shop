import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsPositive()
  @IsOptional()
  @Type(() => Number) //transformar a numero -- enableImplicitConversions=true
  limit?: number;

  //@IsPositive()
  @IsOptional()
  @Min(0)
  @Type(() => Number) //transformar a numero
  offset?: number;
}
