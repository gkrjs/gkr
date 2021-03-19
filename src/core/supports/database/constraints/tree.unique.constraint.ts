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
    parentKey?: string;
    property?: string;
};
@ValidatorConstraint({ name: 'entityTreeUnique', async: true })
export class UniqueTreeConstraint implements ValidatorConstraintInterface {
    async validate(value: any, args: ValidationArguments) {
        const { entity, property, parentKey = 'parent' } = args
            .constraints[0] as IParams;
        // 需要查询的属性名,默认为当前验证的属性
        const queryProperty = property ?? args.property;
        const argsObj = args.object as any;
        if (!entity) return false;
        try {
            // 获取repository
            const repo = getManager().getTreeRepository(entity);
            if (!value) return true;
            const collection = !argsObj[parentKey]
                ? await repo.findRoots()
                : await repo.find({
                      where: { parent: { id: argsObj[parentKey] } },
                  });
            // 对比每个子分类的queryProperty值是否与当前验证的dto属性相同,如果有相同的则验证失败
            return collection.every((item) => item[queryProperty] !== value);
        } catch (err) {
            return false;
        }
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

export function IsTreeUnique(
    params: IParams,
    validationOptions?: ValidationOptions,
) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [params],
            validator: UniqueTreeConstraint,
        });
    };
}
