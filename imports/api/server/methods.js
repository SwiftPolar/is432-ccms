import {Meteor} from 'meteor/meteor';
import {Feedback} from '../collections';
import {HTTP} from 'meteor/http';

Meteor.publish('getFeedback', (id) => {
    return Feedback.find({_id: id});
});

Meteor.publish('getDashboard', () => {
    return Feedback.find({
        status: {$ne: 'closed'},
    }, {
        fields: {severity: 1, deadline: 1, type: 1, internal: 1}
    });
});

Meteor.publish('getCompliments', () => {
    return Feedback.find({type: 'compliment'}, {
        fields: {_id: 1, type: 1, area: 1, lastUpdated: 1,
            internal: 1, status: 1, assignment: 1 }
    });
});

Meteor.publish('getComplaints', () => {
    return Feedback.find({type: 'complaint'}, {
        fields: {_id: 1, type: 1, severity: 1, deadline: 1, area: 1, lastUpdated: 1,
            internal: 1, status: 1, assignment: 1 }
    });
});

const writeFiles = (files, filesName, id, additional = false) => {

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let fileName = filesName[i];

        let options = {
            headers: {
                'File-Name': fileName,
                "Folder": id,
            },
            npmRequestOptions: {
                body: new Buffer(file, "binary")
            }
        };

        //perhaps let multiple uploads per call?
        let res = HTTP.call('POST', 'http://localhost:1337/upload', options);
        res = res.data;
        if (res.status === 'error') { //ERROR returned from file host
            throw new Meteor.Error("Response error!", res.result);
        }
        if (additional) {
            Feedback.update({_id: id}, {$push: {additionalFiles: res.result}});
        } else {
            Feedback.update({_id: id}, {$push: {files: res.result}});
        }
    }
};

const pushHistory = (id, {type, info, extra}, user) => {
    const date = new Date();
    let content = "";
    let extraInfo = "";

    switch (type) {
        case "updateInfo":
            content = "updated feedback information";
            break;
        case "updateAssignment":
            content = "has assigned the case to " + info;
            break;
        case "uploadAdditional":
            content = "uploaded additional " + info + " file(s)";
            break;
        case "newNote":
            content = "added a new note";
            extraInfo = extra.length > 30 ? extra.substring(0, 27) + '...' : extra;
            break;
        case "spam":
            content = "marked the case as spam";
            break;
        case "closeCase":
            content = "has closed the case";
            extraInfo = extra.length > 30 ? extra.substring(0, 27) + '...' : extra;
            break;
        case "openCase":
            content = "has reopend the case";
            break;
        case "forwardFeedback":
            content = "has forwarded the case to " + info;
            break;

    }
    let history = {date, content, user, type, extra: extraInfo};
    Feedback.update(id, {$push: {history: history}});
};

Meteor.methods({
    getUserRole() {
        let user = Meteor.user();
        if (!user) return null;
        return user.role;
    },
    newFeedback(feedback) {
        if (!feedback || !feedback.area || !feedback.type || !feedback.details || !feedback.id || !feedback.email || !feedback.name) {
            throw new Meteor.Error("500 Internal Server Error");
        }
        const {id, area, type, details, email, name, files, filesName} = feedback;
        let feedbackID = Feedback.insert({
            id, area, type, details, name, email,
            status: "received",
            lastUpdated: new Date(),
            severity: "unassigned",
            internal: "",
            deadline: "",
            notes: [],
            files: [],
            additionalFiles: [],
            assignment: "",
            history: []
        });
        if (files && files.length > 0) {
            writeFiles(files, filesName, feedbackID);
        }

        return feedbackID;
    },

    updateFeedbackInfo(id, data) {
        if (!id || !data) throw new Meteor.Error('500 Internal Server Error');
        let user = Meteor.user();
        if (!user) throw new Meteor.Error('500 Permissions Denied');
        const {assignment, severity, internal, deadline} = data;
        const updateTime = new Date();
        const oldFeedback = Feedback.findOne(id);
        Feedback.update(id, {$set: {
            lastUpdated: updateTime,
            status: assignment ? "pending" : "received",
            severity, internal,
            deadline: new Date(deadline),
            assignment
        }});
        pushHistory(id, {type: 'updateInfo'}, user.username);
        if (oldFeedback.assignment !== assignment) {
            pushHistory(id, {type: 'updateAssignment', info: assignment}, user.username);
        }
    },

    uploadAdditionalFiles(id, files, filesName) {
        if (!id || !files || !filesName) throw new Meteor.Error('500 Internal Server Error');
        let user = Meteor.user();
        if (!user) throw new Meteor.Error('500 Permissions Denied');
        writeFiles(files, filesName, id, true);
        pushHistory(id, {type: 'uploadAdditional', info: files.length}, user.username);

    },

    addNewNote(id, note) {
        if (!id || !note) throw new Meteor.Error('500 Internal Server Error');
        let user = Meteor.user();
        if (!user) throw new Meteor.Error('500 Permissions Denied');
        Feedback.update(id, {$push: {notes: {
            author: user.username,
            date: new Date(),
            message: note
        }}});
        pushHistory(id, {type: 'newNote', extra: note}, user.username);

    },

    checkFeedback(id, feedbackId) {
        if (!id || !feedbackId) {
            throw new Meteor.Error("500 Internal Server Error");
        }
        let feedback = Feedback.findOne({_id: feedbackId, id: id});
        return feedback;
    },

    markSpam(id) {
        let user = Meteor.user();
        if (!user) throw new Meteor.Error('500 Permissions Denied');
        Feedback.update({_id: id}, {$set: {status: "spam"}});
        pushHistory(id, {type: 'spam'}, user.username);

    },

    closeCase(id, remarks) {
        let user = Meteor.user();
        if (!user) throw new Meteor.Error('500 Permissions Denied');
        let date = new Date();
        Feedback.update({_id: id}, {$set: {status: "closed", finalRemarks: remarks,
            lastUpdated: date, closeDate: date}});
        pushHistory(id, {type: 'closeCase', extra: remarks}, user.username);

    },

    openCase(id) {
        let user = Meteor.user();
        if (!user) throw new Meteor.Error('500 Permissions Denied');
        Feedback.update({_id: id}, {$set: {status: "pending", assignment: user.username, lastUpdated: new Date()}});
        pushHistory(id, {type: 'openCase'}, user.username);

    },

    forwardFeedback(id, message, department) {
        let user = Meteor.user();
        if (!user) throw new Meteor.Error('500 Permissions Denied');
        const departments = {
            foreign: 'Foreign Manpower',
            hr: 'Human Resources',
            legal: 'Legal Services',
            safetyhealth: 'Safety and Health',
            workpass: 'Work Pass'
        };
        pushHistory(id, {type: 'forwardFeedback', info: departments[department]}, user.username);

    }
});