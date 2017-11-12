import React, {Component} from 'react';
import {Grid, Button, Input, Segment, Image, Message} from 'semantic-ui-react';
import {withTracker} from 'meteor/react-meteor-data';
import {Redirect} from 'react-router-dom';

class Login extends Component {
    constructor(props) {
        super();
        this.state = {
            error: false,
            loggedIn: props.user ? true : false
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            loggedIn: props.user ? true : false
        })
    }

    onInputChange(evt, data) {
        let {value, name} = data;
        let state = {};
        state[name] = value;
        this.setState(state);
    }

    login(evt) {
        const {username, password} = this.state;
        Meteor.loginWithPassword(username, password, (err) => {
            if (err) {
                this.setState({error: true});
                return;
            }


        });
    }

    render() {
        return !this.state.loggedIn ? (
            <Grid container centered style={{marginTop: '200px'}}>
                <Grid.Column width={6}>
                    <Segment textAlign='right'>
                        <Image src="/images/mom-logo-share-hd.png" fluid/>
                        <Input icon='user' name='username' fluid placeholder='username'
                               onChange={this.onInputChange.bind(this)}/>
                        <Input icon='lock' style={{marginTop: '14px'}} name='password'
                               fluid placeholder='password' type='password'
                               onChange={this.onInputChange.bind(this)}/>
                        <Button style={{marginTop: '14px'}} content='Login' onClick={this.login.bind(this)}/>
                    </Segment>
                    <Message header="Error logging in!" content="Incorrect password/user"
                             style={{display: this.state.error ? "block" : "none"}} error/>
                </Grid.Column>
            </Grid>
        ) : (
            <Redirect to={{pathname: '/mom', state: {from: this.props.props.location}}} />
        )
    }
}

export default LoginContainer = withTracker((props) => {
    const user = Meteor.user();
    return {
        user,
        props
    }
})(Login);