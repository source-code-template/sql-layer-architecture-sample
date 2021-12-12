import { HealthController, LogController, resources } from 'express-ext';
import { JSONLogger, LogConfig, map } from 'logger-core';
import { createChecker, DB, SearchBuilder } from 'query-core';
import { createValidator } from 'xvalidators';

import { UserController } from './controller/user';
import { User, UserFilter, userModel } from './metadata/user';
import { SqlUserRepository } from './repository/user';
import { UserUsecase } from './usecase/user';

resources.createValidator = createValidator;

export interface Config {
  port?: number;
  log: LogConfig;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  user: UserController;
}
export function useContext(db: DB, conf: Config): ApplicationContext {
  const logger = new JSONLogger(conf.log.level, conf.log.map);
  const log = new LogController(logger, map);

  const sqlChecker = createChecker(db);
  const health = new HealthController([sqlChecker]);

  const userSearchBuilder = new SearchBuilder<User, UserFilter>(db.query, 'users', userModel.attributes, db.driver);
  const userRepository = new SqlUserRepository(db);
  const userUsecase = new UserUsecase(userSearchBuilder.search, userRepository);
  const user = new UserController(logger.error, userUsecase);

  return { health, log, user };
}
