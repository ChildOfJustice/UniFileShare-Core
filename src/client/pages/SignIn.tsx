import * as React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { connect } from 'react-redux';
import { IRootState } from '../../store';

const mapStateToProps = ({ demo }: IRootState) => {
    const { authToken, idToken, loading } = demo;
    return { authToken, idToken, loading };
}

import { Dispatch } from 'redux';
import * as asyncactions from '../../store/demo/async-actions';
import * as tokensService from '../../store/demo/tokens.service'
import * as storeService from '../../store/demo/store.service'
import { DemoActions } from '../../store/demo/types';


//to use any action you need to add dispatch as an argument to a function!!
const mapDispatcherToProps = (dispatch: Dispatch<DemoActions>) => {
    return {
        setAuthToken: (token: string) => tokensService.setAuthToken(dispatch, token),
        setIdToken: (token: string) => tokensService.setIdToken(dispatch, token),
        loadStore: () => storeService.loadStore(dispatch),
        saveStore: () => storeService.saveStore(dispatch),
        //addItem: (item: string) => asyncactions.addItemAsync(dispatch, item)
    }
}

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatcherToProps>;


interface IState {
    username: string
    password: string
}


class SignIn extends React.Component<ReduxType, IState> {
    public state: IState = {
        username: '',
        password: '',
    }

    constructor(props: ReduxType) {
        super(props);
        // window.onload = () => {
        //     alert("ONLOAD!!")
        //     this.props.loadStore()
        // }

    }

    componentDidMount() {
        alert("ONLOAD!!")
        //this.props.loadStore()
    }

    signIn = (event: any) => {
        event.preventDefault()

        const { username, password } = this.state;

        let userData = {
            username: username,
            password: password,
        }

        fetch('/auth/signIn',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(userData)
        })
            .then(res => res.json()
            )
            .then(data => {
                console.log("JSON res: " + data.data.AuthenticationResult)
                // @ts-ignore


                // @ts-ignore
                this.props.setAuthToken(data.data.AuthenticationResult.AccessToken)
                this.props.setIdToken(data.data.AuthenticationResult.IdToken)
                this.props.saveStore()
                // @ts-ignore
                const { authToken, loading} = this.props;

                alert("Your access token is: " + authToken)

                // if(res.ok)
                //     alert("Successfully signed in")
                // else alert("Error, see logs for more info")

            })
            .catch(error => alert("Fetch error: " + error))

        //browserHistory.push('/home');
    }

    uploadFile = (event: any) => {
        event.preventDefault()
        window.open('/upload-file')
        // fetch('/upload-file',{
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         //'Auth': authToken,
        //         //'Identity': idToken
        //         // 'Content-Type': 'application/x-www-form-urlencoded',
        //     }
        // })
        //     .then(res => {
        //         console.log(res)
        //         // let response_ = res.json()
        //         // console.log(response_)
        //
        //         if(res.ok)
        //             alert("Successfully get the page")
        //         else alert("Error, see logs for more info")
        //     })
        //     .catch(error => alert("Fetch error: " + error))
    }

    sendNodeToDB = (event: any) => {
        event.preventDefault()

        const usrParams = {
            title: "TEST",
            username: "TEST_USER",
            someReal: 83.7,
            signUpDate: ontimeupdate
        }


        fetch('/db/create',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(usrParams)
        })
            .then(res => {
                console.log(res)
                let response_ = res.json()
                console.log(response_)

                if(res.ok)
                    alert("Successfully get the response from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    getAllNodesFromDB = (event: any) => {
        event.preventDefault()

        const usrParams = {
            username: "TEST_USER"
        }


        fetch('/db/findAll?username=TEST_USER',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                console.log(res)
                res.json().then(jsonRes => {
                    console.log(jsonRes)
                })

                if(res.ok)
                    alert("Successfully get all nodes from db")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    makeRequest = (event: any) => {
        event.preventDefault()
        
        // @ts-ignore
        const { authToken, idToken, loading} = this.props;


        fetch('/protected/secret',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Auth': authToken,
                'Identity': idToken
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                console.log(res)
                let response_ = res.json()
                console.log(response_)

                if(res.ok)
                    alert("Successfully get the secret")
                else alert("Error, see logs for more info")
            })
            .catch(error => alert("Fetch error: " + error))
    }

    _onChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        //this.userName = (e.target as HTMLInputElement).value
        this.setState({username: (e.target as HTMLInputElement).value})
    }

    _onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({password: (e.target as HTMLInputElement).value})
    }

    //eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        const { authToken, loading } = this.props;

        const signInPage = (
            <Form>
                <div style={{margin: '20px'}}>
                    <button onClick={this.uploadFile}>Upload File</button>
                    <button onClick={this.makeRequest}>Make a request</button>
                    <button onClick={this.sendNodeToDB}>Send test node to DB</button>
                    <button onClick={this.getAllNodesFromDB}>Get all nodes from DB</button>
                    {loading && <div>Loading...</div>}
                    <ul>
                        your auth token is: {authToken}
                    </ul>
                </div>
                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control onChange={this._onChangePassword} type="password" placeholder="Password" />
                </Form.Group>
                <Form.Group controlId="formBasicUserName">
                    <Form.Label>UserName</Form.Label>
                    <Form.Control onChange={this._onChangeUserName} type="string" placeholder="Your username" />
                </Form.Group>
                <Button onClick={this.signIn} variant="primary" type="submit">Sign In</Button>
            </Form>
        )


        return (
            signInPage

        )
    }


}

export default connect(mapStateToProps, mapDispatcherToProps)(SignIn);