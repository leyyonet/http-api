import {strict as assert} from 'assert';
import {PropertyReflectionLike, reflectionPool} from "@leyyo/core";
import {Get} from "@leyyo/http";
import {$deploy, $test} from "@leyyo/common";

import {
    apiPool,
    AsApp,
    AsContext,
    AsCtx,
    AsReq,
    AsRequest,
    AsRes,
    AsResponse,
    Body,
    Cookie,
    EndpointItem,
    Header,
    Param,
    Queries,
    Query
} from "../src";
import {FQN} from "../src/internal";

function newEndpointItem(ref: PropertyReflectionLike, paths?: Array<string>, ignorable?: Array<string>): EndpointItem {
    const endpointItem = apiPool.endpoint.newItem(ref, '');
    endpointItem.methods = ['get'];

    if (Array.isArray(paths) && paths.length > 0) {
        endpointItem.pathNames.push(...paths);
    }
    if (Array.isArray(ignorable) && ignorable.length > 0) {
        endpointItem.ignorableNames.push(...ignorable);
    }
    if (endpointItem.pathNames.length > 0) {
        endpointItem.usableNames.push(...endpointItem.pathNames);
    }
    return endpointItem;
}

describe('Constraints', () => {
    it($test.title(600, 'Default parameter is not allowed in endpoint'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.throws(() => {
                class Class600 {

                    @Get()
                    get(id: string = 'foo') {
                        return [id];
                    }
                }

                const ref = reflectionPool.get(Class600).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 600));
                return true;
            });
    });
    it($test.title(601, 'Variadic parameter is not allowed in endpoint'), () => {
        apiPool.clear();

        assert.throws(() => {
                class Class601 {

                    @Get()
                    get(...id: Array<any>) {
                        return [id];
                    }
                }

                const ref = reflectionPool.get(Class601).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 601));
                return true;
            });
    });
});
describe('Kind from decorator', () => {
    it($test.title(602, 'A Parameter can use only one place decorator'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class602 {

                    @Get()
                    get(@Header() @Cookie() value: any) {
                        return [value];
                    }
                }

                const ref = reflectionPool.get(Class602).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 602));
                return true;
            });
    });
    it($test.title(602, 'Parameter can use only one same decorator'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class1030 {

                    @Get()
                    get(@Cookie() @Cookie() value: any) {
                        return [value];
                    }
                }

                const ref = reflectionPool.get(Class1030).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code('leyyo.decorator', 120)); // @bound
                return true;
            });
    });
});
describe('Anonymous decorators', () => {
    it($test.title(603, 'Body can be used only one time'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Controller603F {

                @Get()
                get(@Body() body: any, @Body() payload: any) {
                    return [body, payload];
                }
            }

            const ref = reflectionPool.get(Controller603F).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 603), 'warning'); // payload index: 1
        });
    });
    it($test.title(603, 'Application can be used only one time'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Controller603A {

                @Get()
                get(@AsApp() application: any, @AsApp() app: any) {
                    return [application, app];
                }
            }

            const ref = reflectionPool.get(Controller603A).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 603), 'warning'); // app index: 1
        });
    });
    it($test.title(603, 'Request can be used only one time'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Controller603B {

                @Get()
                get(@AsRequest() request: any, @AsReq() req: any) {
                    return [request, req];
                }
            }

            const ref = reflectionPool.get(Controller603B).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 603), 'warning'); // req index: 1
        });
    });
    it($test.title(603, 'Response can be used only one time'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Controller603C {

                @Get()
                get(@AsResponse() response: any, @AsRes() res: any) {
                    return [response, res];
                }
            }

            const ref = reflectionPool.get(Controller603C).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 603), 'warning'); // res index: 1
        });
    });
    it($test.title(603, 'Context can be used only one time'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Controller603D {

                @Get()
                get(@AsContext() context: any, @AsCtx() ctx: any) {
                    return [context, ctx];
                }
            }

            const ref = reflectionPool.get(Controller603D).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 603), 'warning'); // ctx index: 1
        });
    });
});
describe('Mono resource in place decorators', () => {
    it($test.title(610, 'Path value does not exist in endpoint path'), () => {
        apiPool.clear();
        assert.throws(() => {
                class Class610 {
                    @Get()
                    get(@Param('incorrectKey') value: any) {
                        return [value];
                    }
                }
                const ref = reflectionPool.get(Class610).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref, ['correctKey']);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 610));
                return true;
            });
    });
    it($test.title(611, 'Path value reserved by earlier parameter'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class610A {
                    @Get()
                    get(@Param('customerId') customerId: any, @Param('customerId') customerId2: any) {
                        return [customerId, customerId2];
                    }
                }
                const ref = reflectionPool.get(Class610A).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref, ['customerId']);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 610)); // @bound
                return true;
            });
    });
    it($test.title(612, 'Resource is reserved by another parameter'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class612 {
                    @Get()
                    get(@Query('customerId') customerId: any, @Query('customerId') addressId: any) {
                        return [customerId, addressId];
                    }
                }
                const ref = reflectionPool.get(Class612).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 612));
                return true;
            });
    });
    it($test.title(613, 'Only true can be used in place of false'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class613 {
                    @Get()
                    get(@Query(false as true) customerId: any) { // hack the typescript with as keyword
                        return [customerId];
                    }
                }
                const ref = reflectionPool.get(Class613).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 613));
                return true;
            });
    });
    it($test.title(614, 'Field name should be trimmed string'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class614 {
                    @Get()
                    get(@Query('  ') customerId: any) { // hack the typescript with as keyword
                        return [customerId];
                    }
                }
                const ref = reflectionPool.get(Class614).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 614));
                return true;
            });
    });
    it($test.title(615, 'Field name a string - strictly'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class615 {
                    @Get()
                    get(@Query(44 as unknown as string) customerId: any) { // hack the typescript with as keyword
                        return [customerId];
                    }
                }
                const ref = reflectionPool.get(Class615).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 614));
                return true;
            });
    });
});
describe('Poly Resources (Map) in place decorators', () => {
    it($test.title(630, 'Only true can be used for all keys'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class630 {
                    @Get()
                    get(@Queries(false as true) customerId: any) { // hack the typescript with as keyword
                        return [customerId];
                    }
                }
                const ref = reflectionPool.get(Class630).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 630));
                return true;
            });
    });
    it($test.title(631, 'Support multi mapping flag should be boolean or undefined (not given)'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class631 {
                    @Get()
                    get(@Queries({customerId: 'customerId', customer_id: 'customerId', addressId: 'addressId', address_id: 'addressId', city: 'city'}, 'foo' as unknown as boolean) addressInfo: any) { // hack the typescript with as keyword
                        return [addressInfo];
                    }
                }
                const ref = reflectionPool.get(Class631).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 631));
                return true;
            });
    });
    it($test.title(632, 'Keys (remote resources) in the map, should be text (string, trimmed and not empty)'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class632 {
                    @Get()
                    get(@Queries({'customer_id ': 'xx', customer_id: 'customerId', addressId: 'addressId', address_id: 'addressId', city: 'city'}, true) addressInfo: any) { // hack the typescript with as keyword
                        return [addressInfo];
                    }
                }
                const ref = reflectionPool.get(Class632).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 632));
                return true;
            });
    });
    it($test.title(633, 'Values (inside keys) in the map, should be text (string, trimmed and not empty)'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class633 {
                    @Get()
                    get(@Queries({'customerId': true as unknown as string, customer_id: 'customerId', addressId: 'addressId', address_id: 'addressId', city: 'city'}, true) addressInfo: any) { // hack the typescript with as keyword
                        return [addressInfo];
                    }
                }
                const ref = reflectionPool.get(Class633).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 633));
                return true;
            });
    });
    it($test.title(634, 'Multiple remote keys are mapped to same inside key without supportMultiMapping (false or undefined)'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class634 {
                @Get()
                get(@Queries({
                    customerId: 'customerId',
                    customer_id: 'customerId',
                    addressId: 'addressId',
                    address_id: 'addressId',
                    city: 'city'
                }, false) addressInfo: any) {
                    return [addressInfo];
                }
            }
            const ref = reflectionPool.get(Class634).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 634), 'warning'); // addressInfo index: 0
        });
    });
    it($test.title(635, 'Keys map is empty'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class635 {
                    @Get()
                    get(@Queries({}, false) addressInfo: any) {
                        return [addressInfo];
                    }
                }
                const ref = reflectionPool.get(Class635).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
                assert.equal($deploy.has(FQN, 635), 'warning'); // addressInfo index: 0
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 635));
                return true;
            });
    });
});

