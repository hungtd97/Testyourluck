import { React } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import { Dashboard } from "../view/dashboard";

export default class MyRoute extends React.Component {
    render() {
        return (
            <Route>
                <Switch>
                    <Route path="/">
                        <Dashboard />
                    </Route>
                </Switch >

            </Route>
        )
    }
}