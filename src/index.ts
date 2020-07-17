import * as express from "express";
import * as path from "path";
import * as exphbs from "express-handlebars";

const app = express();

app.use("/static", express.static("src/public"));

app.set('views', path.join(process.cwd(), '/src', '/views'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const PORT = process.env.PORT || 3000;

app.use("/", (req, res) => {
    res.render("index", { layout: false });
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}.`);
});