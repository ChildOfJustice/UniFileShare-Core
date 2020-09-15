import {pems} from "./auth.middleware"
import {pems2} from "./auth.middleware"
import {Request, Response} from "express";
import {User} from "../interfaces/user";
import * as jwt from "jsonwebtoken";


class IdentityMiddleware{

    public test(req: Request, res: Response, next: () => void){

    }

    public async verifyTokenFromStore(req: Request, res: Response, next: () => void): Promise<User> {
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
}

export default IdentityMiddleware;