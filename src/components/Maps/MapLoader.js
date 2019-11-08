import React, { Component } from "react";
import PropTypes from "prop-types";
import { withScriptjs } from "react-google-maps";

class MapLoader extends Component {
  constructor(props) {
    super(props);

    const { libraries } = this.props;
    switch (typeof libraries) {
      case "string":
        this.libs = libraries;
        break;
      case "object":
        this.libs = libraries.join(",");
        break;
      default:
    }
  }

  render() {
    const { apiKey, children } = this.props;
    const Wrapper = withScriptjs(() => children);

    return (
      <Wrapper
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${
          this.libs
        }`}
        loadingElement={<div />}
        {...this.props}
      />
    );
  }
}

MapLoader.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  libraries: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string
  ]),
  apiKey: PropTypes.string.isRequired
};

MapLoader.defaultProps = {
  children: null,
  libraries: "places"
};

export default MapLoader;
