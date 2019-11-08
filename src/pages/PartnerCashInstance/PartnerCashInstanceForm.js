import React, { Component } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import moment from "moment/moment";
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
import Select from "react-select";
import T from "i18n-react";
import get from "get-value";

import "react-datepicker/dist/react-datepicker.css";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class PartnerCashInstanceForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = this.props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "partnerCashInstances",
      resource: {
        amount: "0",
        dueDatetime: null,
        isSettled: false,
        settledAt: null,
        shipmentId: "",
        directionId: "",
        typeId: "",
        partnerId: ""
      },
      hiddenPropertyNamesOnForm: [
        "id",
        "createdAt",
        "updatedAt",
        "partner",
        "type",
        "direction",
        "shipment"
      ],
      selectedType: null,
      selectedDirection: null,
      selectedPartner: null,
      selectedShipment: null,
      typesSelectOptions: [],
      directionsSelectOptions: [],
      partnersSelectOptions: [],
      shipmentsSelectOptions: [],
      dueDatetime: null,
      settledAt: null
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

      this.setState(prevState => ({
        resource: { ...prevState.resource, [name]: value }
      }));
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
              include: ["partner", "type", "direction", "shipment"]
            }
          }
        }).then(response => {
          this.setState({ resource: response.data }, () => {
            this.setState(prevState => ({
              isLoading: false,
              selectedType: this.buildOptionFromTheResource(
                prevState.resource.type,
                "partnerCashInstances.fields.types"
              ),
              selectedDirection: this.buildOptionFromTheResource(
                prevState.resource.direction,
                "partnerCashInstances.fields.directions"
              ),
              dueDatetime: prevState.resource.dueDatetime
                ? moment(prevState.resource.dueDatetime)
                : null,
              settledAt: prevState.resource.settledAt
                ? moment(prevState.resource.settledAt)
                : null
            }));
            const { resource } = this.state;
            if (resource.partner) {
              this.setState(prevState => ({
                selectedPartner: this.buildOptionFromTheResource(
                  prevState.resource.partner
                )
              }));
            }
            if (resource.shipment) {
              this.setState(prevState => ({
                selectedShipment: this.buildShipmentOptionFromTheResource(
                  prevState.resource.shipment
                )
              }));
            }
          });
        });
      }
    };

    /**
     * Callback function to when user selects a due date time.
     * Saves date to this component state inside an resource's
     * attribute.
     * @param date
     */
    this.handleDueDateTimeChange = date => {
      this.setState(prevState => ({
        dueDatetime: date,
        resource: { ...prevState.resource, dueDatetime: date }
      }));
    };

    /**
     * Callback function to when user selects a settled at date.
     * Saves date to this component state inside an resource's
     * attribute.
     * @param date
     */
    this.handleSettledAtDateChange = date => {
      this.setState(prevState => ({
        settledAt: date,
        resource: { ...prevState.resource, settledAt: date }
      }));
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param type
     * @param translation
     * @return {{value: *, label: string, data: *}}
     */
    this.buildOptionFromTheResource = (type, translation) => ({
      value: get(type, "id", ""),
      label: translation
        ? T.translate(`${translation}.${type.name}`)
        : get(type, "name", ""),
      data: type
    });

    /**
     * Loads from API all available cash types, to build up the select options in the form.
     */
    this.loadAvailableTypes = () => {
      this.API.get("/partnerCashTypes").then(response => {
        const typeOptions = [];
        response.data.forEach(item => {
          const option = this.buildOptionFromTheResource(
            item,
            "partnerCashInstances.fields.types"
          );
          typeOptions.push(option);
        });
        this.setState({
          typesSelectOptions: typeOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Cash Type
     * form field. Saves status to this component state.
     * @param selectedType
     */
    this.handleChangeOnType = selectedType => {
      this.setState(prevState => ({
        selectedType,
        resource: {
          ...prevState.resource,
          type: get(selectedType, "data", null)
        }
      }));
    };

    /**
     * Loads from API all available direction types, to build up the select options in the form.
     */
    this.loadAvailableDirections = () => {
      this.API.get("/partnerCashDirections").then(response => {
        const directionOptions = [];
        response.data.forEach(item => {
          const option = this.buildOptionFromTheResource(
            item,
            "partnerCashInstances.fields.directions"
          );
          directionOptions.push(option);
        });
        this.setState({
          directionsSelectOptions: directionOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Cash Direction
     * form field. Saves status to this component state.
     * @param selectedDirection
     */
    this.handleChangeOnDirection = selectedDirection => {
      this.setState(prevState => ({
        selectedDirection,
        resource: {
          ...prevState.resource,
          direction: get(selectedDirection, "data", null)
        }
      }));
    };

    /**
     * Loads from API all available partners, to build up the select options in the form.
     */
    this.loadAvailablePartners = () => {
      this.API.get("/partners").then(response => {
        const partnerOptions = [];
        response.data.forEach(item => {
          const option = this.buildOptionFromTheResource(item);
          partnerOptions.push(option);
        });
        this.setState({
          partnersSelectOptions: partnerOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Partner
     * form field. Saves status to this component state.
     * @param selectedPartner
     */
    this.handleChangeOnPartner = selectedPartner => {
      this.setState({ selectedPartner });
      if (selectedPartner === null) {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            partner: null,
            partnerId: null
          }
        }));
      } else {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            partner: get(selectedPartner, "data", null),
            partnerId: get(selectedPartner, "data.id", null)
          }
        }));
      }
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the shipment resource retrieved from database.
     * @param type
     * @return {{value: *, label: string, data: *}}
     */
    this.buildShipmentOptionFromTheResource = type => ({
      value: type.id,
      label: type.trackingId,
      data: type
    });

    /**
     * Loads from API all available shipments, to build up the select options in the form.
     */
    this.loadAvailableShipments = () => {
      this.API.get("/shipments").then(response => {
        const shipmentOptions = [];
        response.data.forEach(item => {
          const option = this.buildShipmentOptionFromTheResource(item);
          shipmentOptions.push(option);
        });
        this.setState({
          shipmentsSelectOptions: shipmentOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Shipment
     * form field. Saves status to this component state.
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
  }

  componentDidMount() {
    const { isNewRecord } = this.state;
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        isNewRecord
          ? T.translate("partnerCashInstances.form.title.create")
          : T.translate("partnerCashInstances.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
    this.loadAvailableTypes();
    this.loadAvailableDirections();
    this.loadAvailablePartners();
    this.loadAvailableShipments();
  }

  render() {
    const {
      redirectTo,
      isNewRecord,
      resource,
      hiddenPropertyNamesOnForm,
      dueDatetime,
      settledAt,
      selectedType,
      typesSelectOptions,
      selectedDirection,
      directionsSelectOptions,
      selectedPartner,
      partnersSelectOptions,
      selectedShipment,
      shipmentsSelectOptions
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
                    if (propertyName === "amount") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `partnerCashInstances.fields.${propertyName}`
                            ) + " *"}
                          </Label>
                          <Input
                            type="number"
                            name={propertyName}
                            value={resource[propertyName]}
                            onChange={this.handleInputChange}
                            required
                          />
                        </FormGroup>
                      );
                    }
                    if (propertyName === "dueDatetime") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `partnerCashInstances.fields.${propertyName}`
                            ) + " *"}
                          </Label>
                          <DatePicker
                            selected={dueDatetime}
                            onChange={this.handleDueDateTimeChange}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="LLL"
                            className="form-control"
                            required
                          />
                        </FormGroup>
                      );
                    }
                    if (propertyName === "settledAt") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `partnerCashInstances.fields.${propertyName}`
                            )}
                          </Label>
                          <DatePicker
                            selected={settledAt}
                            onChange={this.handleSettledAtDateChange}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="LLL"
                            className="form-control"
                          />
                        </FormGroup>
                      );
                    }
                    if (propertyName === "isSettled") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `partnerCashInstances.fields.${propertyName}`
                            )}
                          </Label>
                          <select
                            name={propertyName}
                            value={resource[propertyName]}
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
                    if (propertyName === "typeId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("partnerCashInstances.fields.type")}
                          </Label>
                          <Select
                            name={propertyName}
                            value={selectedType}
                            onChange={this.handleChangeOnType}
                            options={typesSelectOptions}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            isClearable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        </FormGroup>
                      );
                    }
                    if (propertyName === "directionId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              "partnerCashInstances.fields.direction"
                            )}
                          </Label>
                          <Select
                            name={propertyName}
                            value={selectedDirection}
                            onChange={this.handleChangeOnDirection}
                            options={directionsSelectOptions}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            isClearable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        </FormGroup>
                      );
                    }
                    if (propertyName === "partnerId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("partnerCashInstances.fields.partner")}
                          </Label>
                          <Select
                            name={propertyName}
                            value={selectedPartner}
                            onChange={this.handleChangeOnPartner}
                            options={partnersSelectOptions}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        </FormGroup>
                      );
                    }
                    if (propertyName === "shipmentId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              "partnerCashInstances.fields.shipment"
                            )}
                          </Label>
                          <Select
                            name={propertyName}
                            value={selectedShipment}
                            onChange={this.handleChangeOnShipment}
                            options={shipmentsSelectOptions}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        </FormGroup>
                      );
                    }

                    return (
                      <FormGroup key={propertyName}>
                        <Label>
                          {T.translate(
                            `partnerCashInstances.fields.${propertyName}`
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
                ? T.translate("partnerCashInstances.form.createButton")
                : T.translate("partnerCashInstances.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

PartnerCashInstanceForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

PartnerCashInstanceForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(PartnerCashInstanceForm));
