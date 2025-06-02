import {ParameterControlFlag, ParameterItem, ParameterProcessorLike,} from "./index.types";
import {ApiPoolLike} from "../pool";
import {HttpParameter, HttpPlaceExtended} from "@leyyo/http";
import {$assert, $dev, $is, $log, Func, MethodTested, Tested} from "@leyyo/common";
import {DecoInstanceLike,Fqn, ParameterReflectionLike, PropertyReflectionLike} from "@leyyo/core";
import {
    AsApp,
    AsContext,
    AsRequest,
    AsResponse,
    Body,
    Cookie,
    Cookies,
    File,
    Files,
    Header,
    Headers,
    MonoParamOpt,
    Param,
    Params,
    PolyGivenParams,
    Queries,
    Query
} from "../decorators";
import {EndpointItem} from "../endpoint";
import {FQN} from "../internal";

@Tested()
@Fqn(FQN)
export class ParameterProcessor implements ParameterProcessorLike {

    // region properties
    private readonly logger = $log.create(ParameterProcessor);
    private readonly _PLACE_BY_KIND = {
        body: 'body',
        cookie: 'cookie',
        cookies: 'cookie',
        file: 'file',
        files: 'file',
        header: 'header',
        headers: 'header',
        param: 'path',
        params: 'path',
        query: 'query',
        queries: 'query',
        context: null,
        request: null,
        response: null,
        application: null,
    } as Record<HttpParameter, HttpPlaceExtended>;
    private readonly _KIND_BY_NAME = {
        // anonymous
        body: 'body',
        payload: 'body',
        ctx: 'context',
        context: 'context',
        res: 'response',
        response: 'response',
        req: 'request',
        request: 'request',
        app: 'application',
        application: 'application',
        // multiple
        cookies: 'cookies',
        headers: 'headers',
        params: 'params',
        queries: 'queries',
        files: 'files',
    } as Record<string, HttpParameter>;
    private readonly _KIND_BY_DECO = {
        AsApp: 'application',
        AsContext: 'context',
        AsRequest: 'request',
        AsResponse: 'response',
        Body: 'body',

        Cookie: 'cookie',
        Cookies: 'cookies',
        File: 'file',
        Files: 'files',
        Header: 'header',
        Headers: 'headers',
        Param: 'param',
        Params: 'params',
        Query: 'query',
        Queries: 'queries',
    } as Record<string, HttpParameter>;
    private readonly _NAME_POLY = ['cookies', 'files', 'headers', 'params', 'queries'] as Array<HttpParameter>;
    private readonly _NAME_MONO = ['cookie', 'file', 'header', 'param', 'query'] as Array<HttpParameter>;
    private readonly _ANONYMOUS_KINDS = ['body', 'context', 'response', 'request', 'application'] as Array<HttpParameter>;

    // endregion properties

    constructor(private pool: ApiPoolLike) {

    }

    newItem(ref: ParameterReflectionLike): ParameterItem {
        return {
            ref,
            place: undefined,
            kind: undefined,
            flags: [],
            resource: undefined,
            resourceMap: {},
        } as ParameterItem;
    }

    protected _buildItems(paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        paramRefList.forEach(paramRef =>
            endpointItem.parameters.push(this.newItem(paramRef))
        );
    }

    /**
     * - Default parameter is not allowed in endpoint
     * - Variadic parameter is not allowed in endpoint
     * */
    @MethodTested(600, 601)
    protected _checkNotAllowed(paramRefList: Array<ParameterReflectionLike>): void {
        paramRefList.forEach(paramRef => {
            if (paramRef.hasDefault) {
                throw $dev.developerError2(FQN, 600, {
                    issue: 'Default parameter is not allowed in endpoint',
                    desc: paramRef.description
                });
            }
            if (paramRef.isVariadic) {
                throw $dev.developerError2(FQN, 601, {
                    issue: 'Variadic parameter is not allowed in endpoint',
                    desc: paramRef.description
                });
            }
        });
    }