describe('Poly Resources (Array) in place decorators', () => {
    it($test.title(640, 'Is remote snake case flag should be boolean or undefined (not given)'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class640 {
                    @Get()
                    get(@Queries(['key1', 'key2'], 'foo' as unknown as boolean) addressInfo: any) { // hack the typescript with as keyword
                        return [addressInfo];
                    }
                }
                const ref = reflectionPool.get(Class640).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 640));
                return true;
            });
    });
    it($test.title(641, 'Keys array should be a text array'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class641 {
                    @Get()
                    get(@Queries([], true) addressInfo: any) { // hack the typescript with as keyword
                        return [addressInfo];
                    }
                }
                const ref = reflectionPool.get(Class641).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 641));
                return true;
            });
    });
    it($test.title(642, 'Duplicated values in fields array'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class642 {
                @Get()
                get(@Queries(['key1', 'key1'] as Array<string>, true) addressInfo: any) { // hack the typescript with as keyword
                    return [addressInfo];
                }
            }
            const ref = reflectionPool.get(Class642).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 642), 'warning'); // addressInfo index: 0
        });
    });
});

describe('Poly Resources in place decorators', () => {
    it($test.title(646, 'Parameter focuses all values, but others too'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class646 {
                @Get()
                get(@Queries(true) allQueries: any, @Queries(true) queries: any) {
                    return [allQueries, queries];
                }
            }
            const ref = reflectionPool.get(Class646).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 646), 'warning'); // queries index: 1
        });
    });
    it($test.title(647, 'Key is also focused by another parameter'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {
            class Class647 {
                // addressId ia used by two parameters
                @Get()
                get(
                    @Queries({customer_id: 'customerId', address_id: 'addressId'}) customerInfo: any,
                    @Queries({address_id: 'addressId', city: 'city'}) addressInfo: any) {
                    return [customerInfo, addressInfo];
                }
            }
            const ref = reflectionPool.get(Class647).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 647), 'warning'); // queries index: 1
        });
    });
    it($test.title(648, 'Value is also reserved by another key in same parameter'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {
            class Class648 {
                // incoming customer_id and customerID values are mapped to same inside parameter
                @Get()
                get(
                    @Queries({customer_id: 'customerId', customerID: 'customerId'}) customerInfo: any) {
                    return [customerInfo];
                }
            }
            const ref = reflectionPool.get(Class648).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref);
            apiPool.parameter.forMethod(ref, endpointItem);
            assert.equal($deploy.has(FQN, 648), 'warning'); // queries index: 1
        });
    });
});

