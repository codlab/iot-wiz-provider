/* eslint-disable no-console */
import log, { LogLevelDesc } from 'loglevel';

export interface Logger {
    level: LogLevelDesc,
    logger: any[]
};

export default (params: Logger) => {
  var { level, logger } = params;
  const levels: LogLevelDesc[] = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];

  if (level == null || level === '') {
    // eslint-disable-next-line no-param-reassign
    level = 'warn';
  }

  if (levels.indexOf(level) === -1) {
    console.error('invalid log level: %s', level);
  }
  log.setLevel(level);
  // if logger passed in, call logger functions instead of our loglevel functions
  if (logger != null) {
    levels.forEach(loggerLevel => {
      if (typeof logger[loggerLevel] === 'function') {
        log[loggerLevel] = (...args) => {
          logger[loggerLevel](...args);
        };
      }
    });
  }

  return log;
};