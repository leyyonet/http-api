import {FQN} from "../../internal";
import {decoratorPool} from "@leyyo/core";
import {ClassLike, Func} from "@leyyo/common";
import {SchemaDoc} from "../open-api";

interface Opt {
    $type?: string | Func | ClassLike | [string | Func | ClassLike] | [string | Func | ClassLike, string | Func | ClassLike];
    status?: string;
    mediaType?: string;
    description?: string;
    schema?: SchemaDoc;
}

// app, controller, endpoint
export function ApiResponse(opt: Opt): ClassDecorator | MethodDecorator {
    return (clazz: object, property?: string, descriptor?: TypedPropertyDescriptor<any>): any =>
        id.process([clazz, property, descriptor], opt);
}

const id = decoratorPool.newId<Opt>(ApiResponse)
    .fqn(FQN)
    .targets('class', 'method')
    .processor((ins, p) => {
        ins.set(p)
    });
