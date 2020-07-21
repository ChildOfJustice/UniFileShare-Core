import * as express from "express";
import * as path from "path";
import * as exphbs from "express-handlebars";
import * as compression from "compression";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as serveFavicon from "serve-favicon";
import * as cors from "cors";


import db from "./models"
import routes from "./routes/test.routes"

const app = express();

// set static path
app.use("/static", express.static("src/public"));
app.use(cors())

// set template engine
app.set('views', path.join(process.cwd(), '/src', '/views'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// set response compression
app.use(compression());
// set logger
app.use(morgan("common"));
// serve json requests
app.use(bodyParser.json());
// serve favicon
app.use(serveFavicon(path.join(process.cwd(), '/src', '/public', 'favicon.ico')))

app.use(express.json());

const PORT = process.env.PORT || 3001;

// app.use("/", (req, res) => {
//     res.render("index");
// });

app.post('/', function(request, response) {

    // console.log(request.body); // your JSON
    // const responseParams = {
    //     id: 83837,
    //     code: 9
    // };
    // response.send(JSON.stringify(responseParams));

    try {
        if (request.body.userName == "Sardor" && request.body.password == "root") {
            const responseParams = {
                id: 83837,
                code: 9
            };
            response.send(JSON.stringify(responseParams));
        } else {
            response.send(request.body); // echo the result back
        }
    } catch (e) {
        response.send("ERROR");
    }

});


app.listen(PORT, async () => {
    try {
        await db.sequelizeEntity.authenticate();
        console.log('Connection has been established successfully.');
        //db.sequelizeEntity.sync();
        //for development:
        db.sequelizeEntity.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
        });
        //^
        routes(app);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    console.log(`Server started on http://localhost:${PORT}.`);
});