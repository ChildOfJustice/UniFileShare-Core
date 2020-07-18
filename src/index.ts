import * as express from "express";
import * as path from "path";
import * as exphbs from "express-handlebars";
import * as compression from "compression";
import * as morgan from "morgan";

const app = express();

// set static path
app.use("/static", express.static("src/public"));

// set template engine
app.set('views', path.join(process.cwd(), '/src', '/views'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// set response compression
app.use(compression());
// set logger
app.use(morgan("common"));

const PORT = process.env.PORT || 3000;

app.use("/", (req, res) => {
    res.render("index", { layout: false });
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}.`);
});