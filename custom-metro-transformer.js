/**
 * Custom Metro transformer wrapper.
 * - SCSS/CSS files: use custom SCSS transformer (direct sass → StyleSheet.create)
 * - JS/TS files: use Taro transformer (for entry generation, className→style, etc.)
 */
const path = require('path');
const taroTransformer = require('@tarojs/rn-supporter/dist/taroTransformer');
const customScssTransformer = require('./custom-scss-transformer');

const RN_CSS_EXT = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus'];

async function transform({ src, filename, options }) {
  const ext = path.extname(filename);

  if (RN_CSS_EXT.includes(ext)) {
    return customScssTransformer.transform({ src, filename, options });
  }

  return taroTransformer.transform({ src, filename, options });
}

function getCacheKey() {
  return taroTransformer.getCacheKey();
}

module.exports = {
  transform,
  getCacheKey,
};
