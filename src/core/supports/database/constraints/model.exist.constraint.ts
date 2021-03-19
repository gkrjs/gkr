import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { getManager, ObjectType, Repository } from 'typeorm';

@ValidatorConstraint({ name: 'entityItemExist', async: true })
export class ModelExistConstraint implements ValidatorConstraintInterface {
    async validate(value: string, args: ValidationArguments) {
        let repo: Repository<any>;
        if (!value) return true;
        // 默认对比字段是id
        let map = 'id';
        // 通过传入的entity获取其repository
        if ('entity' in args.constraints[0]) {
            map = args.constraints[0].map ?? 'id';
            repo = getManager().getRepository(args.constraints[0].entity);
        } else {
            repo = getManager().getRepository(args.constraints[0]);
        }
        // 通过查询记录是否存在进行验证
        const item = await repo.findOne({ where: { [map]: value } });
        return !!item;
    }

    defaultMessage(args: ValidationArguments) {
        if (!args.constraints[0]) {
            return 'Model not been specified!';
        }
        return `All instance of ${args.constraints[0].name} must been exists in databse!`;
    }
}
function IsModelExist(
    entity: ObjectType<any>,
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

function IsModelExist(
    condition: { entity: ObjectType<any>; map?: string },
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void;

function IsModelExist(
    condition: ObjectType<any> | { entity: ObjectType<any>; map?: string },
    validationOptions?: ValidationOptions,
): (object: Record<string, any>, propertyName: string) => void {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [condition],
            validator: ModelExistConstraint,
        });
    };
}

export { IsModelExist };
