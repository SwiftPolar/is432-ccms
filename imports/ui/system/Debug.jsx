import React, {Component} from 'react';
import {Grid, Button, Input, Header, Select} from 'semantic-ui-react';

export default class Debug extends Component {
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

    createUser(evt) {
        const {username, password, role} = this.state;
        Meteor.call('createMomUser', username, password, role);
    }

    render() {
        return (
            <Grid container centered style={{marginTop: '200px'}}>
                <Grid.Column width={6}>
                    <Header textAlign='center' content="Create New User"/>
                    <Input icon='user' name='username' fluid placeholder='username'
                           onChange={this.onInputChange.bind(this)}/>
                    <Input icon='lock' style={{marginTop: '14px'}} name='password'
                           fluid placeholder='password' type='password'
                           onChange={this.onInputChange.bind(this)}/>
                    <Select style={{marginTop: '14px'}} onChange={this.onInputChange.bind(this)}
                            name='role' placeholder="role" options={[
                        {key: 'role-clerk', value: 'clerk', text: 'Clerk'},
                        {key: 'role-supervisor', value: 'supervisor', text: 'Supervisor'},
                    ]} fluid/>
                    <Button style={{marginTop: '14px'}} content='Create User' fluid
                            onClick={this.createUser.bind(this)}/>
                </Grid.Column>
            </Grid>
        )
    }
}