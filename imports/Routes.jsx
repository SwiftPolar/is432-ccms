import React, {Component} from 'react'
import {BrowserRouter as Router, Route, Redirect, Switch} from 'react-router-dom';
import {withTracker} from 'meteor/react-meteor-data';

import PublicApp from './ui/public/App';
import MomApp from './ui/mom/App';
import Login from './ui/mom/Login';

export const RenderRoutes = () => (
    <Router>
        <div><Switch>
            <Route exact path="/" component={PublicApp}/>
            <Route path="/public" component={PublicApp}/>
            <Route exact path='/mom/login' component={Login}/>
            <AuthRoute path="/mom" component={MomApp}/>
        </Switch></div>
    </Router>
)

class AuthRouteComponent extends Component {
    constructor(props) {
        super();
        this.state = {user: props.user};
    }

    componentWillReceiveProps(props) {
        this.setState({user: props.user});
    }

    render() {
        const {user} = this.state;
        return user ? (
            <Route {...this.props} />
        ) : user === undefined ? (
            <div>Loading</div>
        ) : (
            <Redirect to={{pathname: '/mom/login', state: {from: this.props.location}}}/>
        );
    }
}
;

const AuthRoute = withTracker((props) => {
    const user = Meteor.user();
    return {
        user,
        props
    }
})(AuthRouteComponent);