    @MethodTested(602, 603)
    protected _kindFromDeco(paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        const singleUsed = [] as Array<Func>;
        paramRefList
            .forEach((paramRef, index) => {
                const item = endpointItem.parameters[index];
                paramRef.docsAll()
                    .filter(doc => doc.ins.identifier.hasKeyword('api'))
                    .forEach(doc => {
                        const fn = doc.ins.identifier.fn;
                        const kind = this._KIND_BY_DECO[fn.name];
                        switch (fn) {
                            case Body:
                            case AsApp:
                            case AsContext:
                            case AsRequest:
                            case AsResponse:
                                this._only1Deco(item);
                                if (this._multipleUsedDeco(item, doc.ins, singleUsed)) {
                                    break;
                                }
                                this._setKind(item, kind);
                                this._appendFlag(item, 'kind-from-deco');
                                break;
                            case Cookie:
                            case File:
                            case Header:
                            case Param:
                            case Query:
                            case Cookies:
                            case Files:
                            case Headers:
                            case Params:
                            case Queries:
                                this._only1Deco(item);
                                this._setKind(item, kind);
                                this._appendFlag(item, 'kind-from-deco');
                                break;
                        }
                    });
            });

    }

    /**
     * Case 1
     * */
    @MethodTested(602)
    protected _only1Deco(item: ParameterItem): void {
        if (item.flags.includes('has-deco')) {
            throw $dev.developerError2(FQN, 602, {issue: 'A Parameter can use only one place decorator'});
        }
        item.flags.push('has-deco');
    }

    @MethodTested(603)
    protected _multipleUsedDeco(item: ParameterItem, ins: DecoInstanceLike, singleUsed: Array<Func>): boolean {
        if (singleUsed.includes(ins.identifier.fn)) {
            this.logger.deploy.$warning(FQN, 603, {
                issue: `Anonymous decorators can be used only one time`,
                desc: ins.description,
                item: item.ref.description,
            });
            return true;
        }
        singleUsed.push(ins.identifier.fn);
        return false;
    }

    @MethodTested(610, 611, 612,
        613, 614,
        630, 631, 632, 633, 634, 635, 640, 641, 642,
        646, 647, 648)
    protected _nameFromDeco(paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        paramRefList
            .forEach((paramRef, index) => {
                const item = endpointItem.parameters[index];
                if (!this._hasFlag(item, 'has-deco')) {
                    return;
                }
                if (this._ANONYMOUS_KINDS.includes(item.kind)) {
                    return;
                }
                paramRef.docsAll()
                    .filter(doc => doc.ins.identifier.hasKeyword('api'))
                    .forEach(doc => {
                        switch (doc.ins.identifier.fn) {
                            case Cookie:
                            case File:
                            case Header:
                            case Query:
                            case Param:
                                this._retrieveMonoResource(endpointItem, item, doc.value as MonoParamOpt);
                                this._checkUniqueNames(endpointItem, item);
                                break;
                            case Cookies:
                            case Files:
                            case Headers:
                            case Params:
                            case Queries:
                                this._retrievePolyResources(endpointItem, item, doc.value as PolyGivenParams);
                                this._checkMultiple(endpointItem, item);
                                break;
                        }
                    });
            });

    }

    @MethodTested(610, 611, 612)
    protected _checkUniqueNames(endpointItem: EndpointItem, item: ParameterItem): void {
        if (item.resource) {
            if (item.place === 'path') {
                if (endpointItem.usableNames.includes(item.resource)) {
                    endpointItem.usableNames.delete(item.resource);
                } else {
                    throw $dev.developerError2(FQN, 610, {
                        issue: 'Path value does not exist in endpoint path',
                        kind: item.kind,
                        current: item.resource,
                        expected: endpointItem.pathNames,
                        desc: item.ref.description
                    });
                }
            }
            if (endpointItem.uniqueNames[item.kind] === undefined) {
                endpointItem.uniqueNames[item.kind] = [];
            }
            if (endpointItem.uniqueNames[item.kind].includes(item.resource)) {
                throw $dev.developerError2(FQN, 612, {
                    issue: 'Resource is reserved by another parameter',
                    kind: item.kind,
                    resource: item.resource,
                    desc: item.ref.description
                });
            } else {
                endpointItem.uniqueNames[item.kind].push(item.resource);
            }
            this._appendFlag(item, 'resource-from-deco');
        }
    }

