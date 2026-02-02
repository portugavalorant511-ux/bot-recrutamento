const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "historico.json");

function init() {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
  }
}

function salvarRegistro(data) {
  init();
  const historico = JSON.parse(fs.readFileSync(file));
  historico.push({
    ...data,
    data: new Date().toISOString(),
  });
  fs.writeFileSync(file, JSON.stringify(historico, null, 2));
}

module.exports = { salvarRegistro };
