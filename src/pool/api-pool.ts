import {decoratorPool,Fqn, lifecycle} from "@leyyo/core";
import {$deploy, $log} from "@leyyo/common";

import {FQN} from "../internal";
import {ApplicationProcessor, ApplicationProcessorLike} from "../application";
import {ControllerProcessor, ControllerProcessorLike} from "../controller";
import {EndpointProcessor, EndpointProcessorLike} from "../endpoint";
import {ParameterProcessor, ParameterProcessorLike} from "../parameter";
import {IgnoreProcessor, IgnoreProcessorLike} from "../ignore";
import {AttachmentProcessor, AttachmentProcessorLike} from "../attachment";
import {ApiPoolLike} from "./index-types";

@Fqn(FQN)
class ApiPool implements ApiPoolLike {
    private readonly logger = $log.create(ApiPool);

    private readonly _attachment: AttachmentProcessorLike;
    private readonly _ignore: IgnoreProcessorLike;
    private readonly _application: ApplicationProcessorLike;
    private readonly _controller: ControllerProcessorLike;
    private readonly _endpoint: EndpointProcessorLike;
    private readonly _parameter: ParameterProcessorLike;

    constructor() {
        this._attachment = new AttachmentProcessor(this);
        this._ignore = new IgnoreProcessor(this);
        this._application = new ApplicationProcessor(this);
        this._controller = new ControllerProcessor(this);
        this._endpoint = new EndpointProcessor(this);
        this._parameter = new ParameterProcessor(this);

        lifecycle.onAll(FQN)
            .after('leyyo.ruler')
            .after('leyyo.cast')
            .after('leyyo.injection')
            .after('leyyo.validator')
            .after('leyyo.pipe')
            .after('leyyo.middleware')

        lifecycle.onInitialize(FQN, () => this._fetch());
        lifecycle.onValidate(FQN, () => this._bind());
        lifecycle.onProcess(FQN, () => this._process());
    }

    clear(): void {
        $deploy.clearMessages();

        this._ignore.clear();
        this._application.clear();
        this._controller.clear();
        this._attachment.clear();
        this._endpoint.clear();
        this._parameter.clear();
        decoratorPool.decorators()
            .filter(deco => deco.hasKeyword('api'))
            .forEach(deco => deco.clearInstances());
    }

    get attachment(): AttachmentProcessorLike {
        return this._attachment;
    }

    get ignore(): IgnoreProcessorLike {
        return this._ignore;
    }

    get application(): ApplicationProcessorLike {
        return this._application;
    }

    get controller(): ControllerProcessorLike {
        return this._controller;
    }

    get endpoint(): EndpointProcessorLike {
        return this._endpoint;
    }

    get parameter(): ParameterProcessorLike {
        return this._parameter;
    }

    protected _fetch() {
        this._ignore.fetchClasses();
        this._application.fetchClasses();
        this._controller.fetchClasses();
        this._attachment.fetchAttachments();
        this._endpoint.fetchMethods();
    }

    protected _bind() {
        this._application.bindItem();
    }

    protected _process() {
        this._application.start();
    }

    protected _clear() {
        this._application.start();
    }
}

export const apiPool: ApiPoolLike = new ApiPool();