    @MethodTested(646, 647, 648)
    protected _checkMultiple(endpointItem: EndpointItem, item: ParameterItem): void {
        if (endpointItem.allUsed[item.kind] === undefined) {
            endpointItem.allUsed[item.kind] = [];
        }
        if (endpointItem.reservedNames[item.kind] === undefined) {
            endpointItem.reservedNames[item.kind] = [];
        }
        if (item.all) {
            item.all = true;
            const indexes = endpointItem.allUsed[item.kind];
            if (indexes.length > 0) {
                const others = endpointItem.parameters
                    .filter(ep => indexes.includes(ep.ref.index))
                    .map(ep => `${ep.ref.name}#${ep.ref.index}`);
                this.logger.deploy.$warning(FQN, 646, {
                    issue: 'Parameter focuses all values, but others too',
                    index: item.ref.index,
                    place: item.place,
                    others,
                    desc: item.ref.description
                });
            }
            indexes.push(item.ref.index);
        } else {
            const values = {} as Record<string, string>;
            for (const [key, value] of Object.entries(item.resourceMap)) {
                if (endpointItem.reservedNames[item.kind].includes(key)) {
                    this.logger.deploy.$warning(FQN, 647, {
                        issue: 'Key is also focused by another parameter',
                        kind: item.kind,
                        key,
                        value,
                        desc: item.ref.description
                    });
                } else {
                    endpointItem.reservedNames[item.kind].push(key);
                }
                if (key !== value) {
                    if (values[value] !== undefined) {
                        this.logger.deploy.$warning(FQN, 648, {
                            issue: 'Value is also reserved by another key in same parameter',
                            kind: item.kind,
                            key,
                            anotherKey: values[value],
                            value,
                            desc: item.ref.description
                        });
                    } else {
                        values[value] = key
                    }
                }
            }
        }
        this._appendFlag(item, 'resource-from-deco');
    }

    @MethodTested(613, 614)
    protected _retrieveMonoResource(_endpointItem: EndpointItem, item: ParameterItem, param: MonoParamOpt): void {
        let isRemoteSnakeCase: boolean;
        // boolean case
        if (typeof param.field === 'boolean') {
            if (param.field === true) {
                isRemoteSnakeCase = true;
                delete param.field;
            }
            else {
                throw $dev.developerError2(FQN, 613, {issue: 'Only true can be used in place of false', field: 'isRemoteSnakeCase', desc: item.ref.description});
            }
        }
        else {
            $assert.textOptional(param.field, () => [FQN, 614, {field: 'field', desc: item.ref.description}]);
        }
        if (!param.field) {
            if (param.field && ['header', 'cookie'].includes(item.place)) {
                param.field = this._camelToKebab(item.ref.name);
                this._appendFlag(item, 'field-formatted');
            }
            else if (isRemoteSnakeCase) {
                param.field = this._camelToSnake(item.ref.name);
                this._appendFlag(item, 'field-formatted');
            }
        }
        else {
            this._appendFlag(item, 'field-given');
        }
        item.resource = param.field as string;
    }

