import {strict as assert} from 'assert';
import {describe, it} from "node:test";
import {lifecycle, reflectionPool} from "@leyyo/core";
import {Get, httpSigner} from "@leyyo/http";
import {$test} from "@leyyo/common";
import {
    apiPool,
    AsApp, AsContext, AsCtx,
    AsReq,
    AsRequest, AsRes, AsResponse,
    Body, Controller,
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

describe('30* >> Controller', () => {
    it($test.title(300, '[e] Controller is already an application'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.throws(() => {

                @HttpApp()
                @Controller('users')
                class App300 {

                }
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN_PCK, 300));
                return true;
            });
    });
    it($test.title(301, '[w] Controller is already signed'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

                @HttpApp()
                class App301 {

                }

                @Controller('users')
                class Controller301 {

                }
                httpSigner.append(Controller301, 'http.controller'); // hack the system
                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();

                assert.equal(lifecycle.hasWarning(FQN_PCK, 301), true);
            });
    });
    it($test.title(302, '[w] Controller is duplicated'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

            @HttpApp()
            class App302 {

            }

            @Controller('users')
            class Controller302 {

            }
            const classRef = reflectionPool.get(Controller302); // hack the system
            apiPool.controller.allClasses.set(classRef, apiPool.controller.newItem(classRef, 'users'));

            apiPool.ignore.fetchClasses();
            apiPool.application.fetchClasses();
            apiPool.controller.fetchClasses();

            assert.equal(lifecycle.hasWarning(FQN_PCK, 302), true);
        });
    });
    it($test.title(303, '[s] Controller is signed'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

            @HttpApp()
            class App303 {

            }

            @Controller('users')
            class Controller303 {

            }
            apiPool.ignore.fetchClasses();
            apiPool.application.fetchClasses();
            apiPool.controller.fetchClasses();

            assert.equal(lifecycle.hasInfo(FQN_PCK, 303), true);
        });
    });
});
