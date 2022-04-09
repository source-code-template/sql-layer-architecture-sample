import { Manager, Search } from 'onecore';
import { User, UserFilter, UserRepository, UserService } from '../metadata/user';

export class UserManager extends Manager<User, string, UserFilter> implements UserService {
  constructor(search: Search<User, UserFilter>, repository: UserRepository) {
    super(search, repository);
  }
}
export function useUserService(search: Search<User, UserFilter>, repository: UserRepository): UserService {
  return new UserManager(search, repository);
}
