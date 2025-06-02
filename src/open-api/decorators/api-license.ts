import {LicenseDoc} from "../open-api";
import {FQN} from "../../internal";
import {decoratorPool} from "@leyyo/core";
import {$assert, $dev} from "@leyyo/common";

type Opt = LicenseDoc;

export function ApiLicense(license: Opt): ClassDecorator {
    return clazz =>
        id.process([clazz], license);
}

const id = decoratorPool.newId<Opt>(ApiLicense)
    .fqn(FQN)
    .targets('class')
    .processor((ins, p) => {
        p.name = $assert.text(p.name, () => $dev.desc(ins, {field: 'name'}));
        p.identifier = $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));
        p.url = $assert.textOptional(p.url, () => $dev.desc(ins, {field: 'url'}));
        ins.set(p);
    });
