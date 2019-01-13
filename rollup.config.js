// import commonjs from 'rollup-plugin-commonjs';
// import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/graph-lib.js',
    format: 'iife',
    name: 'Graph'
  },
  watch: {
    include: ['src/**'],
    exclude: ['node_modules/**', 'dist/**']
  }
  // plugins: [
  //   nodeResolve({
  //     jsnext: true,
  //     main: true
  //   }),
  //   commonjs({
  //     include: ["node_modules/jquery/**"],
  //     namedExports: {
  //       'node_modules/jquery/dist/jquery.min.js': [ 'jquery' ]
  //     }
  //   })
  // ]
};
