import React, { Component } from "react";
import PropTypes from "prop-types";
import T from "i18n-react";
import Select from "react-select";
import { Button, InputGroup, InputGroupAddon } from "reactstrap";

const cities = [
  {
    name: "Riyadh",
    lat: 24.7135633,
    lon: 46.6751745,
    radius: 25000
  },
  {
    name: "Jeddah",
    lat: 21.4858606,
    lon: 39.1925537,
    radius: 20000
  },
  {
    name: "Dammam",
    lat: 26.4204593,
    lon: 50.0888313,
    radius: 13000
  }
];

class CitySelectorWidget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      citySelectOptions: [],
      selectedCity: null
    };

    this.buildCityOptionFromTheResource = item => ({
      value: item.name,
      label: item.name,
      data: item
    });

    this.loadAvailableCities = () => {
      const citySelectOptions = [];
      cities.forEach(item => {
        const cityOption = this.buildCityOptionFromTheResource(item);
        citySelectOptions.push(cityOption);
      });
      this.setState({ citySelectOptions });
    };

    this.handleChangeOnCity = selectedCity => {
      const { onCityChange } = this.props;
      this.setState({ selectedCity });

      if (selectedCity) {
        onCityChange(selectedCity.data);
      }
    };
  }

  componentDidMount() {
    this.loadAvailableCities();
  }

  render() {
    const { selectedCity, citySelectOptions } = this.state;
    return (
      <InputGroup>
        <Select
          name="status"
          value={selectedCity}
          onChange={this.handleChangeOnCity}
          options={citySelectOptions}
          placeholder={T.translate("liveOperations.citySelector.placeholder")}
          className="react-select-container flex-fill"
          classNamePrefix="react-select"
          autoFocus
        />
        <InputGroupAddon addonType="append">
          <Button
            disabled={!selectedCity}
            onClick={() => this.handleChangeOnCity(selectedCity)}
          >
            {T.translate("liveOperations.citySelector.centerMap")}
          </Button>
        </InputGroupAddon>
      </InputGroup>
    );
  }
}

CitySelectorWidget.propTypes = {
  onCityChange: PropTypes.func.isRequired
};

export default CitySelectorWidget;
