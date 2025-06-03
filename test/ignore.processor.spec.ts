import {strict as assert} from 'assert';
import {$deploy, $test} from "@leyyo/common";

import {apiPool, Controller, HttpApp, IgnoreControllers} from "../src";
import {FQN} from "../src/internal";

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

            assert.equal($deploy.has(FQN, 200), 'warning');
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
            assert.equal($deploy.has(FQN, 201), 'warning');
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

            assert.equal($deploy.has(FQN, 202), 'info');
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
            assert.equal($deploy.has(FQN, 203), 'info');
        });
    });
});
