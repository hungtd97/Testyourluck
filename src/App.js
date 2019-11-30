import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { Dashboard } from "./view/dashboard";
import "./assets/bootstrap/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/">
            <Dashboard />
          </Route>
        </Switch >

      </Router>
    </div>
  );
}

export default App;
