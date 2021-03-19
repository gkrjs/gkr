import { ADDTIONAL_RELATIONS } from '../constants';
import { DynamicRelation } from '../types';

export function AddRelations(relations: () => Array<DynamicRelation>) {
    return <M extends new (...args: any[]) => any>(target: M) => {
        Reflect.defineMetadata(ADDTIONAL_RELATIONS, relations, target);
        return target;
    };
}
