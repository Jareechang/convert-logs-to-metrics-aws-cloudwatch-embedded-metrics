import pino from 'pino';

import config from '@app/config';

import asyncLocalStorage from '@app/utils/async-local-storage';

const logger = pino({
  enabled: config.log.enabled,
  level: config.log.level,
  redact: ['key', 'password', 'secret'].concat(config.log.redact ?? []),
  mixin() {
    const requestId = asyncLocalStorage.getStore().get('awsRequestId');
    return {
      requestId,
    };
  }
});

export default logger;
