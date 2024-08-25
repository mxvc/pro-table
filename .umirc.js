import chalk from 'chalk';
import { readdirSync } from 'fs';
import { join } from 'path';

const headPkgList = [];
// utils must build before core
// runtime must build before renderer-react
const pkgList = readdirSync(join(__dirname, 'packages')).filter(
  (pkg) => pkg.charAt(0) !== '.' && !headPkgList.includes(pkg),
);

const alias = pkgList.reduce((pre, pkg) => {
  pre[`@ant-design/pro-${pkg}`] = join(__dirname, 'packages', pkg, 'src');
  return {
    ...pre,
  };
}, {});

console.log(`🌼 alias list \n${chalk.blue(Object.keys(alias).join('\n'))}`);

const tailPkgList = pkgList
  .map((path) => [join('packages', path, 'src')])
  .reduce((acc, val) => acc.concat(val), []);

const isProduction = process.env.NODE_ENV === 'production';

const isDeploy = process.env.SITE_DEPLOY === 'TRUE';

export default {
  title: 'ProTable',
  mode: 'site',
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
    ],
  ],

  alias,
  resolve: {
    includes: [...tailPkgList, 'docs'],
  },
  locales: [
    ['zh-CN', '中文'],
  ],

  hash: true,
  targets: {
    chrome: 80,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
  theme: {
    '@s-site-menu-width': '258px',
    '@root-entry-name': 'variable',
  },
  ignoreMomentLocale: true,
  menus: {
    '/components': [

      {
        title: '数据展示',
        children: [
          'table'
        ],
      },

    ],

  },
  ssr: isDeploy ? {} : undefined,
  webpack5: {},
  exportStatic: {},
  mfsu: !isDeploy ? {} : undefined,
  base:'/pro-components/',
  publicPath:'/pro-components/',
};
