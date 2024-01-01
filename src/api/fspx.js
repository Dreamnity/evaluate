var fs = require("node:fs");
const getPath = e => Object.getPrototypeOf(e)["path"];
let init = (e = ["./"]) => {
	let path = e.join("/");
	var target;
	if (path == "./") {
		target = {
			_content: "Get content of the file",
			_stat: "Get fs.statSync of the file",
			_entries: "Get all entries of current dir(withFileType enabled)",
			"file = content;": "write content to file",
			"delete file;": "delete the file",
		};
	} else if (fs.existsSync(path)) {
		try {
			target = fs.readdirSync(path, { withFileTypes: true });
		} catch {
			target = fs.readFileSync(path);
		}
	} else target = { error: "Non existance" };
	Object.setPrototypeOf(target, { path: e, ...Object.getPrototypeOf(target) });
	return new Proxy(target, {
		get(t, p) {
			switch (p) {
				case "_entries":
					return fs.readdirSync(getPath(t).join("/"), { withFileTypes: true });
				case "_content":
					return fs.readFileSync(getPath(t).join("/"));
				case "_stat":
					return fs.statSync(getPath(t).join("/"));
				default:
					return init([...getPath(t), ...p.split("\\").join("/").split("/")]);
			}
		},
		set(t, p, v) {
			fs.mkdirSync(getPath(t).join("/"), { recursive: true });
			return fs.writeFileSync([...getPath(t), p].join("/"), v);
		},
		has(t, p) {
			return fs.existsSync([...getPath(t), p].join("/"));
		},
		apply(t, ta, a) {
			return init([
				...getPath(t),
				...a.map(e => e.split("\\").join("/").split("/")).flat(Infinity),
			]);
		},
		deleteProperty(t, p) {
			fs.mkdirSync(getPath(t).join("/"), { recursive: true });
			try {
				fs.rmSync("./" + [...getPath(t), p].join("/"));
				return true;
			} catch {
				return false;
			}
		},
	});
};
module.exports = init();
