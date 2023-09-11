import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import AuthTokenService from './auth.token.service';

@Module({
  imports: [
    JwtModule.register({
      publicKey: 'YvcMg2GW6gZjAwdramXafS9lHaQ9txbvSHZNHDSS',
    }),
  ],
  providers: [AuthTokenService],
  exports: [AuthTokenService],
})
export default class AuthTokenModule {}
