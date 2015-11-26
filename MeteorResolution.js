if (Meteor.isClient) {
  Template.body.helpers({
    resolutions: [
    {title: "Hello Resolution #1"},
    {title: "Bye Resolution #2"},
    {title: "Kanye"},
    ]
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
