import React, {Component} from 'react';
import {Grid, Image, Menu, Container, Icon, Dropdown, Breadcrumb} from 'semantic-ui-react';
import {Link, Route} from 'react-router-dom';
import {withTracker} from 'meteor/react-meteor-data';


import Dashboard from './Dashboard';
import Complaint from './Complaint';
import BrowseComplaint from './BrowseComplaint';

class MomApp extends Component {
    constructor(props) {
        super();
        this.state = {
            match: props.match,
            user: props.user ? props.user : {}
        };
    }

    componentWillReceiveProps(props) {
        this.setState({user: props.user ? props.user : {}})
    }

    render() {
        const {match, user} = this.state;

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
                        <Dropdown item text={<div><Icon name="sidebar"/>MENU</div>}>
                            <Dropdown.Menu style={{background: '#006eab'}}>
                                <Link to="/mom"><Dropdown.Item>
                                    Dashboard</Dropdown.Item></Link>
                                <Link to="/mom/browse/complaint"><Dropdown.Item>
                                    View Complaints</Dropdown.Item></Link>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Menu.Item><Breadcrumb icon='right angle' sections={[
                            {key: 'home', content: 'Home'},
                            {key: 'feedbackMgmt', content: 'Feedback Management'},
                        ]}/></Menu.Item>
                        <Menu.Item position="right">
                            Welcome back, {user.username}!
                        </Menu.Item>
                    </Menu></Container>
                </Grid.Row>
                <Grid.Row>
                    <Grid container>
                        <Grid.Row><Grid.Column width={16}>
                            <Route exact path={match.url}
                                   render={props => <Dashboard {...props} user={user}/>} />
                            <Route exact path={match.url + "/complaint/:id"}
                                   render={props => <Complaint {...props} user={user}/>} />
                            <Route exact path={match.url + "/browse/complaint"}
                                   render={props => <BrowseComplaint {...props} user={user}/>} />
                        </Grid.Column></Grid.Row>
                    </Grid>
                </Grid.Row>
            </Grid>
        </div>)
    }
}


export default MomAppContainer = withTracker(({...rest}) => {
    const user = Meteor.user();
    if (user) {
        Meteor.call('getUserRole', (err, res) => {
            if (err) return;
            user.role = res;
        });
    }
    return {
        user,
        ...rest
    }
})(MomApp);