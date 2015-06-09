var React = require('react/addons'),
    mui = require('material-ui'),
    concat = require('concat-stream'),
    stravaGeoJSON = require('strava-geojson'),
    { TextField, RaisedButton, LinearProgress } = mui,
    Colors = mui.Styles.Colors,
    ThemeManager = new mui.Styles.ThemeManager();

require('react-tap-event-plugin')();

var Exporter = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return {
      accessToken: '',
      exporting: false
    };
  },
  export() {
    stravaGeoJSON(this.state.accessToken)
        .on('error', e => this.setState({ error: e })
        .pipe(concat(geojson => {
            console.log(geojson);
        }));
  },
  render: function() {
    return (
      <div>
        <TextField
          valueLink={this.linkState('accessToken')}
          hintText='Strava Access Token' />
        <RaisedButton
          disabled={!this.state.accessToken}
          onClick={this.export}
          label='Export' />
        {this.state.exporting && <LinearProgress mode="indeterminate" />}
      </div>
    );
  }
});

var App = React.createClass({
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
  render: function() {
    return (
      <Exporter />
    );
  }
});

React.render(<App />, document.body.appendChild(document.createElement('div')));