    @MethodTested(630, 631, 632, 633, 634, 635, 640, 641, 642)
    protected _retrievePolyResources(_endpointItem: EndpointItem, item: ParameterItem, param: PolyGivenParams): void {
        // boolean or empty case
        if (typeof param.allOrFields === 'boolean' || $is.empty(param.allOrFields)) {
            if (param.allOrFields === true) {
                item.all = true;
                return;
            }
            throw $dev.developerError2(FQN, 630, {issue: 'Only true can be used for all keys', desc: item.ref.description});
        }

        const uniqueValues = [] as Array<string>;
        const uniqueKeys = [] as Array<string>;

        // map case
        if ($is.bareObject(param.allOrFields)) {
            $assert.booleanOptional(param.snakeOrSupport, () => [FQN, 631, {issue: 'Support multi mapping flag should be boolean or undefined (not given)', field: 'supportMultiMapping', desc: item.ref.description}]);
            const supportMultiMapping = param.snakeOrSupport;

            let index = 0;
            for (const [key,value] of Object.entries(param.allOrFields)) {
                $assert.text(key, () => [FQN, 632, {issue: 'Keys in the map, should be text (string, trimmed and not empty)', field: `map.key.#${index}/${key}`, desc: item.ref.description}]);
                $assert.text(value, () => [FQN, 633, {issue: 'Keys in the map, should be text (string, trimmed and not empty)', field: `map.value.#${index}/${key}`, desc: item.ref.description}]);
                if (uniqueValues.includes(value) && !supportMultiMapping) {
                    this.logger.deploy.$warning(FQN, 634, {
                        issue: 'Parameter focuses all values, but others too',
                        key, value,
                        index: item.ref.index,
                        place: item.place,
                        desc: item.ref.description
                    });
                }
                uniqueValues.push(value);
                if (item.resourceMap === undefined) {
                    item.resourceMap = {};
                }
                item.resourceMap[key] = value;
                index++;
            }
            if (Object.keys(item.resourceMap).length < 1) {
                throw $dev.developerError2(FQN, 635, {issue: 'Keys map is empty', desc: item.ref.description});
            }
            return;
        }

        // array case
        $assert.booleanOptional(param.snakeOrSupport, () => [FQN, 640, {issue: 'Is remote snake case flag should be boolean or undefined (not given)', field: 'isRemoteSnakeCase', desc: item.ref.description}]);
        $assert.textArray(param.allOrFields, () => [FQN, 641, {issue: 'Keys array should be a text array', field: 'fields', desc: item.ref.description}]);
        const isRemoteSnakeCase = param.snakeOrSupport;

        const fields = param.allOrFields as Array<string>;
        fields.forEach((key, index) => {
            if (uniqueKeys.includes(key)) {
                this.logger.deploy.$warning(FQN, 642, {
                    issue: 'Duplicated values in fields array',
                    key, index,
                    desc: item.ref.description
                });
                return;
            }
            uniqueKeys.push(key);
            let nwqKey = key;
            if (isRemoteSnakeCase || item.place === 'header') {
                nwqKey = this._kebabToCamel(key);
            }
            item.resourceMap[nwqKey] = key;
        });
    }

    //560
    protected _nameFromPath(paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        paramRefList
            .forEach((paramRef, index) => {
                const item = endpointItem.parameters[index];
                if (this._ANONYMOUS_KINDS.includes(item.kind)) {
                    return;
                }
                // resource is already found
                if (this._hasFlag(item, 'resource-from-deco')) {
                    return;
                }
                // if kind is known and it's not param
                if (item.kind && item.kind !== 'param') {
                    return;
                }
                // if reflection name is in path
                if (endpointItem.usableNames.includes(item.ref.name)) {
                    if (!item.kind) {
                        this._setKind(item, 'param');
                        this._appendFlag(item, 'kind-from-path');
                    }
                    this._appendFlag(item, 'resource-from-path');
                    item.resource = item.ref.name;
                    endpointItem.usableNames.delete(item.ref.name);
                }
            });
    }

    @MethodTested(650)
    protected _kindFromReflect(paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        paramRefList
            .forEach((paramRef, index) => {
                const item = endpointItem.parameters[index];
                if (this._hasFlag(item, 'has-deco')) {
                    return;
                }
                if (!paramRef.name) {
                    return;
                }

                const resource = paramRef.name;
                const kind = this._KIND_BY_NAME[resource.toLowerCase()];
                if (kind !== undefined) {
                    const isAnonymous = this._ANONYMOUS_KINDS.includes(kind);
                    const isMultiple = this._NAME_POLY.includes(kind);
                    if (isAnonymous || isMultiple) {
                        if (endpointItem.kindMap[kind] === undefined) {
                            endpointItem.kindMap[kind] = item.ref.index;
                            this._setKind(item, kind);
                            this._appendFlag(item, 'kind-from-ref');
                            this._appendFlag(item, 'resource-from-ref');
                            if (isAnonymous) {
                                item.resource = resource;
                            } else {
                                item.all = true;
                            }
                        }
                    }
                }

            });
    }

