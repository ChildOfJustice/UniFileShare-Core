import * as express from "express";
import { Request, Response } from 'express';
import {body, ValidationChain, validationResult} from "express-validator";

import CognitoService from '../services/cognito.service';
import {User} from "../interfaces/user";

import config from "../../util/config"
import {CognitoIdentityServiceProvider} from "aws-sdk";
import * as AWS from "aws-sdk";

class AuthController {
    public path = '/auth'
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post('/signUp', this.validateBody('signUp'), this.signUp)
        this.router.post('/signIn', this.validateBody('signIn'), this.signIn)
        this.router.post('/verify', this.validateBody('verify'), this.verify)
    }



    logMapElements(value: string, key: string, map:any) {
        console.log(`m[${key}] = ${value}`);
    }
    signUp(req: Request, res: Response){

        const result = validationResult(req);
        //console.log("SIGN UP REQUEST: ");
        //console.log(req.body);
        console.log(result.mapped())

        if(!result.isEmpty()){
            let responseStr = "\n"
            const mappedErrors = result.mapped()
            if(mappedErrors['email'] != null)
                responseStr += 'Invalid email: must be like "***@**.domain"\n'
            if(mappedErrors['username'] != null)
                responseStr += "Invalid username: min size is 4\n"
            if(mappedErrors['password'] != null)
                responseStr += "Invalid password: min size is 6\n"

            return res.status(422).send({
                message: responseStr || "Validation is not successful."
            });
        }
        console.log("Validation successful!")

        const { username, password, email} = req.body; //, name , family_name, birthdate
        const userAttr = [];
        userAttr.push({ Name: 'email', Value: email });
        //userAttr.push({ Name: 'name', Value: name });
        //userAttr.push({ Name: 'family_name', Value: family_name });
        //userAttr.push({ Name: 'birthdate', Value: birthdate });

        const cognito = new CognitoService();

        const cognitoIdentityServiceProvider = cognito.cognitoIdentity;

        cognito.signUpUser(username, password, userAttr)
            .then(promiseOutput =>{
                if(promiseOutput.success){

                    //TODO get credentials from IdentityPool and call cognito.confirmUser()
                    AWS.config.update({
                        region: config.AWS.region,
                        credentials: new AWS.CognitoIdentityCredentials({
                            IdentityPoolId: config.AWS.IdentityPool.IdentityPoolId,
                            // Logins: { // optional tokens, used for authenticated login
                            //         //     'graph.facebook.com': 'FBTOKEN',
                            //         //     'www.amazon.com': 'AMAZONTOKEN',
                            //         //     'accounts.google.com': 'GOOGLETOKEN',
                            //         //     'appleid.apple.com': 'APPLETOKEN'
                            //         // }
                        })
                    });



                    res.status(200).json({"data": promiseOutput.msg}).end()
                } else {
                    res.status(500).send({message: promiseOutput.msg})
                }
            });
    }


    signIn(req: Request, res: Response){
        const result = validationResult(req);
        //console.log("SIGN IN REQUEST: ");
        //console.log(req.body);

        console.log(result.mapped())

        if(!result.isEmpty()){
            let responseStr = "\n"
            const mappedErrors = result.mapped()
            if(mappedErrors['username'] != null)
                responseStr += "Invalid username: min size is 4\n"
            if(mappedErrors['password'] != null)
                responseStr += "Invalid password: min size is 6\n"

            return res.status(422).send({
                message: responseStr || "Validation is not successful."
            });
        }

        console.log("Validation successful!")


        const { username, password } = req.body;
        const cognito = new CognitoService();
        cognito.signInUser(username, password)
            .catch()
            .then(promiseOutput =>{
                if(promiseOutput.success){
                    res.status(200).json({"data": promiseOutput.msg}).end()
                } else {
                    res.status(500).send({message: promiseOutput.msg})
                }
            });


    }
    verify(req: Request, res: Response){
        const result = validationResult(req);
        console.log("VERIFY REQUEST: ");
        console.log(req.body);

        console.log(result.mapped())

        if(!result.isEmpty()){
            let responseStr = "\n"
            const mappedErrors = result.mapped()
            if(mappedErrors['code'] != null)
                responseStr += "Invalid code: length must be 6\n"
            if(mappedErrors['username'] != null)
                responseStr += "Invalid username: min size is 4\n"

            return res.status(422).send({
                message: responseStr || "Validation is not successful."
            });
        }

        const { username, code } = req.body;
        const cognito = new CognitoService();

        cognito.verifyAccount(username, code)
            .catch()
            .then(promiseOutput =>{
                if(promiseOutput.success){
                    res.status(200).json({"data": "successfully verified the user"}).end()
                } else {
                    res.status(500).send({message: promiseOutput.msg})
                }
            });

    }


    private validateBody(type: string): ValidationChain[]{
        switch (type) {
            case 'signUp':
                return [
                    body('username').notEmpty().isLength({ min: 4}),
                    body('email').notEmpty().normalizeEmail().isEmail(),
                    body('password').isString().isLength({ min: 6}),
                    //body('birthdate').exists().isISO8601(),
                    //body('name').notEmpty().isString(),
                    //body('family_name').notEmpty().isString(),
                ]
            case 'signIn':
                return [
                    body('username').notEmpty().isLength({ min: 4}),
                    body('password').isString().isLength({ min: 6}),
                ]
            case 'verify':
                return [
                    body('username').notEmpty().isLength({ min: 4}),
                    body('code').isString().isLength({ min: 6, max: 6}),
                ]
        }
        return []
    }
}

export default AuthController;