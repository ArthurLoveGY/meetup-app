/**
 * Custom SCSS transformer for Metro bundler.
 * Directly converts SCSS → CSS → React Native StyleSheet.create()
 * bypassing the Taro style transformer which has issues in Metro workers.
 */
const path = require('path');
const sass = require('sass');
const postcss = require('postcss');
const postcssPxtransform = require('postcss-pxtransform');
const postcssCssVariables = require('postcss-css-variables');
const defaultTransform = require('taro-css-to-react-native').default;
const upstreamTransformer = require('@react-native/metro-babel-transformer');

const RN_CSS_EXT = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus'];

const designWidth = 750;
const deviceRatio = {
  375: 2,
  640: 1.17,
  750: 1,
  828: 0.905,
};

async function compileScss(src, filename) {
  try {
    const result = sass.compile(filename, {
      loadPaths: [
        path.join(process.cwd(), 'src'),
        path.join(process.cwd(), 'node_modules'),
      ],
    });
    return result.css;
  } catch (e) {
    console.error('[scss-transformer] Sass compile error:', e.message);
    return src;
  }
}

// PostCSS plugin to fix RN-incompatible CSS values
const postcssFixRNCompat = () => ({
  postcssPlugin: 'postcss-fix-rn-compat',
  Declaration(decl) {
    // Remove unsupported display values
    if (decl.prop === 'display') {
      if (decl.value === 'block' || decl.value === 'inline-block' || decl.value === 'inline') {
        decl.remove();
      }
    }
    // Convert percentage border-radius to large px (RN doesn't support %)
    if (decl.prop === 'border-radius') {
      if (decl.value.includes('%')) {
        decl.value = decl.value.replace(/\d+(\.\d+)?%/g, '999px');
      }
      // Remove shorthand with spaces (RN doesn't support "24px 24px 0 0")
      if (decl.value.split(/\s+/).length > 2) {
        decl.value = decl.value.split(/\s+/)[0];
      }
    }
    // Fix shadow properties that RN handles differently
    if (decl.prop === 'box-shadow') {
      decl.remove();
    }
    // Fix text-decoration (not supported in RN Text)
    if (decl.prop === 'text-decoration' || decl.prop === 'text-decoration-line') {
      decl.remove();
    }
    // Fix cursor (not supported in RN)
    if (decl.prop === 'cursor') {
      decl.remove();
    }
    // Fix outline (not supported in RN)
    if (decl.prop === 'outline' || decl.prop === 'outline-offset') {
      decl.remove();
    }
    // Fix box-sizing (not supported in RN)
    if (decl.prop === 'box-sizing') {
      decl.remove();
    }
    // Fix user-select (not supported in RN)
    if (decl.prop === 'user-select') {
      decl.remove();
    }
    // Fix transition/animation (not supported in RN StyleSheet)
    if (decl.prop === 'transition' || decl.prop === 'animation' || decl.prop.startsWith('transition-') || decl.prop.startsWith('animation-')) {
      decl.remove();
    }
    // Fix -webkit- prefixed properties
    if (decl.prop.startsWith('-webkit-') || decl.prop.startsWith('-moz-') || decl.prop.startsWith('-ms-')) {
      decl.remove();
    }
  },
});
postcssFixRNCompat.postcss = true;

async function processPostcss(css, filename) {
  const plugins = [
    postcssPxtransform({
      platform: 'rn',
      designWidth,
      deviceRatio,
    }),
    postcssCssVariables({}),
    postcssFixRNCompat(),
  ];

  try {
    const result = await postcss(plugins).process(css, { from: filename });
    return result.css;
  } catch (e) {
    console.error('[scss-transformer] PostCSS error:', e.message);
    return css;
  }
}

// Properties not supported by React Native StyleSheet
const RN_UNSUPPORTED_PROPS = new Set([
  'boxSizing', 'cursor', 'userSelect', 'outline', 'outlineOffset',
  'transition', 'transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'transitionDelay',
  'animation', 'animationName', 'animationDuration', 'animationTimingFunction', 'animationDelay',
  'textDecoration', 'textDecorationLine', 'textDecorationStyle', 'textDecorationColor',
  'resize', 'overflowX', 'overflowY', 'objectFit', 'objectPosition',
  'transformOrigin', 'perspective', 'backfaceVisibility',
  'willChange', 'contain', 'isolation', 'mixBlendMode',
  'filter', 'backdropFilter', 'clipPath', 'mask',
]);

function cleanStyleObject(styleObject) {
  for (const key of Object.keys(styleObject)) {
    if (key.startsWith('__')) continue;
    const style = styleObject[key];
    if (typeof style === 'object' && style !== null) {
      for (const prop of Object.keys(style)) {
        if (RN_UNSUPPORTED_PROPS.has(prop)) {
          delete style[prop];
        }
      }
    }
  }
  return styleObject;
}

function cssToStyleSheet(css) {
  try {
    const styleObject = defaultTransform(css, {
      parseMediaQueries: true,
      scalable: true,
    });
    // Remove internal properties
    delete styleObject.__viewportUnits;
    delete styleObject.__mediaQueries;
    // Remove unsupported properties
    cleanStyleObject(styleObject);
    return styleObject;
  } catch (e) {
    console.error('[scss-transformer] CSS-to-RN error:', e.message);
    return {};
  }
}

function wrapStyleSheet(styleObject) {
  let css = JSON.stringify(styleObject, null, 2);
  // Remove quotes around scalePx2dp/scaleVu2dp function calls so they become actual calls
  css = css.replace(/"(scalePx2dp\(.*?\))"/g, '$1');
  css = css.replace(/"(scaleVu2dp\(.*?\))"/g, '$1');
  return `
import { StyleSheet } from 'react-native'
import { scalePx2dp, scaleVu2dp } from '@tarojs/runtime-rn'

function ignoreStyleFileCache() {}

export default StyleSheet.create(${css})
`;
}

async function transform({ src, filename, options }) {
  const ext = path.extname(filename);

  if (RN_CSS_EXT.includes(ext)) {
    // Step 1: Compile SCSS to CSS
    const css = await compileScss(src, filename);

    // Step 2: Process with PostCSS (pxtransform, css variables)
    const processedCss = await processPostcss(css, filename);

    // Step 3: Convert to RN StyleSheet object
    const styleObject = cssToStyleSheet(processedCss);

    // Step 4: Wrap in StyleSheet.create()
    const jsCode = wrapStyleSheet(styleObject);

    // Step 5: Pass to babel transformer
    return upstreamTransformer.transform({
      src: jsCode,
      filename,
      options,
    });
  }

  // For non-CSS files, use the upstream transformer directly
  return upstreamTransformer.transform({ src, filename, options });
}

module.exports = {
  transform,
  getCacheKey: upstreamTransformer.getCacheKey,
};
