const toPlain = require("hast-util-to-text");

function plain(config: any) {
  const settings = Object.assign({}, config, this.data("settings"));

  this.Compiler = compiler;

  function compiler(tree) {
    return toPlain(tree, settings);
  }
}

export default plain;
