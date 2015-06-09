var React = require('react/addons'),
    mui = require('material-ui'),
    saveAs = require('filesaver.js'),
    Take = require('take-stream'),
    concat = require('concat-stream'),
    stravaGeoJSON = require('strava-geojson'),
    { TextField, RaisedButton, CircularProgress } = mui,
    Colors = mui.Styles.Colors,
    ThemeManager = new mui.Styles.ThemeManager();

require('react-tap-event-plugin')();

var Exporter = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return {
      accessToken: '',
      exporting: false,
      runsExported: 0
    };
  },
  export() {
    this.setState({ exporting: true });
    var exportStream = stravaGeoJSON(this.state.accessToken);
    exportStream.on('data', d => this.setState((oldState) => {
        oldState.runsExported++
    }))
    exportStream.on('error', e => this.setState({ error: e }))
    exportStream.pipe(concat(geojson => {
        this.setState({ exporting: false });
        var blob = new Blob([geojson], {type: "text/plain;charset=utf-8"});
        saveAs(blob, 'runs.geojson');
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
        {this.state.exporting &&
        <div>
          {this.state.runsExported} runs exported
          <CircularProgress mode="indeterminate" />
        </div>}
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
