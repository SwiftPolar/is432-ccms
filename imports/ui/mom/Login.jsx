import React, {Component} from 'react';
import {Grid, Button, Input, Segment, Image} from 'semantic-ui-react';

export default class Login extends Component {
    constructor(props) {
        super();
        this.state = {};
    }

    onInputChange(evt, data) {
        let {value, name} = data;
        let state = {};
        state[name] = value;
        this.setState(state);
    }

    login(evt) {
        const {username, password} = this.state;
        Meteor.loginWithPassword(username, password);
    }

    render() {
        return (
            <Grid container centered style={{marginTop: '200px'}}>
                <Grid.Column width={6}><Segment textAlign='right'>
                    <Image src="/images/mom-logo-share-hd.png" fluid />
                    <Input icon='user' name='username' fluid placeholder='username'
                           onChange={this.onInputChange.bind(this)}/>
                    <Input icon='lock' style={{marginTop: '14px'}}  name='password'
                           fluid placeholder='password' type='password'
                           onChange={this.onInputChange.bind(this)}/>
                    <Button style={{marginTop: '14px'}} content='Login'  onClick={this.login.bind(this)}/>
                </Segment></Grid.Column>
            </Grid>
        )
    }
}