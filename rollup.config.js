import resolve from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    peerDepsExternal(),
    resolve(),
    babel({
      exclude: 'node_modules/**',
    }),
    cjs({
      include: /node_modules/,
      namedExports: {
        'react-is': ['isValidElementType'],
      },
    }),
  ],
  external: [
    'stream', // for styled-components
    'react',
    'react-dom',
    'prop-types',
    'styled-components',
  ],
};
