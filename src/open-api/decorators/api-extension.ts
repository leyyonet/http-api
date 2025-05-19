import {FQN_PCK} from "../../internal";
import {decoratorPool} from "@leyyo/core";
import {$assert, $dev, Dict} from "@leyyo/common";

type Opt = Record<string, any>;

interface P {
    key: string;
    value: any;
}

export function ApiExtension(key: string, value: any): ClassDecorator;
export function ApiExtension(key: string, value: any): MethodDecorator;
export function ApiExtension(key: string, value: any): PropertyDecorator;
export function ApiExtension(key: string, value: any): ParameterDecorator;
export function ApiExtension(key: string, value: any): ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: object, property?: string, descriptor?: TypedPropertyDescriptor<any> | number) =>
        id.process([clazz, property, descriptor], {key, value});
}

const id = decoratorPool.newId<Opt, Dict, P>(ApiExtension)
    .fqn(FQN_PCK)
    .targets('class', 'method', 'field', 'parameter')
    .processor((ins, p) => {
        p.key = $assert.text(p.key, () => $dev.desc(ins, {field: 'key'}));
        p.value = $assert.realValueOptional(p.value, () => $dev.desc(ins, {field: 'value'}));
        if (!p.key.toLowerCase().startsWith('x-')) {
            throw $dev.developerError({
                issue: 'prefix.should.start.with-x',
                desc: ins.description,
                param: 'key'
            });
        }
        ins.set({[p.key]: p.value});
    });