    @MethodTested(660)
    protected _kindFromEmpty(_paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        const emptyKinds = endpointItem.parameters.filter(p => !p.kind);
        // there is only 1 hole and body is not reserved
        if (emptyKinds.length === 1 && endpointItem.kindMap.body === undefined) {
            const item = emptyKinds[0];
            this._setKind(item, 'body');
            this._appendFlag(item, 'kind-from-empty');
            this._appendFlag(item, 'resource-from-empty');
            endpointItem.kindMap.body = item.ref.index;
        }
    }

    @MethodTested(661)
    protected _checkEmptyKind(_paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        const emptyKinds = endpointItem.parameters.filter(p => !p.kind);
        if (emptyKinds.length > 0) {
            const notAttended = emptyKinds
                .map(item => item.ref.description);
            throw $dev.developerError2(FQN, 661, {
                issue: 'Some parameters are attended to any resource',
                desc: endpointItem.methodRef.description,
                notAttended
            });
        }
    }

    protected _useFirstValue(_paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        const emptyResources = endpointItem.parameters.filter(p => !p.resource);
        if (emptyResources.length > 0) {
            emptyResources.forEach(item => {
                switch (item.kind) {
                    case "param":
                        if (endpointItem.usableNames.length === 1) {
                            const resource = endpointItem.usableNames[0];
                            endpointItem.usableNames.delete(resource);
                            item.resource = resource;
                            this._appendFlag(item, 'resource-from-path'); // 671
                            this._appendFlag(item, 'use-first-value');
                        } else {
                            throw $dev.developerError2(FQN, 670, {
                                issue: 'There is not any path param in the endpoint',
                                desc: item.ref.description
                            });
                        }
                        break;
                    case "file":
                    case "header":
                    case "query":
                    case "cookie":
                        this._appendFlag(item, 'use-first-value'); // 672
                        break;
                }
            });
        }
    }

    // 610
    protected _checkRemainingPaths(_paramRefList: Array<ParameterReflectionLike>, endpointItem: EndpointItem): void {
        if (endpointItem.usableNames.length > 0) {
            const remainingPaths = endpointItem.usableNames.filter(path => !endpointItem.ignorableNames.includes(path));
            if (remainingPaths.length > 0) {
                this.logger.deploy.$warning(FQN, 610, {
                    issue: `Endpoint has remaining path values which are not used by any parameter`,
                    desc: endpointItem.methodRef.description,
                    remainingPaths
                });
            }
        }
    }

    protected _appendFlag(item: ParameterItem, flag: ParameterControlFlag): void {
        if (item.flags.includes(flag)) {
            return;
        }
        item.flags.push(flag);
    }

    protected _hasFlag(item: ParameterItem, flag: ParameterControlFlag): boolean {
        return item.flags.includes(flag);
    }

    protected _setKind(item: ParameterItem, kind: HttpParameter): void {
        item.kind = kind;
        item.place = this._PLACE_BY_KIND[kind];
    }

    protected _kebabToCamel(str: string) {
        return str.toLowerCase()
            .replace(/([-_][a-z])/g, (group: string) =>
                group.toUpperCase().replace('-', '').replace('_', '')
            )
    }

    protected _camelToKebab(str: string) {
        return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1\-').toLowerCase();
    }

    protected _camelToSnake(str: string) {
        return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1\_').toLowerCase();
    }

    forMethod(methodRef: PropertyReflectionLike, endpointItem: EndpointItem): void {
        const paramRefList = methodRef.listParameters();
        if (paramRefList.length < 1) {
            return;
        }

        this._buildItems(paramRefList, endpointItem);
        this._checkNotAllowed(paramRefList);
        this._kindFromDeco(paramRefList, endpointItem);
        this._nameFromDeco(paramRefList, endpointItem);
        this._nameFromPath(paramRefList, endpointItem);
        this._kindFromReflect(paramRefList, endpointItem);
        this._useFirstValue(paramRefList, endpointItem);
        this._kindFromEmpty(paramRefList, endpointItem);
        this._checkEmptyKind(paramRefList, endpointItem);
        this._checkRemainingPaths(paramRefList, endpointItem);

    }

    clear(): void {

    }

    fetchParameters(): void {
        this.pool.endpoint.allEndpoints
            .forEach((endpointItem, methodRef) => {
                this.forMethod(methodRef, endpointItem);
            });
    }
    printDeploy(): void {}
}
