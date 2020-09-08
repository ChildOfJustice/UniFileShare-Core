import * as React from "react";
import * as ReactDOM from "react-dom";
import {BrowserRouter, Switch} from "react-router-dom";

import "bootstrap/scss/bootstrap.scss";

import App from "./pages/App";

import { Provider } from 'react-redux';
import store from '../store';

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>,
    </Provider>,
    document.getElementById("root")
);