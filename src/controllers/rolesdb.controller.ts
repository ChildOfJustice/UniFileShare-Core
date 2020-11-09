import * as express from 'express';

import {Role} from '../interfaces/databaseTables'
import AuthMiddleWare from '../middleware/auth.middleware'

import db from "../models"

const Rolesdb = db.rolesDB;
const Op = db.SequelizeService.Op;

class CognitoRolesdbController {
    public path = '/cognitoRoles'
    public router = express.Router()
    private authMiddleWare: AuthMiddleWare

    constructor() {
        this.authMiddleWare = new AuthMiddleWare()
        this.initRoutes()
        // this.admin_create({cognito_user_group: "Admin", role: "ADMINISTRATOR"})
    }


    private initRoutes() {
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
        // // Delete a Tutorial with id
        // router.delete("/:id", tutorials.delete);
        //
        // // Create a new Tutorial
        // router.delete("/", tutorials.deleteAll);

    }

    // admin_create (req:any) {
    //
    //     // Create a note
    //     const note: CognitoRole = {
    //         // username: req.body.username,
    //         // someReal: req.body.someReal,
    //         // signUpDate: req.body.signUpDate
    //         cognito_user_group: req.cognito_user_group,
    //         role: req.role
    //     };
    //
    //
    //     // Save Tutorial in the database
    //     CognitoRolesdb.create(note)
    //         .then((data: never) => {
    //             //res.send(JSON.stringify(data));
    //             console.log("CREATED NEW Cognito Role: " + data)
    //         })
    //         .catch((err: { message: string; }) => {
    //             console.log(err)
    //         });
    // }

    // Create and Save a new note
    create(req: any, res: any) {

        // Validate request
        //^


        // Create a note
        const note: Role = {
            role: req.body.role
        };


        // Save Tutorial in the database
        Rolesdb.create(note)
            .then((data: never) => {
                //res.send(JSON.stringify(data));
                console.log("CREATED NEW Cognito Role: " + data)
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
    findAll(req: any, res: any) {
        // const ownedBy = req.query.ownedBy;
        // const condition = ownedBy ? {
        //     username: {
        //         [Op.iLike]: `%${ownedBy}%`
        //     }
        // } : null;

        Rolesdb.findAll({where: null})
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
    findOne(req: any, res: any) {
        const id = req.params.id;

        Rolesdb.findByPk(id)
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

export default CognitoRolesdbController;