import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

type ModelType = 1 | 2 | 3 | 4 | 5;

@ValidatorConstraint({ name: 'isPassword', async: false })
export class IsPasswordConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const validateModel: ModelType = args.constraints[0] ?? 1;
        switch (validateModel) {
            case 1:
                return /\d/.test(value) && /[a-zA-Z]/.test(value);
            case 2:
                return /\d/.test(value) && /[a-z]/.test(value);
            case 3:
                return /\d/.test(value) && /[A-Z]/.test(value);
            case 4:
                return (
                    /\d/.test(value) &&
                    /[a-z]/.test(value) &&
                    /[A-Z]/.test(value)
                );
            case 5:
                return (
                    /\d/.test(value) &&
                    /[a-z]/.test(value) &&
                    /[A-Z]/.test(value) &&
                    /[!@#$%^&]/.test(value)
                );
            default:
                return /\d/.test(value) && /[a-zA-Z]/.test(value);
        }
    }

    defaultMessage(_args: ValidationArguments) {
        return "($value) 's format error!";
    }
}

export function IsPassword(
    model?: ModelType,
    validationOptions?: ValidationOptions,
) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [model],
            validator: IsPasswordConstraint,
        });
    };
}
