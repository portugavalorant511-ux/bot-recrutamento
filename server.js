const express =  require("express");
const fs = require("fs");
const path = require("patch");

const app = express();
const PORT = 3000;

const historicoPatch = path.join(__dirname, "..", "historico.json");

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/historico", (req, res) => {
    if (!fs.existsSync(historicoPatch)) {
        return res.json([]);
    }

    const data = JSON.parse(fs.readFileSync(historicoPath));
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`DashBoard rodando em http://localhost:${PORT}`);
});