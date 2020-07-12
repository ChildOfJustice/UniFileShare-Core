import * as express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/", (req, res) => {
    res.send("hello world!");
});

app.listen(3000, () => {
    console.log(`Server started on http://localhost:${PORT}.`);
});