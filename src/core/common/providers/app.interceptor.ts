import { ClassSerializerInterceptor, PlainLiteralObject } from '@nestjs/common';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { isObject } from 'lodash';

export class AppIntercepter extends ClassSerializerInterceptor {
    serialize(
        response: PlainLiteralObject | Array<PlainLiteralObject>,
        options: ClassTransformOptions,
    ): PlainLiteralObject | PlainLiteralObject[] {
        const isArray = Array.isArray(response);
        if (!isObject(response) && !isArray) return response;
        if (isArray) {
            return (response as PlainLiteralObject[]).map((item) =>
                this.transformToPlain(item, options),
            );
        }
        if (
            'meta' in response &&
            'items' in response &&
            Array.isArray(response.items)
        ) {
            return {
                ...response,
                items: (response.items as PlainLiteralObject[]).map((item) =>
                    this.transformToPlain(item, options),
                ),
            };
        }
        return this.transformToPlain(response, options);
    }
}
