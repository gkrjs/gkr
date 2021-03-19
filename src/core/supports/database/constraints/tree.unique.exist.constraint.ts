import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { getManager, ObjectType } from 'typeorm';

type IParams = {
    entity: ObjectType<any>;
    ignore?: string;
    findKey?: string;
    scope?: string;
    property?: string;
};
@ValidatorConstraint({ name: 'entityTreeUniqueExist', async: true })
export class UniqueTreeExistConstraint implements ValidatorConstraintInterface {
    async validate(value: any, args: ValidationArguments) {
        const { entity, ignore = 'id', findKey, property } = args
            .constraints[0] as IParams;
        // 需要查询的属性名,默认为当前验证的属性
        const queryProperty = property ?? args.property;
        if (!entity) return false;
        // 查询条件字段,默认为指定的ignore
        const key = findKey ?? ignore;
        // 在传入的dto数据中获取需要忽略的字段的值
        const ignoreValue = (args.object as any)[ignore];
        // 查询条件字段的值
        const keyValue = (args.object as any)[key];
        if (!ignoreValue || !keyValue) return false;
        const repo = getManager().getTreeRepository(entity as ObjectType<any>);
        // 根据查询条件查询出当前验证的数据
        const item = await repo.findOne({
            where: { [key]: keyValue, relations: ['parent'] },
        });
        // 没有此数据则验证失败
        if (!item) return false;
        // 如果验证数据没有parent则把所有顶级分类作为验证数据否则就把同一个父分类下的子分类作为验证数据
        const rows: any[] = !item.parent
            ? await repo.findRoots()
            : await repo.find({
                  where: { parent: { id: item.parent.id } },
              });
        // 在忽略本身数据后如果同级别其它数据与验证的queryProperty的值相同则验证失败
        return !rows.find(
            (row) =>
                row[queryProperty] === value && row[ignore] !== ignoreValue,
        );
    }

    defaultMessage(args: ValidationArguments) {
        const { entity, property } = args.constraints[0];
        const queryProperty = property ?? args.property;
        if (!entity) {
            return 'Model not been specified!';
        }
        return `${queryProperty} of ${entity.name} must been unique with siblings element!`;
    }
}

export function IsTreeUniqueExist(
    params: IParams,
    validationOptions?: ValidationOptions,
) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [params],
            validator: UniqueTreeExistConstraint,
        });
    };
}
