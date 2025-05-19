import {strict as assert} from 'assert';
import {describe, it} from "node:test";
import {lifecycle, reflectionPool} from "@leyyo/core";
import {Get} from "@leyyo/http";
import {$test} from "@leyyo/common";
import {
    apiPool,
    AsApp, AsContext, AsCtx,
    AsReq,
    AsRequest, AsRes, AsResponse,
    Body,
    Cookie,
    EndpointItem,
    Header, HttpApp, IgnoreControllers,
    Param,
    Queries,
    Query
} from "../index";

import {FQN_PCK} from "../internal";
import {PropertyReflectionLike} from "@leyyo/core";
import {List} from "@leyyo/common";

describe('10* >> Application', () => {
    it($test.title(100, '[i] Ignored application should not be evaluated'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.throws(() => {

                @HttpApp()
                class App100 {

                }

                @IgnoreControllers(App100)
                class Class100A {
                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN_PCK, 103)); // after info
                assert.equal(lifecycle.hasInfo(FQN_PCK, 100), true);
                return true;
            });
    });
    it($test.title(101, '[e] Multiple application is defined'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.throws(() => {

                @HttpApp()
                class App101A {

                }

                @HttpApp()
                class Class101B {
                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN_PCK, 101));
                return true;
            });
    });
    it($test.title(102, '[s] Application is found'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

                @HttpApp()
                class App102 {

                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();

            assert.equal(lifecycle.hasInfo(FQN_PCK, 102), true);
            });
    });
    it($test.title(103, '[e] There is not any application which is defined'), () => {
        apiPool.clear();

        assert.throws(() => {

                @HttpApp()
                class App100 {

                }

                @IgnoreControllers(App100)
                class Class100A {
                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN_PCK, 103));
                return true;
            });
    });
});
