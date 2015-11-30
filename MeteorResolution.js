Resolutions = new Mongo.Collection('resolutions');

if (Meteor.isClient) {
  Meteor.subscribe('resolutions');

  Template.body.helpers({
    resolutions: function() {
      if (Session.get('hideFinished')) {
        return Resolutions.find({checked: {$ne: true}});
      } else {
        return Resolutions.find().fetch().reverse();
      }
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
}


Meteor.methods({
  addResolution: function(title, url, escapeUrl) {
    Resolutions.insert({
    title : title,
    url : url,
    escapeUrl : escapeUrl,
    createdAt : new Date(),
    owner: Meteor.userId()
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









