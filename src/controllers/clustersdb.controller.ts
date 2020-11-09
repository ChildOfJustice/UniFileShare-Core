import * as express from 'express';
import { Request, Response} from "express";
import AuthMiddleWare from '../middleware/auth.middleware'

import {Cluster, Role} from '../interfaces/databaseTables'

import db from "../models"

const Clustersdb = db.clustersDB;
const Op = db.SequelizeService.Op;

class ClustersdbController {
    public path = '/clusters'
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
        this.router.post("/findAll", this.findAllWithIds)
        // // Retrieve all published Tutorials
        // router.get("/published", tutorials.findAllPublished);
        //
        // // Retrieve a single Tutorial with id
        this.router.get("/", this.findOne);
        //
        // // Update a Tutorial with id
        // router.put("/:id", tutorials.update);
        //
        // // Delete a Tutorial with id
        // router.delete("/:id", tutorials.delete);
        this.router.delete("/delete", this.delete);
        //
        // // Create a new Tutorial
        // router.delete("/", tutorials.deleteAll);

    }

    // Create and Save a new note
    create (req:any, res:any) {

        // Validate request
        //^


        // Create a note
        const note: Cluster = {
            clusterId: null,
            //createdDate: req.body.createdDate,
            name: req.body.name,
            ownerUserId: req.body.ownerUserId,
        };


        Clustersdb.create(note)
            .then((data: never) => {
                console.log("CREATED NEW CLUSTER: " + data)
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
        //https://stackoverflow.com/questions/61615632/sequelize-how-to-compare-equality-between-dates
        //https://sequelize.org/v5/manual/querying.html
        const ownerUserId = req.query.ownerUserId;
        const condition = ownerUserId ? {
            ownerUserId: {
                [Op.like]: '%' + ownerUserId + '%'
            }
        } : null;

        Clustersdb.findAll({ where: condition })
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

    findAllWithIds (req:any, res:any){
        console.log(JSON.stringify(req.body.clusterIds))
        Clustersdb.findAll({ where: {
                clusterId: {
                    [Op.in]: req.body.clusterIds,
                }
            } })
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
// // Find a single cluster with an id
    findOne (req: any, res: any) {
        const id = req.query.clusterId;

        const condition = id ? {
            clusterId: id
        } : null;

        Clustersdb.findAll({ where: condition })
            .then((data: any) => {
                console.log("data: " + data)
                res.send(data);
            })
            .catch((err: { message: string; }) => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving tutorials."
                });
            });
        console.log("REQUEST HANDLED")
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
// // Delete a Tutorial with the specified id in the request
    delete(req: any, res: any) {
        Clustersdb.destroy({
            where: { clusterId: req.query.clusterId}
        })
            .then((num: number) => {
                if (num == 1) {
                    res.send({
                        message: `cluster ${req.query.clusterId} was deleted successfully!`
                    });
                } else {
                    res.send({
                        message: `Cannot delete cluster ${req.query.clusterId}. Maybe it was not found!`
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

export default ClustersdbController;