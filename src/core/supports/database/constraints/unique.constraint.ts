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
    property?: string;
};
@ValidatorConstraint({ name: 'entityItemUnique', async: true })
export class UniqueConstraint implements ValidatorConstraintInterface {
    async validate(value: any, args: ValidationArguments) {
        // 获取要验证的模型和字段
        const { entity, property } = args.constraints[0] as IParams;
        // 如果没有指定字段则使用当前验证的属性作为查询依据
        const queryProperty = property ?? args.property;
        if (!entity) return false;
        try {
            // 查询是否存在数据,如果已经存在则验证失败
            const repo = getManager().getRepository(entity as ObjectType<any>);
            return !(await repo.findOne({ [queryProperty]: value }));
        } catch (err) {
            // 如果数据库操作异常则验证失败
            return false;
        }
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

export function IsUnique(
    params: IParams,
    validationOptions?: ValidationOptions,
) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [params],
            validator: UniqueConstraint,
        });
    };
}
