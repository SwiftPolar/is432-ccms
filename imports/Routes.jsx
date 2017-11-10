import React, {Component} from 'react'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { createContainer } from 'meteor/react-meteor-data';

import PublicApp from './ui/public/App';

export const RenderRoutes = () => (
    <Router>
        <div><Switch>
            <Route exact path="/" component={PublicApp} />
            <Route exact path="/public" component={PublicApp} />
        </Switch></div>
    </Router>
)