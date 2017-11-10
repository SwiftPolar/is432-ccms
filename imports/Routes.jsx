import React, {Component} from 'react'
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import {createContainer} from 'meteor/react-meteor-data';

import PublicApp from './ui/public/App';
import MomApp from './ui/mom/App';

export const RenderRoutes = () => (
    <Router>
        <div><Switch>
            <Route exact path="/" component={PublicApp}/>
            <Route path="/public" component={PublicApp}/>
            <Route path="/mom" component={MomApp} />
        </Switch></div>
    </Router>
)