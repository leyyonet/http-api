import {SecurityRequirementDoc} from "../open-api";
import {FQN} from "../../internal";
import {decoratorPool} from "@leyyo/core";
import {$assert, $dev, Dict} from "@leyyo/common";

type Opt = SecurityRequirementDoc;

interface P {
    nameOrDoc: string | SecurityRequirementDoc;
    items?: Array<string>;
}

export function ApiSecurity(name: string, items?: Array<string>): ClassDecorator;
export function ApiSecurity(requirement: SecurityRequirementDoc): ClassDecorator;
export function ApiSecurity(name: string, items?: Array<string>): MethodDecorator;
export function ApiSecurity(requirement: SecurityRequirementDoc): MethodDecorator;
export function ApiSecurity(nameOrDoc: string | SecurityRequirementDoc, items?: Array<string>): ClassDecorator | MethodDecorator {
    return (clazz: object, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) =>
        idMethod.process([clazz, key, descriptor], {nameOrDoc, items});
}

const idMethod = decoratorPool.newId<Opt, Dict, P>(ApiSecurity)
    .fqn(FQN)
    .targets('class', 'method')
    .processor((ins, p) => {
        let opt = {} as Opt;
        if (typeof p.nameOrDoc === 'string') {
            opt[p.nameOrDoc] = p.items;
        } else {
            opt = p.nameOrDoc as SecurityRequirementDoc;
        }
        $assert.bareObject(opt, () => $dev.desc(ins, {field: 'map'}));
        let index = 0;
        for (const [key, items] of Object.entries(opt)) {
            $assert.text(key, () => $dev.desc(ins, {field: `#${index}.key`}));
            $assert.textArray(items, () => $dev.desc(ins, {field: `$.${key}.value`}));
            index++;
        }
        ins.set(opt);
    });
