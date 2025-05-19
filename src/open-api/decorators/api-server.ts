import {ServerDoc, ServerVariableDoc} from "../open-api";
import {FQN_PCK} from "../../internal";
import {decoratorPool} from "@leyyo/core";
import {$assert, $dev, $is, Dict} from "@leyyo/common";

type Opt = ServerDoc;

interface P {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariableDoc>;
}

// app, controller, endpoint
export function ApiServer(url: string, description?: string, variables?: Record<string, ServerVariableDoc>): ClassDecorator;
export function ApiServer(url: string, description?: string, variables?: Record<string, ServerVariableDoc>): MethodDecorator;
export function ApiServer(url: string, description?: string, variables?: Record<string, ServerVariableDoc>): ClassDecorator | MethodDecorator {
    return (clazz: object, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) =>
        idId.process([clazz, key, descriptor], {url, description, variables});
}

const idId = decoratorPool.newId<Opt, Dict, P>(ApiServer)
    .fqn(FQN_PCK)
    .targets('class', 'method')
    .processor((ins, p) => {
        const opt = {} as Opt;
        opt.url = $assert.text(p.url, $dev.desc(ins, {field: 'url'}));
        opt.description = $assert.textOptional(p.description, $dev.desc(ins, {field: 'description'}));
        if ($is.bareObject(opt.variables)) {
            opt.variables = {} as Record<string, ServerVariableDoc>;
            let i = 0;
            for (let [key, value] of Object.entries(p.variables)) {
                key = $assert.text(key, () => $dev.desc(ins, {field: `variables#[${i}].key`}));
                value = $assert.bareObject(value, () => $dev.desc(ins, {field: `variables#[${i}].value`}));
                value.enum = $assert.primitiveArray(value.enum, () => $dev.desc(ins, {field: `variables.${key}.enum`}));
                value.default = $assert.primitiveOptional(value.default, () => $dev.desc(ins, {field: `variables.${key}.default`}));
                value.description = $assert.textOptional(value.description, () => $dev.desc(ins, {field: `variables.${key}.description`}));
                opt.variables[key] = value;
            }
        }
        ins.set(opt);

    });
