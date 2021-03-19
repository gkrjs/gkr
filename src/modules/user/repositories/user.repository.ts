import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '../entities';
@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
    /**
     * 构建基础Query
     *
     * @returns
     * @memberof UserRepository
     */
    buildBaseQuery() {
        return this.createQueryBuilder('user');
    }
}
