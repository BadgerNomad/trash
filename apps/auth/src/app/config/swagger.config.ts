import { DocumentBuilder } from '@nestjs/swagger';

import config from './config';

export default new DocumentBuilder()
  .setTitle('P2P API')
  .setVersion('0.1')
  .addBearerAuth()
  .addServer(`http://${config.server.base_url}${config.server.route_prefix}`)
  .addServer(`https://${config.server.base_url}${config.server.route_prefix}`)
  .build();
