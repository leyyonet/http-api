import {FQN} from "../../internal";
import {decoratorPool} from "@leyyo/core";
import {$assert, $dev, $is, Dict} from "@leyyo/common";

/**
 * Describes a single API operation on a path.
 * */
export interface ApiOperationOpt {
    /**
     * A short summary of what the operation does.
     */
    summary?: string;
    /**
     * A verbose explanation of the operation behavior. CommonMark syntax MAY be used for rich text representation.
     * */
    description?: string;
    /**
     * Unique string used to identify the operation.
     * The id MUST be unique among all operations described in the API.
     * The operationId value is case-sensitive.
     * Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions.
     * */
    operationId?: string;
    /**
     * Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation.
     * Default value is false.
     * */
    deprecated?: boolean;
}

interface P {
    summaryOrDoc: string | ApiOperationOpt;
}

export function ApiOperation(summary: string): MethodDecorator;
export function ApiOperation(doc: ApiOperationOpt): MethodDecorator;
export function ApiOperation(summaryOrDoc: string | ApiOperationOpt): MethodDecorator {
    return (clazz: object, property: string, descriptor: TypedPropertyDescriptor<any>) =>
        id.process([clazz, property, descriptor], {summaryOrDoc});
}

const id = decoratorPool.newId<ApiOperationOpt, Dict, P>(ApiOperation)
    .fqn(FQN)
    .targets('method')
    .rules('no-multiple')
    .processor((ins, p) => {
        let opt = {} as ApiOperationOpt;
        if (typeof p.summaryOrDoc === 'string') {
            opt.summary = p.summaryOrDoc;
        } else {
            opt = p.summaryOrDoc;
        }
        $assert.textOptional(opt, () => $dev.desc(ins, {field: 'doc'}));
        $assert.textOptional(opt.summary, () => $dev.desc(ins, {field: 'summary'}));
        $assert.textOptional(opt.description, () => $dev.desc(ins, {field: 'description'}));
        $assert.textOptional(opt.operationId, () => $dev.desc(ins, {field: 'operationId'}));
        $assert.booleanOptional(opt.deprecated, () => $dev.desc(ins, {field: 'deprecated'}));
        if ($is.empty(opt.deprecated)) {
            opt.deprecated = false;
        }
        ins.set(opt);
    });
