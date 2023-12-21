/* eslint-disable no-global-assign */
const { isMainThread, parentPort, workerData } = require('node:worker_threads');
function hideCall(ae) {
    if (typeof ae !== 'function')
        throw new TypeError('Expected function, got ' + typeof ae);
    var a = ae;
    var shownFunc = function (...e) {
        return a(...e);
    };
    return shownFunc;
}
const convertStr = (e, old,req=require) => {
    const util = req('node:util',JSON);
    try {
        if (old) throw '';
        if (typeof e === 'string') return e;
        return util.inspect(e);
    } catch {
        switch (typeof e) {
            case 'string':
                return e;
            case 'object':
                return JSON.stringify(e, null, 2);
            case 'undefined':
                return 'Undefined';
            default:
                try {
                    return e.toString();
                } catch {
                    return e;
                }
        }
    }
};
if (isMainThread) {
    const { Worker } = require('node:worker_threads');
    const fs = require('fs');
    let globs = {};
    /**
     * eval() but runs in worker and did various protections, intended for eval command
     * @param {string} code Javascript only ;-; you should already know
     * @param {object} options what
     * @returns {string} result
     */
    // eslint-disable-next-line no-shadow-restricted-names
    const eval = (
        code = '',
        { timeout = 5000, allowUnchecked = false, globals = {}, apifolder } = {}
    ) => {
        if (apifolder)
            fs.readdirSync(apifolder).forEach(
                (e) =>
                (globs[e.substring(0, e.length - 3)] = require(__dirname +
                    apifolder +
                    e))
            );
        return new Promise((resolve, reject) => {
            if (allowUnchecked)
                Object.keys(globals).forEach((e) => (global[e] = globals[e]));
            const worker = new Worker(__filename, {
                workerData: code
            });
            var terminated = false;
            setTimeout(() => {
                if (!terminated) {
                    reject(new EvalError('Timed out! (' + timeout + 'ms)'));
                    terminated = true;
                    worker.terminate();
                }
            }, timeout);
            worker.on('message', (e) => {
                if (e?.aaaaaaaaaaaaaaaaaaaaaaaaaaaauwuaaaa)
                    try {
                        if (allowUnchecked) worker.postMessage(convertStr(eval(e.code)));
                        else {
                            reject(
                                new Error(
                                    'unchecked() usage is not allowed!(configured by backend)'
                                )
                            );
                            terminated = true;
                            worker.terminate();
                        }
                    } catch (e) {
                        reject(e);
                    }
                else resolve(e);
            });
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (!terminated && code !== 0)
                    reject(new Error(`Worker stopped with exit code ${code}`));
                terminated = true;
            });
        });
    };
    eval('"self-check"');
    module.exports = eval;
} else {
    (async () => {
        Object.setPrototypeOf(JSON, { stringify: require, parse: console.log });
        /*String.getPrototypeOf = Object.getPrototypeOf
        Object.getPrototypeOf = object=>object===JSON?console.error('no.'):String.getPrototypeOf(object);*/
        process = module = global = {};
        process.exit = () => console.error('no');
        require = hideCall(
            (
                pkg //hideCall protect function from .toString()
                ,something
            ) => {
                let req = Object.getPrototypeOf(JSON).stringify; //secret
                let cont = { req, pkg,local:null };
                let vm = req('vm');
                vm.createContext(cont);
                vm.runInContext(
                    "local=!req.resolve(pkg).includes('node_modules');",
                    cont
                );
                if(something===JSON&&pkg.startsWith('node:')) return req(pkg)
                return typeof pkg === 'string'
                    ? ([
                        //Banned modules
                        'fs',
                        'child_process',
                        'worker_threads',
                        'v8',
                        'vm',
                        'process',
                        'repl'
                    ].includes(pkg.startsWith('node:') ? pkg.substring(5) : pkg) ||
                        cont.local) //Local file detection, this part is broken*/
                        ? console.error('require disabled on this module! (' + pkg + ')') ||
                        {}
                        : req(pkg)
                    : (() => {
                        throw new Error('Expected string');
                    })();
            }
        );
        // eslint-disable-next-line no-unused-vars
        let unchecked = (code) =>
            new Promise((r) => {
                parentPort.postMessage({
                    code,
                    aaaaaaaaaaaaaaaaaaaaaaaaaaaauwuaaaa: true
                });
                parentPort.once('message', r);
            });
        let conout = '';
        console = new Proxy(console, {
            get: hideCall((t, p)=>{
                return (...e) => {
                    conout +=
                        '[' + p + '] ' + e.map((e) => convertStr(e,false,Object.getPrototypeOf(JSON).stringify)).join(' ') + '\n';
                };
            })
        });
        const result =
            convertStr(
                await eval(
                    '(async () => ' + (workerData || '"No code provided"') + ')()'
                )
            ) + (conout ? '\nConsole output:\n' + conout : '');
        console.log = JSON.parse;
        parentPort.postMessage(result);
    })();
}