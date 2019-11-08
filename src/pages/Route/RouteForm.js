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
import { ROUTE_STATUS, ROUTE_BUNDLE } from "common/constants/models";
import Select from "react-select";
import get from "get-value";

import "react-datepicker/dist/react-datepicker.css";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class RouteForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = this.props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "routes",
      resource: {
        agentId: null,
        status: ROUTE_STATUS.CREATED,
        bundle: ROUTE_BUNDLE.MIX,
        value: null,
        isOffered: false
      },
      errors: {},
      hiddenPropertyNamesOnForm: [
        "id",
        "createdAt",
        "updatedAt",
        "agent",
        "bundleId",
        "statusId",
        "agentCashInstanceId",
        "totalCoD",
        "totalShipments",
        "totalIgnoredShipments"
      ],
      selectedAgent: null,
      agentsSelectOptions: [],
      selectedStatus: null,
      statusSelectOptions: [],
      selectedBundle: null,
      bundlesSelectOptions: []
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

    this.handleValidation = () => {
      let errors = {};
      let formIsValid = true;

      //Bundle
      if (!this.state.selectedBundle) {
        formIsValid = false;
        errors["bundle"] = "Cannot be empty";
      }
      this.setState({ errors: errors }, function() {});
      return formIsValid;
    };

    /**
     * Callback for when user submits the form.
     * It sends the data to database via API.
     * @param event
     */
    this.handleSubmit = event => {
      event.preventDefault();
      const { resource } = this.state;
      if (this.handleValidation()) this.save(resource);
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
              include: ["agent", "status", "bundle"]
            }
          }
        }).then(response => {
          this.setState({ resource: response.data }, () => {
            this.setState(prevState => ({
              isLoading: false,
              selectedAgent: this.buildAgentOptionFromTheResource(
                prevState.resource.agent
              ),
              selectedStatus: this.buildStatusOptionFromTheResource(
                prevState.resource.status
              ),
              selectedBundle: this.buildBundleOptionFromTheResource(
                prevState.resource.bundle
              ),
              startDatetime: prevState.resource.startDatetime
                ? moment(prevState.resource.startDatetime)
                : null,
              endDatetime: prevState.resource.endDatetime
                ? moment(prevState.resource.endDatetime)
                : null
            }));
            const { resource } = this.state;
            if (resource.agent) {
              this.setState(prevState => ({
                selectedAgent: this.buildAgentOptionFromTheResource(
                  prevState.resource.agent
                )
              }));
            }
          });
        });
      }
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param type
     * @return {{value: *, label: string, data: *}}
     */
    this.buildAgentOptionFromTheResource = type => ({
      value: type ? type.id : "",
      label: type ? type.name : "",
      data: type
    });

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param status
     * @return {{value: *, label: string, data: *}}
     */
    this.buildStatusOptionFromTheResource = status => ({
      value: status ? status.id : "",
      label: status ? status.name : "",
      data: status
    });

    /**
     * Returns the bundle option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param bundle
     * @return {{value: *, label: string, data: *}}
     */
    this.buildBundleOptionFromTheResource = bundle => ({
      value: bundle ? bundle.id : "",
      label: bundle ? bundle.name : "",
      data: bundle
    });

    /**
     * Loads from API all available agents, to build up the select options in the form.
     */
    this.loadAvailableAgents = () => {
      this.API.get("/agents").then(response => {
        const agentOptions = [];
        response.data.forEach(item => {
          const option = this.buildAgentOptionFromTheResource(item);
          agentOptions.push(option);
        });
        this.setState({
          agentsSelectOptions: agentOptions
        });
      });
    };

    /**
     * Loads from API all available status, to build up the select options in the form.
     */
    this.loadAvailableStatuses = () => {
      this.API.get("/routeStatuses").then(response => {
        const statusOptions = [];
        response.data.forEach(item => {
          const statusOption = this.buildStatusOptionFromTheResource(item);
          statusOptions.push(statusOption);
        });
        this.setState({
          statusSelectOptions: statusOptions
        });
      });
    };

    /**
     * Loads from API all available bundles, to build up the select options in the form.
     */
    this.loadAvailableBundles = () => {
      this.API.get("/routeBundles").then(response => {
        const bundleOptions = [];
        response.data.forEach(item => {
          const bundleOption = this.buildBundleOptionFromTheResource(item);
          bundleOptions.push(bundleOption);
        });
        this.setState({
          bundlesSelectOptions: bundleOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Agent
     * form field. Saves status to this component state.
     * @param selectedAgent
     */
    this.handleChangeOnAgent = selectedAgent => {
      this.setState({ selectedAgent });
      if (selectedAgent === null) {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            agent: null,
            agentId: null,
            status: ROUTE_STATUS.CREATED
          }
        }));
      } else {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            agent: get(selectedAgent, "data", null),
            agentId: get(selectedAgent, "data.id", null),
            status: ROUTE_STATUS.ASSIGNED
          }
        }));
      }
    };

    /**
     * Callback function to when user selects some value on Status
     * form field. Saves status to this component state.
     * @param selectedStatus
     */
    this.handleChangeOnStatus = selectedStatus => {
      this.setState(prevState => ({
        selectedStatus,
        resource: {
          ...prevState.resource,
          status: get(selectedStatus, "data", null)
        }
      }));
    };

    /**
     * Callback function to when user selects some value on Bundle
     * form field. Saves bundle to this component state.
     * @param selectedBundle
     */
    this.handleChangeOnBundle = selectedBundle => {
      this.setState({ errors: {} });
      this.setState(prevState => ({
        selectedBundle,
        resource: {
          ...prevState.resource,
          bundle: get(selectedBundle, "data", null)
        }
      }));
    };

    /**
     * Callback function to when user selects a start date time.
     * Saves date to this component state inside an resource's
     * attribute.
     * @param date
     */
    this.handleStartDateChange = date => {
      this.setState(prevState => ({
        startDatetime: date,
        resource: {
          ...prevState.resource,
          startDatetime: date
        }
      }));
    };

    /**
     * Callback function to when user selects a end date time.
     * Saves date to this component state inside an resource's
     * attribute.
     * @param date
     */
    this.handleEndDateChange = date => {
      this.setState(prevState => ({
        endDatetime: date,
        resource: {
          ...prevState.resource,
          endDatetime: date
        }
      }));
    };
  }

  componentDidMount() {
    const { isNewRecord } = this.state;
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        isNewRecord
          ? T.translate("routes.form.title.create")
          : T.translate("routes.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
    this.loadAvailableAgents();
    this.loadAvailableStatuses();
    this.loadAvailableBundles();
  }

  render() {
    const {
      redirectTo,
      isNewRecord,
      resource,
      hiddenPropertyNamesOnForm,
      selectedAgent,
      agentsSelectOptions,
      selectedStatus,
      statusSelectOptions,
      selectedBundle,
      bundlesSelectOptions
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

                    if (
                      ["startDatetime", "endDatetime"].includes(propertyName)
                    ) {
                      return null;
                    }

                    if (propertyName === "agentId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>{T.translate("routes.fields.agent")}</Label>
                          <Select
                            name={propertyName}
                            value={selectedAgent}
                            onChange={this.handleChangeOnAgent}
                            options={agentsSelectOptions}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                          />
                        </FormGroup>
                      );
                    }

                    if (propertyName === "status") {
                      if (isNewRecord) return null;

                      return (
                        <FormGroup key={propertyName}>
                          <Label>{T.translate("routes.fields.status")}</Label>
                          <Select
                            name={propertyName}
                            value={selectedStatus}
                            onChange={this.handleChangeOnStatus}
                            options={statusSelectOptions}
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

                    if (propertyName === "bundle") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>{T.translate("routes.fields.bundle")}</Label>
                          <Select
                            name={propertyName}
                            value={selectedBundle}
                            onChange={this.handleChangeOnBundle}
                            options={bundlesSelectOptions}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            required
                            isClearable={false}
                            className={`react-select-container ${
                              this.state.errors["bundle"]
                                ? "select-validation"
                                : ""
                            }`}
                            classNamePrefix="react-select"
                          />
                          <span className="text-validation">
                            {this.state.errors["bundle"]}
                          </span>
                        </FormGroup>
                      );
                    }

                    if (propertyName === "value") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`routes.fields.${propertyName}`)}
                          </Label>
                          <Input
                            type="number"
                            name={propertyName}
                            value={resource[propertyName] || ""}
                            placeholder="(Optional)"
                            onChange={this.handleInputChange}
                          />
                        </FormGroup>
                      );
                    }

                    if (propertyName === "isOffered") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`routes.fields.${propertyName}`)}
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
                          {T.translate(`routes.fields.${propertyName}`)}
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
                ? T.translate("routes.form.createButton")
                : T.translate("routes.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

RouteForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

RouteForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(RouteForm));
