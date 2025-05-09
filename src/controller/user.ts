import { Controller, Log } from "express-ext"
import { User, UserFilter, UserService } from "../metadata/user"

export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: Log, service: UserService) {
    super(log, service)
  }
}
