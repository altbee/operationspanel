import React from "react";
import PropTypes from "prop-types";
import {
  withGoogleMap,
  GoogleMap,
  Marker,
  DirectionsRenderer,
  MarkerProps
} from "react-google-maps";

const MapWithDirections = props => {
  const { markers, directions, centerPoint } = props;
  const Map = withGoogleMap(() => (
    <GoogleMap defaultZoom={8} defaultCenter={centerPoint}>
      {markers.map(marker => (
        <Marker
          key={marker.lat}
          position={{ lat: marker.lat, lng: marker.lng }}
        />
      ))}
      {directions != null && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  ));

  return (
    <Map
      containerElement={<div style={{ height: "400px" }} />}
      mapElement={<div style={{ height: "100%" }} />}
    />
  );
};

MapWithDirections.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.shape(MarkerProps)),
  directions: PropTypes.objectOf(PropTypes.object),
  centerPoint: PropTypes.objectOf(PropTypes.number)
};

MapWithDirections.defaultProps = {
  markers: [],
  directions: null,
  centerPoint: { lat: 24.6037022, lng: 46.6622325 }
};

export default MapWithDirections;
