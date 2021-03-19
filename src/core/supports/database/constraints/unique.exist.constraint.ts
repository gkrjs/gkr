import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { getManager, Not, ObjectType } from 'typeorm';

type IParams = {
    entity: ObjectType<any>;
    ignore: string;
    property?: string;
};

@ValidatorConstraint({ name: 'entityItemUniqueExist', async: true })
export class UniqueExistContraint implements ValidatorConstraintInterface {
    async validate(value: any, args: ValidationArguments) {
        // 默认忽略字段为id
        const { entity, ignore = 'id', property } = args
            .constraints[0] as IParams;
        // 如果没有指定字段则使用当前验证的属性作为查询依据
        const queryProperty = property ?? args.property;
        if (!entity) return false;
        // 在传入的dto数据中获取需要忽略的字段的值
        const ignoreValue = (args.object as any)[ignore];
        // 如果忽略字段不存在则验证失败
        if (ignoreValue === undefined) return false;
        // 通过entity获取repository
        const repo = getManager().getRepository(entity as ObjectType<any>);
        // 查询忽略字段之外的数据是否对queryProperty的值唯一
        return !(await repo.findOne({
            where: { [queryProperty]: value, [ignore]: Not(ignoreValue) },
        }));
    }

    defaultMessage(args: ValidationArguments) {
        const { entity, property } = args.constraints[0];
        const queryProperty = property ?? args.property;
        if (!entity) {
            return 'Model not been specified!';
        }
        return `${queryProperty} of ${entity.name} must been unique!`;
    }
}

export function IsUniqueExist(
    params: IParams,
    validationOptions?: ValidationOptions,
) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [params],
            validator: UniqueExistContraint,
        });
    };
}
