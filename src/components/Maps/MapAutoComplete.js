import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  withGoogleMap,
  GoogleMap,
  Marker,
  GoogleMapProps
} from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";

export class MapAutoComplete extends Component {
  constructor(props) {
    super(props);

    const { defaultPosition } = this.props;
    this.state = {
      position: defaultPosition,
      forceRefresh: false
    };

    this.onMapMounted = ref => {
      this.mapRef = ref;
    };

    this.onSearchBoxMounted = ref => {
      this.searchBoxRef = ref;
    };

    this.onPlacesChanged = () => {
      const { onLocationUpdate, onAddressUpdate } = this.props;
      const places = this.searchBoxRef.getPlaces();
      if (places.length < 1) return;
      const position = {
        lat: places[0].geometry.location.lat(),
        lng: places[0].geometry.location.lng()
      };
      this.setState({
        forceRefresh: true,
        position
      });
      onLocationUpdate(position);
      onAddressUpdate(places[0].formatted_address);
    };

    this.onDragEnd = ({ latLng }) => {
      const { onLocationUpdate } = this.props;
      const position = {
        lat: latLng.lat(),
        lng: latLng.lng()
      };
      onLocationUpdate(position);
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { defaultPosition } = this.props;
    if (nextState.forceRefresh === true) {
      this.setState({ forceRefresh: false });
      return true;
    }
    if (
      defaultPosition.lat !== nextProps.defaultPosition.lat ||
      defaultPosition.lng !== nextProps.defaultPosition.lng
    ) {
      this.setState({
        position: nextProps.defaultPosition,
        forceRefresh: true
      });
    }
    return false;
  }

  render() {
    const { position } = this.state;
    const {
      mapProps,
      containerHeight,
      placeholder,
      inputClassName
    } = this.props;

    const Map = withGoogleMap(() => (
      <GoogleMap
        ref={this.onMapMounted}
        defaultZoom={15}
        center={position}
        {...mapProps}
      >
        <SearchBox
          ref={this.onSearchBoxMounted}
          controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
          onPlacesChanged={this.onPlacesChanged}
        >
          <input
            type="text"
            placeholder={placeholder}
            className={`form-control col-5 m-2 ${inputClassName}`}
          />
        </SearchBox>
        <Marker draggable position={position} onDragEnd={this.onDragEnd} />
      </GoogleMap>
    ));

    return (
      <Map
        containerElement={
          <div style={{ height: containerHeight, marginBottom: "20px" }} />
        }
        mapElement={<div style={{ height: "100%" }} />}
      />
    );
  }
}

MapAutoComplete.propTypes = {
  mapProps: PropTypes.shape(GoogleMapProps),
  defaultPosition: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  containerHeight: PropTypes.string,
  placeholder: PropTypes.string,
  inputClassName: PropTypes.string,
  onLocationUpdate: PropTypes.func,
  onAddressUpdate: PropTypes.func
};

MapAutoComplete.defaultProps = {
  mapProps: {
    defaultOptions: {
      scrollwheel: false,
      disableDefaultUI: true,
      zoomControl: true
    }
  },
  defaultPosition: {
    lat: 41.9,
    lng: -87.624
  },
  containerHeight: "50vh",
  placeholder: "",
  inputClassName: "",
  onLocationUpdate: () => null,
  onAddressUpdate: () => null
};

export default MapAutoComplete;
