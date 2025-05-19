import {FQN_PCK} from "../../internal";
import {decoratorPool} from "@leyyo/core";
import {SchemaDoc} from "../open-api";
import {ApiDocTypeAny} from "./index-types";
import {$assert, $dev} from "@leyyo/common";

interface ApiBodyDoc {
    $type?: ApiDocTypeAny;
    mediaType?: string;
    description?: string;
    required?: boolean;
    schema?: SchemaDoc;
}

// app, controller, endpoint
export function ApiBody(opt: ApiBodyDoc): ClassDecorator;
export function ApiBody(opt: ApiBodyDoc): MethodDecorator;
export function ApiBody(opt: ApiBodyDoc): ClassDecorator | MethodDecorator {
    return (clazz: object, property?: string, descriptor?: TypedPropertyDescriptor<any>) =>
        id.process([clazz, property, descriptor], opt);
}

const id = decoratorPool.newId<ApiBodyDoc>(ApiBody)
    .fqn(FQN_PCK)
    .targets('class', 'method')
    .processor((ins, p) => {
        p.mediaType = $assert.textOptional(p.mediaType, () => $dev.desc(ins, {field: 'mediaType'}));
        p.description = $assert.textOptional(p.description, () => $dev.desc(ins, {field: 'description'}));
        p.required = $assert.booleanOptional(p.required, () => $dev.desc(ins, {field: 'required'}));
        ins.set(p);
    });
