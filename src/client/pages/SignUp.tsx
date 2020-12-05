import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import {connect} from 'react-redux';
import {IRootState} from '../../store';
import {History} from 'history';
import {User} from "../../interfaces/user";
import {Dispatch} from 'redux';
import * as tokensService from '../../store/demo/tokens.service'
import * as storeService from '../../store/demo/store.service'
import {DemoActions} from '../../store/demo/types';
import config from "../../../util/config";
import {FetchParams, makeFetch} from "../Interface";
import {LinkContainer} from "react-router-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import {setInterval} from "timers";

const mapStateToProps = ({demo}: IRootState) => {
    const {authToken, idToken, loading} = demo;
    return {authToken, idToken, loading};
}

//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        setAuthToken: (token: string) => tokensService.setAuthToken(dispatch, token),
        setIdToken: (token: string) => tokensService.setIdToken(dispatch, token),
        loadStore: () => storeService.loadStore(dispatch),
        saveStore: () => storeService.saveStore(dispatch),
    }
}

interface IProps {
    history: History
    /* other props for ChildComponent */
}
interface IState {
    code: string
    verificationStage: boolean
    userCognitoId: string
    userName: string
    password: string
    email: string
    userNameForDatabase: string
}


type ReduxType = IProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;

class SignUp extends React.Component<ReduxType, IState> {
    public state: IState = {
        code: "",
        verificationStage: false,
        userCognitoId: "",
        userName: "",
        password: "",
        email: "",
        userNameForDatabase: ""
    }




    // Initialize the state
    constructor(props: ReduxType) {
        super(props);
    }

    verifyCode = (event: any) => {
        event.preventDefault()

        let userData = {
            code: this.state.code,
            username: this.state.userName
        }


        const fetchParams: FetchParams = {
            url: '/auth/verify',
            authToken: "",
            idToken: "",
            method: 'POST',
            body: userData,

            actionDescription: "verify email code"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log("VERIFY RESULT: " + jsonRes)


            this.signIn()


            //add tokens to the store and redirect to the client page
            //TODO YOU NEED TO CONFIRM THE USER <----(!) and then you will be able to sign in after sigh up
            // fetch('/auth/signIn',{
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //         // 'Content-Type': 'application/x-www-form-urlencoded',
            //     },
            //     body: JSON.stringify(userData)
            // })
            //     .then(res => res.json()
            //     )
            //     .then(data => {
            //         console.log("JSON res: " + data.data.AuthenticationResult)
            //         // @ts-ignore
            //
            //
            //         // @ts-ignore
            //         this.props.setAuthToken(data.data.AuthenticationResult.AccessToken)
            //         this.props.setIdToken(data.data.AuthenticationResult.IdToken)
            //         this.props.saveStore()
            //
            //         this.props.history.push("/private/area")
            //         // if(res.ok)
            //         //     alert("Successfully signed in")
            //         // else alert("Error, see logs for more info")
            //
            //     })
            //     .catch(error => alert("Fetch error: " + error))






            //console.log("JSON res: " + jsonRes.data.AuthenticationResult)
            // @ts-ignore


            // @ts-ignore
            //this.props.setAuthToken(jsonRes.data.AuthenticationResult.AccessToken)
            //this.props.setIdToken(jsonRes.data.AuthenticationResult.IdToken)
            //this.props.saveStore()
            // @ts-ignore
            //const {authToken, loading} = this.props;

            //alert("Your access token is: " + authToken)
            //this.props.history.push("/private/area")
            // if(res.ok)
            //     alert("Successfully signed in")
            // else alert("Error, see logs for more info")
        }).catch(error => alert("ERROR: " + error))



        //.catch(error => alert("Fetch error: " + error))

