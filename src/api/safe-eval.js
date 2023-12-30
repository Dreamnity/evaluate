/* eslint-disable no-global-assign */
if (process.version < 21)
	throw new Error("Requires node > 21 to properly limit permissions.");
if (!process.permission) throw new Error("Need --experimental-permission");
const { isMainThread, parentPort, workerData: code } = require('node:worker_threads');
function hideCall(ae) {
	if (typeof ae !== "function")
		throw new TypeError("Expected function, got " + typeof ae);
	var a = ae;
	// why is pretty-ignore not working
	// prettier-ignore
	var $ = eval("(...e)=>a(...e)");
	// ...i have no choice
	return $;
}
const convertStr = (e, old, req = require) => {
	const util = req("node:util", Object.getPrototypeOf(JSON).key);
	try {
		if (old) throw "";
		if (typeof e === "string") return e;
		return util.inspect(e);
	} catch {
		switch (typeof e) {
			case "string":
				return e;
			case "object":
				return JSON.stringify(e, null, 2);
			case "undefined":
				return "Undefined";
			default:
				try {
					return e.toString();
				} catch {
					return e;
				}
		}
	}
};
const oldeval = eval;
if (isMainThread) {
	const { Worker } = require("node:worker_threads");
	const fs = require("fs");
	let globs = {};
	/**
	 * eval() but runs in worker and did various protections, intended for eval command
	 * @param {string} code Javascript only ;-; you should already know
	 * @param {object} options what
	 * @returns {string} result
	 */
	// eslint-disable-next-line no-shadow-restricted-names
	const eval = (
		code = '"No code provided"',
		{ timeout = 5000, allowUnchecked = false, globals = {}, apifolder } = {}
	) => {
		if (apifolder)
			fs.readdirSync(apifolder).forEach(
				e =>
					(globs[e.substring(0, e.length - 3)] = require(__dirname +
						apifolder +
						e))
			);
		return new Promise((resolve, reject) => {
			if (allowUnchecked)
				Object.keys(globals).forEach(e => (global[e] = globals[e]));
			const worker = new Worker(__filename, {
				workerData: code.replace(/import\((.+)\)/, "require($1)"),
			});
			var terminated = false;
			setTimeout(() => {
				if (!terminated) {
					reject(new EvalError("Timed out! (" + timeout + "ms)"));
					terminated = true;
					worker.terminate();
				}
			}, timeout);
			worker.on("message", async e => {
				if (e?.aaaaaaaaaaaaaaaaaaaaaaaaaaaauwuaaaa)
					try {
						const result = await oldeval(e.code);
						if (allowUnchecked) worker.postMessage(convertStr(result));
						else {
							reject(
								new Error(
									"unchecked() usage is not allowed!(configured by backend)"
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
			worker.on("error", reject);
			worker.on("exit", code => {
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
		Object.setPrototypeOf(JSON, {
			parse: console.log,
			key: Symbol(
				"requirekey" + require("crypto").randomBytes(100).toString("base64")
			),
		});
		/*String.getPrototypeOf = Object.getPrototypeOf
        Object.getPrototypeOf = object=>object===JSON?console.error('no.'):String.getPrototypeOf(object);*/
		process = module = global = {};
		process.exit = () => console.error("no");
		const tmp = (() => {
			const req2 = require("module").createRequire(__filename);
			return hideCall(
				(
					pkg, //hideCall protect function from .toString()
					something
				) => {
					let req = req2; //secret
					if (
						something === Object.getPrototypeOf(JSON).key &&
						pkg.startsWith("node:util")
					)
						return { inspect: req(pkg).inspect };
					return typeof pkg === "string"
						? [
								//Banned modules
								"fs",
								"child_process",
								"worker_threads",
								"v8",
								"vm",
								"process",
								"repl",
								"module",
								"fs/promises",
								"os",
              "console",
              'wasi',
                'module'
						  ].includes(pkg.startsWith("node:") ? pkg.substring(5) : pkg) ||
						  req("fs").existsSync(req.resolve(pkg)) //Local file detection, this part is broken*/
							? console.error(
									"require disabled on this module! (" + pkg + ")"
							  ) || {}
							: req(pkg)
						: (() => {
								throw new Error("Expected string");
						  })();
				}
			);
		})();
		require = tmp;
		// eslint-disable-next-line no-unused-vars
		let unchecked = hideCall(
			code =>
				new Promise(r => {
					parentPort.once("message", r);
					parentPort.postMessage({
						code,
						aaaaaaaaaaaaaaaaaaaaaaaaaaaauwuaaaa: true,
					});
				})
		);
		let conout = "";
		console = new Proxy(console, {
			get: hideCall((t, p) => {
				return hideCall((...e) => {
					conout +=
						"[" +
						p +
						"] " +
						e.map(e => convertStr(e, false, require)).join(" ") +
						"\n";
				});
			}),
		});
		const result =
			convertStr(await eval(code)) +
			(conout ? "\nConsole output:\n" + conout : "");
		console.log = Object.getPrototypeOf(JSON).parse;
		parentPort.postMessage(result);
	})();
}
