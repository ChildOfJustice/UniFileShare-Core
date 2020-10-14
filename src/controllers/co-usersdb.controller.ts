import * as express from 'express';
import { Request, Response} from "express";
import AuthMiddleWare from '../middleware/auth.middleware'

import {CoUser, Role} from '../interfaces/databaseTables'

import db from "../models"

const Cousersdb = db.coUsersDB;
const Op = db.SequelizeService.Op;

class CousersdbController {
    public path = '/cousers'
    public router = express.Router()
    //private authMiddleWare: AuthMiddleWare

    constructor() {
        //this.authMiddleWare = new AuthMiddleWare()
        this.initRoutes()
    }


    private initRoutes(){
        //this.router.use(this.authMiddleWare.verifyToken)

        // Create a new note
        this.router.post("/create", this.create);

        // Retrieve all Tutorials
        this.router.get("/findAll", this.findAll);

        this.router.get("/getPermissions", this.getPermissions);

        // // Retrieve all published Tutorials
        // router.get("/published", tutorials.findAllPublished);
        //
        // // Retrieve a single Tutorial with id
        this.router.get("/:id", this.findOne);
        //
        // // Update a Tutorial with id
        // router.put("/:id", tutorials.update);
        //
        // // Delete a Tutorial with id
        // router.delete("/:id", tutorials.delete);
        //
        // // Create a new Tutorial
        // router.delete("/", tutorials.deleteAll);

    }

    // Create and Save a new note
    create (req:any, res:any) {

        // Validate request
        //^


        // Create a note
        const note: CoUser = {
            coUserId: req.body.coUserId,
            clusterId: req.body.clusterId,
            permissions: req.body.permissions,
            permissionGiverUserId: req.body.userId
        };


        // Save Tutorial in the database
        Cousersdb.create(note)
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

    findAll (req:any, res:any){
        //retrieve all clusters, associated with this user
        const userId = req.query.userId;
        const condition = userId ? {
            coUserId: {
                [Op.iLike]: `%${userId}%`
            }
        } : null;

        Cousersdb.findAll({ where: condition })
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
    getPermissions(req: any, res: any){
        //retrieve permissions for the user
        const userId = req.query.userId;
        const clusterId = req.query.clusterId;
        const condition = userId ? {
            coUserId: {
                [Op.iLike]: `%${userId}%`
            },
            clusterId: clusterId
        } : null;

        Cousersdb.findAll({ where: condition })
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

        Cousersdb.findByPk(id)
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
// // Delete a Tutorial with the specified id in the request
// exports.delete = (req, res) => {
//     const id = req.params.id;
//
//     Tutorial.destroy({
//         where: { id: id }
//     })
//         .then(num => {
//             if (num == 1) {
//                 res.send({
//                     message: "Tutorial was deleted successfully!"
//                 });
//             } else {
//                 res.send({
//                     message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
//                 });
//             }
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Could not delete Tutorial with id=" + id
//             });
//         });
// };
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

export default CousersdbController;