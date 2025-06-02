import {decoratorPool} from "@leyyo/core";
import {$assert, $dev, $is, Dict} from "@leyyo/common";
import {FQN} from "../../internal";
import {ExternalDocumentationDoc, TagDoc} from "../open-api";

interface Opt {
    tags: Array<TagDoc>;
}

interface P {
    tags: Array<string | TagDoc>;
}

// app, controller, endpoint
export function ApiTags(...tags: Array<string | TagDoc>): ClassDecorator;
export function ApiTags(...tags: Array<string | TagDoc>): MethodDecorator;
export function ApiTags(...tags: Array<string | TagDoc>): ClassDecorator | MethodDecorator {
    return (clazz: object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) =>
        id.process([clazz, propertyKey, descriptor], {tags});
}

const id = decoratorPool.newId<Opt, Dict, P>(ApiTags)
    .fqn(FQN)
    .targets('class', 'method')
    .rules('iterable')
    .processor((ins, p) => {
        const opt = {} as Opt;
        opt.tags = $assert.array(p.tags, () => $dev.desc(ins, {field: 'tags'}));
        opt.tags.forEach((item, index) => {
            if (typeof item === 'string') {
                const tag = {} as TagDoc;
                tag.name = $assert.text(item, () => $dev.desc(ins, {field: 'tag.name', index}));
                opt.tags[index] = tag;
            } else if ($is.bareObject(item)) {
                const tag = {} as TagDoc;
                tag.name = $assert.text(item.name, () => $dev.desc(ins, {field: 'tag.name', index}));
                tag.description = $assert.textOptional(item.description, () => $dev.desc(ins, {
                    field: 'tag.description',
                    index
                }));
                if ($is.bareObject(item.externalDocs)) {
                    tag.externalDocs = {} as ExternalDocumentationDoc;
                    tag.externalDocs.url = $assert.textOptional(item.externalDocs.url, () => $dev.desc(ins, {
                        field: 'tag.externalDocs.url',
                        index
                    }));
                    tag.externalDocs.description = $assert.textOptional(item.externalDocs.description, () => $dev.desc(ins, {
                        field: 'tag.externalDocs.url',
                        index
                    }));
                }
                opt.tags[index] = tag;
            } else {
                throw $dev.invalidError({
                    issue: 'invalid.tag',
                    desc: ins.description,
                    index,
                    value: item,
                    type: typeof item
                });
            }
        });
        ins.set(opt);
    });
