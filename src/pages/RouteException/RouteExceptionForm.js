import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import T from "i18n-react";
import { Redirect, withRouter } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button
} from "reactstrap";
import { ROUTE_EXCEPTION_TYPE } from "common/constants/models";
import Select from "react-select";
import get from "get-value";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class RouteExceptionForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = this.props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "routeExceptions",
      resource: {
        active: true,
        routeId: null,
        shipmentId: null,
        typeId: null
      },
      hiddenPropertyNamesOnForm: [
        "id",
        "createdAt",
        "updatedAt",
        "type",
        "shipment"
      ],
      selectedShipment: null,
      shipmentsSelectOptions: [],
      selectedType: null,
      typesSelectOptions: []
    };

    /**
     * Callback for when user input some data on form fields.
     * It saves the data in their component state.
     * @param event
     */
    this.handleInputChange = event => {
      const { target } = event;
      const { name, type } = target;
      let { value } = target;

      switch (type) {
        case "number":
          value = parseFloat(target.value);
          break;
        case "checkbox":
          value = target.checked;
          break;
        default:
          break;
      }

      this.setState(
        prevState => ({
          resource: { ...prevState.resource, [name]: value }
        }),
        () => {
          if (name === "routeId") {
            this.setState(prevState => ({
              selectedShipment: null,
              shipmentsSelectOptions: [],
              resource: {
                ...prevState.resource,
                shipmentId: null,
                shipment: null
              }
            }));
            window.clearTimeout(this.fetchTimeout);
            this.fetchTimeout = window.setTimeout(
              this.loadAvailableShipments,
              1000
            );
          }
        }
      );
    };

    /**
     * Callback for when user submits the form.
     * It sends the data to database via API.
     * @param event
     */
    this.handleSubmit = event => {
      event.preventDefault();
      const { resource } = this.state;
      this.save(resource);
    };

    /**
     * Checks if there's an ID set (on URL). If so, updates the record. Otherwise creates one.
     * @param data
     */
    this.save = async data => {
      const { resourceNameOnApi } = this.state;
      const response = await this.API.put(`/${resourceNameOnApi}`, data);
      this.setState(prevState => ({
        redirectTo: `/${prevState.resourceNameOnApi}/details/${
          response.data.id
        }`
      }));
    };

    /**
     * Loads in the form the data from resource to be updated.
     */
    this.loadResourceIfNeeded = () => {
      const { resourceNameOnApi } = this.state;
      if (match.params.id) {
        this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
          params: {
            filter: {
              include: [{ shipment: "partner" }, "type"]
            }
          }
        }).then(response => {
          const { data: resource } = response;
          this.setState({
            isLoading: false,
            resource
          });

          if (resource.routeId) {
            this.loadAvailableShipments();
          }

          if (resource.shipment) {
            this.setState({
              selectedShipment: this.buildShipmentOptionFromTheResource(
                resource.shipment
              )
            });
          }

          if (resource.type) {
            this.setState({
              selectedType: this.buildTypeOptionFromTheResource(resource.type)
            });
          }
        });
      }
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param shipment
     * @return {{value: *, label: string, data: *}}
     */
    this.buildShipmentOptionFromTheResource = shipment => ({
      value: shipment ? shipment.id : "",
      label: shipment
        ? T.translate("routes.detail.shipments.text", {
            trackingId: shipment.trackingId,
            name: shipment.partner
              ? shipment.partner.name
              : T.translate("defaults.notSet"),
            date: moment(shipment.createdAt).format("lll")
          })
        : "",
      data: shipment
    });

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param type
     * @return {{value: *, label: string, data: *}}
     */
    this.buildTypeOptionFromTheResource = type => ({
      value: type ? type.id : "",
      label: type
        ? T.translate(`routeExceptions.fields.types.${type.name}`)
        : "",
      data: type
    });

    /**
     * Loads from constants all available types, to build up the select options in the form.
     */
    this.loadAvailableTypes = () => {
      const typesSelectOptions = Object.keys(ROUTE_EXCEPTION_TYPE).map(type =>
        this.buildTypeOptionFromTheResource(ROUTE_EXCEPTION_TYPE[type])
      );
      this.setState({ typesSelectOptions });
    };

    /**
     * Loads from API all available shipments for this route, to build up the select options in the form.
     */
    this.loadAvailableShipments = async () => {
      const { resource } = this.state;
      if (!resource.routeId) return;
      try {
        const response = await this.API.get(
          `/routes/${resource.routeId}/shipments`
        );
        const shipmentOptions = [];
        response.data.forEach(item => {
          const shipmentOption = this.buildShipmentOptionFromTheResource(item);
          shipmentOptions.push(shipmentOption);
        });
        this.setState({
          shipmentsSelectOptions: shipmentOptions
        });
      } catch (e) {
        this.setState({
          resource: {
            ...resource,
            routeId: null
          }
        });
      }
    };

    /**
     * Callback function to when user selects some value on Shipment
     * form field. Saves shipment to this component state.
     * @param selectedShipment
     */
    this.handleChangeOnShipment = selectedShipment => {
      this.setState({ selectedShipment });
      if (selectedShipment === null) {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            shipment: null,
            shipmentId: null
          }
        }));
      } else {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            shipment: get(selectedShipment, "data", null),
            shipmentId: get(selectedShipment, "data.id", null)
          }
        }));
      }
    };

    /**
     * Callback function to when user selects some value on Type
     * form field. Saves types to this component state.
     * @param selectedType
     */
    this.handleChangeOnType = selectedType => {
      this.setState({ selectedType });
      if (selectedType === null) {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            type: null,
            typeId: null
          }
        }));
      } else {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            type: get(selectedType, "data", null),
            typeId: get(selectedType, "data.id", null)
          }
        }));
      }
    };
  }

  componentDidMount() {
    const { isNewRecord } = this.state;
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        isNewRecord
          ? T.translate("routeExceptions.form.title.create")
          : T.translate("routeExceptions.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
    this.loadAvailableTypes();
  }

  componentWillUnmount() {
    window.clearTimeout(this.fetchTimeout);
  }

  render() {
    const {
      redirectTo,
      isNewRecord,
      resource,
      hiddenPropertyNamesOnForm,
      selectedShipment,
      shipmentsSelectOptions,
      selectedType,
      typesSelectOptions
    } = this.state;
    const { history, location } = this.props;
    const isModal = location.state && location.state.modal;

    if (redirectTo) return <Redirect to={redirectTo} />;

    return (
      <Container className={isModal ? "" : "pt-3"}>
        <form onSubmit={event => this.handleSubmit(event)}>
          <Row>
            <Col md={12}>
              <div className="box">
                <div className="box-body">
                  {Object.keys(resource).map(propertyName => {
                    if (hiddenPropertyNamesOnForm.includes(propertyName)) {
                      return null;
                    }

                    if (propertyName === "shipmentId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("routeExceptions.fields.shipment")}
                          </Label>
                          <Select
                            name={propertyName}
                            value={selectedShipment}
                            onChange={this.handleChangeOnShipment}
                            options={shipmentsSelectOptions}
                            placeholder={T.translate(
                              resource.routeId
                                ? "defaults.placeholder.select"
                                : "routeExceptions.form.selectAnRoute"
                            )}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable={false}
                          />
                        </FormGroup>
                      );
                    }

                    if (propertyName === "typeId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("routeExceptions.fields.type")}
                          </Label>
                          <Select
                            name={propertyName}
                            value={selectedType}
                            onChange={this.handleChangeOnType}
                            options={typesSelectOptions}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable={false}
                          />
                        </FormGroup>
                      );
                    }

                    if (propertyName === "routeId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("routeExceptions.fields.route")}
                          </Label>
                          <Input
                            type="number"
                            name={propertyName}
                            value={resource[propertyName] || ""}
                            onChange={this.handleInputChange}
                            required
                          />
                        </FormGroup>
                      );
                    }

                    if (propertyName === "active") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `routeExceptions.fields.${propertyName}`
                            )}
                          </Label>
                          <select
                            name={propertyName}
                            value={resource[propertyName] || false}
                            onBlur={this.handleInputChange}
                            onChange={this.handleInputChange}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            className="form-control"
                          >
                            <option value>{T.translate("defaults.yes")}</option>
                            <option value={false}>
                              {T.translate("defaults.no")}
                            </option>
                          </select>
                        </FormGroup>
                      );
                    }

                    return (
                      <FormGroup key={propertyName}>
                        <Label>
                          {T.translate(
                            `routeExceptions.fields.${propertyName}`
                          )}
                        </Label>
                        <Input
                          type="text"
                          name={propertyName}
                          value={resource[propertyName] || ""}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                    );
                  })}
                </div>
              </div>
            </Col>
          </Row>
          <div className="clearfix text-center">
            <Button
              onClick={history.goBack}
              className="btn btn-rounded btn-lg btn-secondary float-md-left px-5"
            >
              {T.translate("defaults.goBack")}
            </Button>
            <Button
              size="lg"
              color="primary"
              className="btn-rounded float-md-right m-auto px-5"
              type="submit"
            >
              {isNewRecord
                ? T.translate("routeExceptions.form.createButton")
                : T.translate("routeExceptions.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

RouteExceptionForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

RouteExceptionForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(RouteExceptionForm));
