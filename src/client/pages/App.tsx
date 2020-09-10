import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Navbar from "react-bootstrap/Navbar";
import { LinkContainer } from 'react-router-bootstrap';

import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Home from "./Home"
import Test from "./Test"

import UploadFile from "./UploadFile";

class App extends React.Component {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        const App = () => (
            <div>
                <Navbar bg="light">
                    <LinkContainer to="/">
                        <Navbar.Brand>Home</Navbar.Brand>
                    </LinkContainer>
                </Navbar>
                <Container className="p-3">
                    <Switch>
                        <Route exact path='/' component={Home}/>
                        <Route path='/uploadFile' component={UploadFile}/>
                        <Route path='/signIn' component={SignIn} />
                        <Route path='/signUp' component={SignUp}/>
                        <Route path='/test' component={Test}/>
                    </Switch>
                </Container>
            </div>
        );

        return (
            <Switch>
                <App/>
            </Switch>
        );
    }
}

export default App;