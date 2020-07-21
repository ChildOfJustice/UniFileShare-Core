import * as express from "express";
import * as testDB from "../controllers/test.controller"

function func(app:any) {
    const router = express.Router();

    // Create a new note
    router.post("/", testDB.create);

    // Retrieve all Tutorials
    router.get("/", testDB.findAll);

    // // Retrieve all published Tutorials
    // router.get("/published", tutorials.findAllPublished);
    //
    // // Retrieve a single Tutorial with id
    // router.get("/:id", tutorials.findOne);
    //
    // // Update a Tutorial with id
    // router.put("/:id", tutorials.update);
    //
    // // Delete a Tutorial with id
    // router.delete("/:id", tutorials.delete);
    //
    // // Create a new Tutorial
    // router.delete("/", tutorials.deleteAll);

    app.use('/api/testdb', router);
}

export default func