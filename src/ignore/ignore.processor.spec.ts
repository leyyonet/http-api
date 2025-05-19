import {strict as assert} from 'assert';
import {describe, it} from "node:test";
import {$test} from "@leyyo/common";
import {apiPool, Controller, HttpApp, IgnoreControllers} from "../index";

import {FQN_PCK} from "../internal";
import {lifecycle} from "../../../core/src";

describe('20* >> Ignore', () => {
    it($test.title(200, '[w] Ignored class is not reflected'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            class App200 {

            }

            @IgnoreControllers(App200)
            class Class200A {
            }

            apiPool.ignore.fetchClasses();

            assert.equal(lifecycle.hasWarning(FQN_PCK, 200), true);
        });
    });
    it($test.title(201, '[w] Ignored class is already ignored'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            @Controller()
            class Class201 {

            }

            @IgnoreControllers(Class201, Class201)
            class Class201A {
            }

            apiPool.ignore.fetchClasses();
            assert.equal(lifecycle.hasWarning(FQN_PCK, 201), true);
        });
    });
    it($test.title(202, '[s] Application is ignored'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            @HttpApp()
            class Class202 {

            }

            @IgnoreControllers(Class202)
            class Class202A {
            }

            apiPool.ignore.fetchClasses();

            assert.equal(lifecycle.hasInfo(FQN_PCK, 202), true);
        });
    });
    it($test.title(203, '[s] Controller is ignored'), () => {
        apiPool.clear();

        assert.doesNotThrow(() => {

            @Controller()
            class Class203 {

            }

            @IgnoreControllers(Class203)
            class Class203A {
            }

            apiPool.ignore.fetchClasses();
            assert.equal(lifecycle.hasInfo(FQN_PCK, 203), true);
        });
    });
});
