import * as AWS from 'aws-sdk';
import * as crypto from 'crypto';

import config from "../../util/config";
import {PromiseOutput} from "../interfaces/promiseOutput";

class CognitoService {
    private  config = {
        region: config.userPoolRegion
    }

    private secretHash: string = config.secretHash
    private clientId: string = config.clientId

    private cognitoIdentity: any;
    constructor() {
        this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config);
    }

    public async signUpUser(username: string, password: string, userAttr: Array<any>): Promise<PromiseOutput>{
        const params = {
            ClientId: this.clientId,
            Password: password,
            Username: username,
            SecretHash: this.generateHash(username),
            UserAttributes: userAttr
        }

        try{
            const data = await this.cognitoIdentity.signUp(params).promise();
            console.log(data)
            return {
                success: true,
                msg: data
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                msg: error
            }
        }
    }

    public async verifyAccount(username: string, code: string): Promise<PromiseOutput>{
        const params = {
            ClientId: this.clientId,
            ConfirmationCode: code,
            SecretHash: this.generateHash(username),
            Username: username
        }

        try{
            const data = await this.cognitoIdentity.confirmSignUp(params).promise();
            console.log(data)
            return {
                success: true,
                msg: data
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                msg: error
            }
        }
    }

    public async signInUser(username: string, password: string): Promise<PromiseOutput>{
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.clientId,
            AuthParameters: {
                'USERNAME': username,
                'PASSWORD': password,
                'SECRET_HASH': this.generateHash(username)
            }
        }

        try{
            let data = await this.cognitoIdentity.initiateAuth(params).promise()
            console.log(data)
            const { authToken, refreshToken, idToken } = data;
            // console.log("GOT: " + authToken)
            // console.log("GOT: " + refreshToken)
            // console.log("GOT: " + idToken)

            return {
                success: true,
                msg: data
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                msg: error
            }
        }


    }

    private generateHash(username: string): string{
        return crypto.createHmac('SHA256', this.secretHash)
            .update(username + this.clientId)
            .digest('base64')
    }


}

export default CognitoService;