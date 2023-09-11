import { Global, Module } from '@nestjs/common';

const validators = [];

@Global()
@Module({
  providers: validators,
  exports: validators,
})
export default class ValidatorsModule {}
