import resolve from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    resolve(),
    cjs({
      include: /node_modules/,
      namedExports: {
        'react-is': ['isValidElementType'],
      },
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  external: [
    'stream', // for styled-components
    'react',
    'react-dom',
    'prop-types',
  ],
};
