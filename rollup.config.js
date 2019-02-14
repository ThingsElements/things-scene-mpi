import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import url from "rollup-plugin-url";
import builtins from "rollup-plugin-node-builtins";

let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);
let plugins = [
  url({
    limit: 30000
  }),
  builtins(),
  resolve({ browser: true, preferBuiltins: true }),
  babel(),
  commonjs(),
  terser({
    sourcemap: true
  })
];

export default [
  {
    input: "src/index.js",
    plugins,
    external,
    output: [
      {
        file: "dist/things-scene-mpi.js",
        name: "things-scene-mpi",
        format: "umd",
        globals: {
          "@hatiolab/things-scene": "scene"
        }
      }
    ]
  },
  {
    input: "src/index.js",
    plugins,
    external: ["@hatiolab/things-scene"],
    output: [
      {
        file: pkg.module,
        format: "esm"
      }
    ]
  }
];
