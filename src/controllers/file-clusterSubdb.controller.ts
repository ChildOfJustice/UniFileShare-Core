import * as express from 'express';
import AuthMiddleWare from '../middleware/auth.middleware'

import {Role, File_ClusterSub} from '../interfaces/databaseTables'

import db from "../models"

const File_Clusterdb = db.file_clusterSubDB;
const Op = db.SequelizeService.Op;

class File_ClusterdbController {
    public path = '/file_cluster'
    public router = express.Router()
    private authMiddleWare: AuthMiddleWare

    constructor() {
        this.authMiddleWare = new AuthMiddleWare()
        this.initRoutes()
    }


    private initRoutes(){
        this.router.use(this.authMiddleWare.verifyToken)

        // Create a new note
        this.router.post("/create", this.create);

        // Retrieve all Tutorials
        this.router.get("/findAll", this.findAll);

        // // Retrieve all published Tutorials
        // router.get("/published", tutorials.findAllPublished);
        //
        // // Retrieve a single Tutorial with id
        this.router.get("/:id", this.findOne);
        //
        // // Update a Tutorial with id
        // router.put("/:id", tutorials.update);
        //
        // Delete a note with id
        this.router.delete("/delete", this.delete);
        //
        // // Create a new Tutorial
        // router.delete("/", tutorials.deleteAll);

    }

    // Create and Save a new note
    create (req:any, res:any) {
        console.log("SUB CREATING:")

        // Create a note
        const note: File_ClusterSub = {
            fileId: req.body.fileId,
            clusterId: req.body.clusterId
        };


        // Save Tutorial in the database
        File_Clusterdb.create(note)
            .then((data: never) => {
                //res.send(JSON.stringify(data));
                console.log("CREATED NEW note: " + data)
                res.send(data);
            })
            .catch((err: { message: string; }) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the note."
                });
            });
    }

    // Retrieve all notes from the database.
    //We use req.query.title to get query string from the Request and consider it as condition for findAll() method.
    findAll (req:any, res:any){
        const clusterId = req.query.clusterId;
        const condition = clusterId ? {
            clusterId: clusterId
        } : null;

        File_Clusterdb.findAll({ where: condition })
            .then((data: any) => {
                console.log("data: " + data)
                res.send(data);
            })
            .catch((err: { message: string; }) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving tutorials."
                });
            });
    }
//
// // Find a single Tutorial with an id
    findOne (req: any, res: any) {
        const id = req.params.id;

        File_Clusterdb.findByPk(id)
            .then((data: any) => {
                res.send(data);
            })
            .catch((err: any) => {
                res.status(500).send({
                    message: "Error retrieving Tutorial with id=" + id + ": " + err
                });
            });
    };
//
// // Update a Tutorial by the id in the request
// exports.update = (req, res) => {
//     const id = req.params.id;
//
//     Tutorial.update(req.body, {
//         where: { id: id }
//     })
//         .then(num => {
//             if (num == 1) {
//                 res.send({
//                     message: "Tutorial was updated successfully."
//                 });
//             } else {
//                 res.send({
//                     message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
//                 });
//             }
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Error updating Tutorial with id=" + id
//             });
//         });
// };
//
// Delete a Tutorial with the specified id in the request
    delete(req: any, res: any) {

        File_Clusterdb.destroy({
            where: { fileId: req.query.fileId,
                clusterId: req.query.clusterId }
        })
            .then((num: number) => {
                if (num == 1) {
                    res.send({
                        message: "Tutorial was deleted successfully!"
                    });
                } else {
                    res.send({
                        message: `Cannot delete file in sub table with id=${req.query.fileId}. for cluster ${req.query.clusterId}. Maybe it was not found!`
                    });
                }
            })
            .catch((err: any) => {
                res.status(500).send({
                    message: err
                });
            });
    };
//
// // Delete all Tutorials from the database.
// exports.deleteAll = (req, res) => {
//     Tutorial.destroy({
//         where: {},
//         truncate: false
//     })
//         .then(nums => {
//             res.send({ message: `${nums} Tutorials were deleted successfully!` });
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: err.message || "Some error occurred while removing all tutorials."
//             });
//         });
// };
//
// // Find all published Tutorials
// exports.findAllPublished = (req, res) => {
//     Tutorial.findAll({ where: { published: true } })
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: err.message || "Some error occurred while retrieving tutorials."
//             });
//         });
// };
}

export default File_ClusterdbController;