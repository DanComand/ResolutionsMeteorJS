Resolutions = new Mongo.Collection('resolutions');
Comments = new Mongo.Collection('comments');  

if (Meteor.isClient) {
  Meteor.subscribe('resolutions');
  Meteor.subscribe('comments');

  Template.body.helpers({
    resolutions: function() {
      if (Session.get('hideFinished')) {
        return Resolutions.find({checked: {$ne: true}});
      } else {
        return Resolutions.find().fetch().reverse();
      }
    },

    comments: function(resolutionId) {
      return Comments.find({resolutionId: resolutionId});
    },

    hideFinished: function() {
      return Session.get('hideFinished');
    }
  });


  Template.body.events({
    'submit .new-resolution': function(event) {
      var title = event.target.title.value;
      var url = event.target.url.value;
      var escapeUrl = Embedly.extract(url);
      
      // var embedUrl = Embedly.extract(escapeUrl);

      Meteor.call("addResolution", title, url, escapeUrl);

      event.target.title.value = "";
      event.target.url.value = "";

      return false;
    },

    'submit .new-comment': function(event) {
      var comment = event.target.comment.value;

      Meteor.call("addComment", comment, resolutionId);
      event.target.comment.value = "";

      return false;
    },

    'change .hide-finished': function(event) {
      Session.set('hideFinished', event.target.checked);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish("resolutions", function() {
    return Resolutions.find({
      $or: [
        { private: { $ne: true} },
        { owner: this.userId }
      ]
    });
  });

  Meteor.publish("comments", function(resolutionId) {  
    return Comments.find({resolutionId: resolutionId});
});
}


Meteor.methods({
  addResolution: function(title, url, escapeUrl) {
    Resolutions.insert({
    title : title,
    url : url,
    escapeUrl : escapeUrl,
    createdAt : new Date(),
    owner: Meteor.userId(),
    username: Meteor.user().username
    });
  },

  addComment: function(comment, resolutionId) {
    Comments.insert({
      comment : comment,
      resolutionId: resolutionId
    });
  },

  updateResolution: function(id, checked) {
    var res = Resolutions.findOne(id);

    if(res.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Resolutions.update(id, {$set: {checked: checked}});
  },
  setPrivate: function(id, private) {
    var res = Resolutions.findOne(id);

    if(res.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Resolutions.update(id, {$set: {private: private}});
  },
  deleteResolution: function(id) {
    var res = Resolutions.findOne(id);

    if(res.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    Resolutions.remove(id);
  }
});









