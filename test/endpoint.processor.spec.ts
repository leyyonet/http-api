import {strict as assert} from 'assert';
import {beforeEach, describe, it} from "node:test";
import {decoratorPool,reflectionPool} from "@leyyo/core";
import {Get, httpSigner, Method, Post} from "@leyyo/http";
import {$deploy, $test} from "@leyyo/common";

import {apiPool, Controller, HttpApp} from "../src";
import {FQN} from "../src/internal";

describe('50* >> Endpoint', () => {
    beforeEach(() => decoratorPool.get(Method).clearInstances());
    it($test.title(500, '[w] Method is already signed as an endpoint'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

            @HttpApp()
            class App500 {

            }

            @Controller('users')
            class Controller500 {

                @Get()
                getUsers500() {
                }
            }

            const methodRef = reflectionPool.get(Controller500).getInstanceProperty('getUsers500');
            httpSigner.append(methodRef.callable, 'http.endpoint'); // hack
            apiPool.ignore.fetchClasses();
            apiPool.application.fetchClasses();
            apiPool.controller.fetchClasses();
            apiPool.attachment.fetchAttachments();
            apiPool.endpoint.fetchMethods();

            assert.equal($deploy.has(FQN, 500), 'warning');
        });
    });
    it($test.title(501, '[w] Method is already signed as an endpoint'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

            @HttpApp()
            class App501 {

            }

            @Controller('users')
            class Controller501 {

                @Get()
                getUsers501() {
                }
            }

            httpSigner.appendExt(Controller501, 'getUsers501', 'methods'); // hacks
            apiPool.ignore.fetchClasses();
            apiPool.application.fetchClasses();
            apiPool.controller.fetchClasses();
            apiPool.attachment.fetchAttachments();
            apiPool.endpoint.fetchMethods();

            assert.equal($deploy.has(FQN, 501), 'warning');
        });
    });
    it($test.title(510, '[s] Endpoint is bound to application'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

            @HttpApp()
            class App510 {
                @Get()
                getUsers510() {
                }
            }

            apiPool.ignore.fetchClasses();
            apiPool.application.fetchClasses();
            apiPool.controller.fetchClasses();
            apiPool.attachment.fetchAttachments();
            apiPool.endpoint.fetchMethods();

            assert.equal($deploy.has(FQN, 510), 'info');
        });
    });
    it($test.title(521, '[e] Controller class is not signed as a controller or an app'), () => {
        // $test.$secure.$ok();

        assert.throws(() => {
                apiPool.clear();

                @HttpApp()
                class App521 {

                }

                @Controller()
                class Controller521 {

                    @Get()
                    getUsers521() {
                    }
                }

                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
                apiPool.attachment.fetchAttachments();
                apiPool.controller.allClasses.delete(reflectionPool.get(Controller521)); // hack
                apiPool.endpoint.fetchMethods();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 521));
                return true;
            });
    });
    it($test.title(522, '[s] Endpoint is bound to controller'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.doesNotThrow(() => {

            @HttpApp()
            class App522 {
            }

            @Controller()
            class Controller522 {
                @Post()
                getUsers522() {
                }
            }

            apiPool.ignore.fetchClasses();
            apiPool.application.fetchClasses();
            apiPool.controller.fetchClasses();
            apiPool.attachment.fetchAttachments();
            apiPool.endpoint.fetchMethods();

            assert.equal($deploy.has(FQN, 522), 'info');
        });
    });
    it($test.title(520, '[e] Controller class is not decorated as a controller'), () => {
        // $test.$secure.$ok();
        apiPool.clear();

        assert.throws(() => {

                @HttpApp()
                class App520 {

                }

                class Controller520 {

                    @Get()
                    getUsers520() {
                    }
                }

                apiPool.ignore.fetchClasses();
                apiPool.application.fetchClasses();
                apiPool.controller.fetchClasses();
                apiPool.attachment.fetchAttachments();
                apiPool.endpoint.fetchMethods();
            },
            error => {
                assert.equal((error as Error).message, $test.code(FQN, 520));
                return true;
            });
    });

});