        //browserHistory.push('/home');
    }
    signIn = () => {

        let userData = {
            username: this.state.userName,
            password: this.state.password,
        }



        const fetchParams: FetchParams = {
            url: '/auth/signIn',
            authToken: "",
            idToken: "",
            method: 'POST',
            body: userData,

            actionDescription: "sign in after verification"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            console.log("JSON res: " + jsonRes.data.AuthenticationResult)
            // @ts-ignore


            // @ts-ignore
            this.props.setAuthToken(jsonRes.data.AuthenticationResult.AccessToken)
            this.props.setIdToken(jsonRes.data.AuthenticationResult.IdToken)
            this.props.saveStore()


            //add to the database
            const userData2: User = {
                name: this.state.userNameForDatabase,
                roleId: config.AppConfig.RolesIds.user,
                cognitoUserId: this.state.userCognitoId,
                signUpDate: Date()
            }

            // @ts-ignore
            const {authToken, idToken} = this.props;

            const fetchParams: FetchParams = {
                url: '/users/create',
                authToken: authToken,
                idToken: idToken,
                method: 'POST',
                body: userData2,

                actionDescription: "create user"
            }

            makeFetch<any>(fetchParams).then(jsonRes => {
                console.log(jsonRes)
                alert("Successfully signed you up.")
                this.props.history.push("/private/area")
            }).catch(error => alert("ERROR: " + error))


            //alert("Your access token is: " + authToken)
            //this.props.history.push("/private/area")
            // if(res.ok)
            //     alert("Successfully signed in")
            // else alert("Error, see logs for more info")
        }).catch(error => alert("ERROR: " + error))



        //.catch(error => alert("Fetch error: " + error))

        //browserHistory.push('/home');
    }



    signUp = (event: any) => {
        event.preventDefault()

        var userCognitoId: string | null = null
        //alert(this.userName + " " + this.password + " " + this.email + " test state: " + this.state.smth)

        let userData = {
            username: this.state.userName,
            password: this.state.password,
            email: this.state.email,
        }
        this.setState({userNameForDatabase: this.state.userName})
        const fetchParams: FetchParams = {
            url: '/auth/signUp',
            authToken: "",
            idToken: "",
            method: 'POST',
            body: userData,

            actionDescription: "Cognito sign up"
        }

        makeFetch<any>(fetchParams).then(jsonRes => {
            console.log(jsonRes)
            userCognitoId = jsonRes.data.UserSub

            if (userCognitoId == null) {
                alert("ERROR WITH COGNITO")
                return
            }

            this.setState({verificationStage: true, userCognitoId: userCognitoId})

        }).catch(error => alert("ERROR: " + error))
    }

    _onChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({userName: (e.target as HTMLInputElement).value})
    }
    _onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({email: (e.target as HTMLInputElement).value})
    }
    _onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({password: (e.target as HTMLInputElement).value})
    }

    _onChangeCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({code: (e.target as HTMLInputElement).value})
    }

    // @ts-ignore
    MainPanel = ({ verificationStage }) => (
        <div className="MainPanel">
            {verificationStage ?
                <Form>

                    <Form.Group controlId="confirmCode">
                        <Form.Label>Verification Code</Form.Label>
                        <Form.Control onChange={this._onChangeCode} type="string" placeholder="Verification Code"/>
                    </Form.Group>


                    <Button onClick={this.verifyCode} variant="primary" type="submit">Submit</Button>
                </Form>
                : <Form>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control onChange={this._onChangeEmail} type="email" placeholder="Enter email"/>
                    </Form.Group>
                    <Form.Group controlId="formBasicUserName">
                        <Form.Label>UserName</Form.Label>
                        <Form.Control onChange={this._onChangeUserName} type="string" placeholder="Your username"/>
                    </Form.Group>
                    <Form.Group controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control onChange={this._onChangePassword} type="password" placeholder="Password"/>
                    </Form.Group>

                    <Button onClick={this.signUp} variant="primary" type="submit">Sign Up</Button>
                </Form>}
        </div>
    );


    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        const SignUpPart = (
            <Form>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control onChange={this._onChangeEmail} type="email" placeholder="Enter email"/>
                </Form.Group>
                <Form.Group controlId="formBasicUserName">
                    <Form.Label>UserName</Form.Label>
                    <Form.Control onChange={this._onChangeUserName} type="string" placeholder="Your username"/>
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control onChange={this._onChangePassword} type="password" placeholder="Password"/>
                </Form.Group>

                <Button onClick={this.signUp} variant="primary" type="submit">Sign Up</Button>
            </Form>
        )
        const verifyPagePart = (
            <Form>

                <Form.Group controlId="formBasicUserName">
                    <Form.Label>Verification Code</Form.Label>
                    <Form.Control onChange={this._onChangeCode} type="string" placeholder="Verification Code"/>
                </Form.Group>


                <Button onClick={this.verifyCode} variant="primary" type="submit">Sign In</Button>
            </Form>
        )
        return (
            <this.MainPanel verificationStage={this.state.verificationStage}/>
        );
    }
}

export default connect(mapStateToProps, mapDispatcherToProps)(SignUp);