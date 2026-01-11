const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    entry: './src/index.js',
    output: {
        filename: 'bundle.cjs',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2'
    },
    
    // not include dependencies
    externals: [nodeExternals()],

    experiments: {
        // commonjs output
        outputModule: false
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                // not include node_modules
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // preset to conver es modules to commonjs
                        presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
                    }
                }
            }
        ]
    }
};