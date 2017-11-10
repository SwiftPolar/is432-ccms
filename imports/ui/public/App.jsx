import React, {Component} from 'react';
import {Grid, Image, Menu, Container, Icon, Breadcrumb, Header, Segment, Dropdown} from 'semantic-ui-react';
import {Link, Route} from 'react-router-dom';

import FeedbackForm from './FeedbackForm';
import CheckForm from './CheckForm';

export default class App extends Component {
    constructor({match}) {
        super();
        this.state = {match};
    }

    render() {
        const {match} = this.state;

        return (<div>
            <Grid >
                <Grid.Row style={{paddingBottom: '0'}}>
                    <Container><Menu borderless fluid style={{boxShadow: 'none', border: '0'}}>
                        <Link to='/public'><Menu.Header as="div" link={""}>
                            <Image src="/images/mom-logo-share-hd.png" size="small"/>
                        </Menu.Header></Link>
                        <Menu.Item position="right">
                            <Image size="small" src="/images/sg-gov-logo.png"/>
                        </Menu.Item>
                    </Menu></Container>
                </Grid.Row>
                <Grid.Row style={{background: '#006eab', paddingTop: '0', paddingBottom: '0'}}>
                    <Container><Menu borderless size="massive" fluid inverted
                                     style={{boxShadow: 'none', border: '0', background: '#006eab'}}>
                        <Dropdown item text={<div><Icon name="sidebar" />MENU</div>}>
                            <Dropdown.Menu style={{background: '#006eab'}}>
                                <Link to="/public/feedback"><Dropdown.Item>
                                    Submit New Feedback</Dropdown.Item></Link>
                                <Link to="/public/check"><Dropdown.Item>
                                    Check Feedback Status</Dropdown.Item></Link>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Menu.Item><Breadcrumb icon='right angle' sections={[
                            {key: 'home', content: 'Home'},
                            {key: 'eservices', content: 'eServices'},
                            {key: 'ccms-form', content: 'Feedback'},
                        ]}/></Menu.Item>
                    </Menu></Container>
                </Grid.Row>
                <Grid.Row>
                    <Grid container>
                        <Grid.Row><Grid.Column width={16}>
                            <Route exact path={match.url + '/feedback'} component={FeedbackForm}/>
                            <Route exact path={match.url + '/check'} component={CheckForm}/>
                        </Grid.Column></Grid.Row>
                    </Grid>
                </Grid.Row>
            </Grid>
        </div>)
    }
}