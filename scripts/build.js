const { dependencies } = require("../package.json");

require("esbuild").buildSync({
  entryPoints: ["src/cli.ts"],
  bundle: true,
  platform: "node",
  target: ["node12"],
  external: [...Object.keys(dependencies || {})],
  outfile: "lib/cli.js",
  minify: true,
});
