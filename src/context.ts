import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from "express-ext"
import { createChecker, DB, SearchBuilder } from "query-core"
import { check } from "types-validation"
import { createValidator } from "xvalidators"

import { UserController } from "./controller/user"
import { User, UserFilter, userModel } from "./metadata/user"
import { SqlUserRepository } from "./repository/user"
import { useUserService } from "./service/user"

resources.createValidator = createValidator
resources.check = check

export interface ApplicationContext {
  health: HealthController
  log: LogController
  middleware: MiddlewareController
  user: UserController
}

export function useContext(db: DB, logger: Logger, midLogger: Middleware): ApplicationContext {
  const log = new LogController(logger)
  const middleware = new MiddlewareController(midLogger)
  const sqlChecker = createChecker(db)
  const health = new HealthController([sqlChecker])

  const userSearchBuilder = new SearchBuilder<User, UserFilter>(db.query, "users", userModel, db.driver)
  const userRepository = new SqlUserRepository(db)
  const userService = useUserService(userSearchBuilder.search, userRepository)
  const user = new UserController(logger.error, userService)

  return { health, log, middleware, user }
}
