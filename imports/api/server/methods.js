import {Meteor} from 'meteor/meteor';
import {Feedback} from '../collections';
import {HTTP} from 'meteor/http';

Meteor.publish('getFeedback', (id) => {
    return Feedback.find({_id: id});
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
            notes: "",
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
        Feedback.update(id, {$set: {
            lastUpdated: updateTime,
            status: assignment ? "pending" : "received",
            severity, internal,
            deadline: new Date(deadline),
            assignment
        }});
        //TODO: ADD IN HISTORY COMPONENT
    },

    uploadAdditionalFiles(id, files, filesName) {
        if (!id || !files || !filesName) throw new Meteor.Error('500 Internal Server Error');
        let user = Meteor.user();
        if (!user) throw new Meteor.Error('500 Permissions Denied');
        writeFiles(files, filesName, id, true);
        //TODO: ADD IN HISTORY COMPONENT

    },

    checkFeedback(id, feedbackId) {
        if (!id || !feedbackId) {
            throw new Meteor.Error("500 Internal Server Error");
        }
        let feedback = Feedback.findOne({_id: feedbackId, id: id});
        return feedback;
    },

    markSpam(id) {
        Feedback.update({_id: id}, {$set: {status: "spam"}});
    },

    closeCase(id, remarks) {
        Feedback.update({_id: id}, {$set: {status: "closed", finalRemarks: remarks}});
    },

    forwardFeedback(id, message) {

    }
});