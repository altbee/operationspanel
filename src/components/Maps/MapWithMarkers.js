import React, { Component } from "react";
import PropTypes from "prop-types";
import get from "get-value";
import {
  withGoogleMap,
  GoogleMap,
  Marker,
  GoogleMapProps,
  MarkerProps,
  InfoWindow
} from "react-google-maps";

const Map = withGoogleMap(props => (
  <GoogleMap
    ref={props.mapRef}
    {...props.mapProps}
    onTilesLoaded={props.onTilesLoaded}
  >
    {props.markers.map((markerProps, index) => {
      const { activeInfoWindow } = props;
      const { infoWindowId, infoWindow, ...otherProps } = markerProps;
      return (
        <Marker key={`marker-${index + 1}`} {...otherProps}>
          {infoWindow &&
            (!infoWindowId || infoWindowId === activeInfoWindow) && (
              <InfoWindow>{infoWindow}</InfoWindow>
            )}
        </Marker>
      );
    })}
  </GoogleMap>
));

export class MapWithMarkers extends Component {
  constructor(props) {
    super(props);

    this.mapRef = React.createRef();

    this.init = false;
    this.zoomInterval = null;

    this.setCenterAndZoom = () => {
      if (!this.init) {
        this.zoomInterval = setInterval(() => {
          let tick = 0; // waits for 10s

          const { autoCenter, markers } = this.props;

          if (markers.length && autoCenter) {
            const bounds = new window.google.maps.LatLngBounds();

            markers.forEach(marker => {
              bounds.extend(
                new window.google.maps.LatLng(
                  marker.position.lat,
                  marker.position.lng
                )
              );
            });

            if (get(this, "mapRef.current", false)) {
              this.mapRef.current.fitBounds(bounds);
            }

            clearInterval(this.zoomInterval);
            this.init = true;
          } else {
            tick += 1;

            if (tick >= 10) {
              clearInterval(this.zoomInterval);
              this.init = true;
            }
          }
        }, 1000);
      }
    };

    this.onTilesLoaded = () => {
      const { onRef } = this.props;
      this.setCenterAndZoom();

      if (onRef && get(this, "mapRef.current", false)) {
        onRef(this.mapRef);
      }
    };
  }

  componentWillUnmount() {
    clearInterval(this.zoomInterval);
    this.init = true;
  }

  render() {
    const {
      mapProps,
      markers,
      containerHeight,
      activeInfoWindow,
      className
    } = this.props;

    return (
      <Map
        mapRef={this.mapRef}
        mapProps={mapProps}
        onTilesLoaded={this.onTilesLoaded}
        markers={markers}
        activeInfoWindow={activeInfoWindow}
        containerElement={
          <div
            style={{ height: containerHeight, marginBottom: "20px" }}
            className={className}
          />
        }
        mapElement={<div style={{ height: "100%" }} />}
      />
    );
  }
}

MapWithMarkers.propTypes = {
  onRef: PropTypes.func,
  mapProps: PropTypes.shape(GoogleMapProps),
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      infoWindow: PropTypes.node,
      infoWindowId: PropTypes.any,
      ...MarkerProps
    })
  ),
  autoCenter: PropTypes.bool,
  containerHeight: PropTypes.string,
  activeInfoWindow: PropTypes.oneOfType([PropTypes.any]),
  className: PropTypes.string
};

MapWithMarkers.defaultProps = {
  onRef: undefined,
  mapProps: null,
  markers: [],
  autoCenter: true,
  containerHeight: "50vh",
  activeInfoWindow: null,
  className: ""
};

export default MapWithMarkers;
