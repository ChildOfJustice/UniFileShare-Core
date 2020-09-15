import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import * as jwkToPem from 'jwk-to-pem'
import * as fetch from 'node-fetch'
import config from "../../util/config";
import {User} from "../interfaces/user";
import {userInfo} from "os";

export const pems: any = {}
export const pems2: any= {}

class AuthMiddleware{
    public pems_: any
    public pems2_: any


    private userPoolId = config.userPoolId
    private userPoolRegion = config.userPoolRegion

    constructor() {
        this.setUp()
        this.pems_ = pems
        this.pems2_ = pems2
    }

    // async getKey(kidId: any) {
    //     return new Promise(((resolve, reject) => {
    //         client.getKeys((err: any, keys: any[]) => {
    //             const key1 = keys.find(k => k.kid === kidId);
    //             resolve(key1);
    //         });
    //     }));
    // }

    public async verifyToken(req: Request, res: Response, next: () => void): Promise<User> {
        const token = req.header('Auth')
        const idToken = req.header('Identity')!

        let _userInfo: User

        if(token == null) res.status(401).end()
        else {

            let decodeJwt: any = jwt.decode(token, {complete: true})
            //console.log(decodeJwt) some info about user is here!!!
            if (!decodeJwt) {
                res.status(401).end()
            }

            let kid = decodeJwt.header.kid
            let pem = pems[kid]
            if (!pem) {
                res.status(401).end()
            }

            jwt.verify(token, pem, (err: any, payload: any) => {
                if (err) {
                    res.status(401).end()
                }
                next()
            })


            //////pems for IDENTITY TOKEN
            let decodeIDJwt: any = jwt.decode(idToken, {complete: true})
            //console.log(decodeJwt) some info about user is here!!!
            if (!decodeIDJwt) {
                res.status(401).end()
            }

            let kid2 = decodeIDJwt.header.kid
            let pem2 = pems[kid2]
            if (!pem2) {
                res.status(401).end()
            }

            // const jwk = await getKey(kid2);
            // const pem = jwkToPem(jwk);
            /////
            const decodedIdToken = await jwt.verify(idToken, pem2, { algorithms: ['RS256'] });


            console.log(`Decoded and verified id token from aws ${JSON.stringify(decodedIdToken)}`);

            _userInfo = {
                // @ts-ignore
                name: decodedIdToken["username"],
                id: "0",
                role: "A"
            }

            /*
          const pem = jwkToPem(jwk);
          const decodedIdToken = await jwt.verify(awsAuthorizationCodeResponse.data.id_token, pem, { algorithms: ['RS256'] });
          debug(`Decoded and verified id token from aws ${JSON.stringify(decodedIdToken)}`);
          // Make sure that the profile checkbox is selected in the App client settings in cognito for the app. Otherwise you will get just the email
          const { email } = decodedIdToken;
          const { name } = decodedIdToken;
          const { family_name } = decodedIdToken;
          const returnObject = {
            email: email.toLowerCase(),
            firstName: name,
            lastName: family_name,
          };
          return returnObject;
             */
        }
        return new Promise<User>((resolve, reject) => {resolve(_userInfo)})
    }

    private async setUp() {
        const URL = `https://cognito-idp.${this.userPoolRegion}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`

        try{
            // @ts-ignore
            const response = await fetch(URL);
            if (response.status !== 200){
                throw `request not successful`
            }
            const data = await response.json()
            const { keys } = data
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index]
                const key_id = key.kid
                const modulus = key.n
                const exponent = key.e
                const key_type = key.kty
                const jwk = { kty: key_type, n: modulus, e: exponent }
                const pem = jwkToPem(jwk)
                pems[key_id] = pem

            }

            console.log("got all pems: " + this.pems_.toString())
        } catch (error) {
            console.log("cannot get pems")
            console.log(error)
        }


    }
}

export default AuthMiddleware;