describe('Find with parameter name', () => {
    it($test.title(650, 'Bind [application] named parameter to application resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Application {
                @Get()
                get(application: string) {
                    return [application];
                }
            }
            const ref = reflectionPool.get(Class650Application).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'application');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [app] named parameter to application resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650App{
                @Get()
                get(app: string) {
                    return [app];
                }
            }
            const ref = reflectionPool.get(Class650App).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'application');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [body] named parameter to body resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Body {
                @Get()
                get(body: string) {
                    return [body];
                }
            }
            const ref = reflectionPool.get(Class650Body).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'body');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [payload] named parameter to body resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Payload {
                @Get()
                get(payload: string) {
                    return [payload];
                }
            }
            const ref = reflectionPool.get(Class650Payload).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'body');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [ctx] named parameter to context resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Ctx {
                @Get()
                get(ctx: string) {
                    return [ctx];
                }
            }
            const ref = reflectionPool.get(Class650Ctx).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'context');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [context] named parameter to context resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Context {
                @Get()
                get(context: string) {
                    return [context];
                }
            }
            const ref = reflectionPool.get(Class650Context).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'context');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [response] named parameter to response resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Response {
                @Get()
                get(response: string) {
                    return [response];
                }
            }
            const ref = reflectionPool.get(Class650Response).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'response');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [context] named parameter to response resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Res {
                @Get()
                get(res: string) {
                    return [res];
                }
            }
            const ref = reflectionPool.get(Class650Res).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'response');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [request] named parameter to request resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Request {
                @Get()
                get(request: string) {
                    return [request];
                }
            }
            const ref = reflectionPool.get(Class650Request).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'request');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [req] named parameter to request resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Req {
                @Get()
                get(req: string) {
                    return [req];
                }
            }
            const ref = reflectionPool.get(Class650Req).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'request');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [cookies] named parameter to all cookies resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Cookies {
                @Get()
                get(cookies: string) {
                    return [cookies];
                }
            }
            const ref = reflectionPool.get(Class650Cookies).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'cookies');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [headers] named parameter to all headers resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Headers {
                @Get()
                get(headers: string) {
                    return [headers];
                }
            }
            const ref = reflectionPool.get(Class650Headers).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'headers');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [params] named parameter to all params resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Params {
                @Get()
                get(params: string) {
                    return [params];
                }
            }
            const ref = reflectionPool.get(Class650Params).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'params');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [queries] named parameter to all queries resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Queries {
                @Get()
                get(queries: string) {
                    return [queries];
                }
            }
            const ref = reflectionPool.get(Class650Queries).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'queries');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
    it($test.title(650, 'Bind [files] named parameter to all files resource'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class650Files {
                @Get()
                get(files: string) {
                    return [files];
                }
            }
            const ref = reflectionPool.get(Class650Files).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[0]; // app
            assert.equal(paramItem.kind, 'files');
            assert.equal(paramItem.flags.includes('kind-from-ref'), true);
            assert.equal(paramItem.flags.includes('resource-from-ref'), true);
        });
    });
});

describe('Not attended parameters', () => {
    it($test.title(660, 'Attend empty parameter to body'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class Class660 {
                @Get()
                get(id: string, @Query() flag: boolean, body55: any) {
                    return [id, flag, body55];
                }
            }
            const ref = reflectionPool.get(Class660).getInstanceProperty('get');
            const endpointItem = newEndpointItem(ref, ['id']);
            apiPool.parameter.forMethod(ref, endpointItem);
            const paramItem = endpointItem.parameters[2]; // body55
            assert.equal(paramItem.kind, 'body');
            assert.equal(paramItem.flags.includes('kind-from-empty'), true);
            assert.equal(paramItem.flags.includes('resource-from-empty'), true);
        });
    });
    it($test.title(661, 'Some parameters are attended to any resource'), () => {
        apiPool.clear();

        assert.throws(() => {

                class Class661 {
                    @Get()
                    get(body1: any, body2: any) {
                        return [body1, body2];
                    }
                }
                const ref = reflectionPool.get(Class661).getInstanceProperty('get');
                const endpointItem = newEndpointItem(ref);
                apiPool.parameter.forMethod(ref, endpointItem);
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 661));
                return true;
            });
    });
});
