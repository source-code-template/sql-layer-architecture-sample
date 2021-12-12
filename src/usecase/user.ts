import { Manager, SearchResult } from 'onecore';
import { User, UserFilter, UserRepository, UserService } from '../metadata/user';

export class UserUsecase extends Manager<User, string, UserFilter> implements UserService {
  constructor(find: (s: UserFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<User>>, repository: UserRepository) {
    super(find, repository);
  }
}
