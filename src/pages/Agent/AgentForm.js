import React, { Component } from "react";
import PropTypes from "prop-types";
import { Redirect, withRouter } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Button
} from "reactstrap";
import Select from "react-select";
import T from "i18n-react";
import get from "get-value";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class AgentForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "agents",
      resource: {
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        status: {},
        type: {},
        fleetOwner: {}
      },
      nameInvalid: false,
      usernameInvalid: false,
      selectedStatus: null,
      statusSelectOptions: [],
      selectedType: null,
      typeSelectOptions: [],
      selectedFleetOwner: null,
      fleetOwnerSelectOptions: []
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
      const { resourceNameOnApi, isNewRecord } = this.state;

      if (!data.name || data.name.length < 3) {
        alert(T.translate("agents.fields.invalidNameLength"));
        return;
      }

      const responseFromAgentNameCount = await this.API.get("/agents/count", {
        params: {
          where: { name: data.name }
        }
      });

      if (get(responseFromAgentNameCount, "data.count", 0)) {
        alert(T.translate("agents.fields.nameAlreadyInUse"));
        return;
      }

      let response;

      if (isNewRecord) {
        const { username, email, password } = data;

        if (!username || username.length < 3) {
          alert(T.translate("agents.fields.invalidUsernameLength"));
          return;
        }

        const responseFromUsernameCount = await this.API.get("/users/count", {
          params: {
            where: { username }
          }
        });

        if (get(responseFromUsernameCount, "data.count", 0)) {
          alert(T.translate("agents.fields.usernameAlreadyInUse"));
          return;
        }

        const responseFromUserEmailCount = await this.API.get("/users/count", {
          params: {
            where: { email }
          }
        });

        if (get(responseFromUserEmailCount, "data.count", 0)) {
          alert(T.translate("agents.fields.emailAlreadyInUse"));
          return;
        }

        response = await this.API.put(`/${resourceNameOnApi}`, data);

        await this.API.put("/users", {
          username,
          email,
          password,
          role: "agent",
          agentId: response.data.id
        });
      } else {
        response = await this.API.put(`/${resourceNameOnApi}`, data);
      }

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
      if (match.params.id) {
        const { resourceNameOnApi } = this.state;
        this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
          params: {
            filter: {
              include: ["status", "type", "fleetOwner"]
            }
          }
        }).then(response => {
          this.setState({ resource: response.data }, () => {
            this.setState(prevState => ({
              isLoading: false,
              selectedStatus: this.buildStatusOptionFromTheResource(
                prevState.resource.status
              ),
              selectedType: this.buildTypeOptionFromTheResource(
                prevState.resource.type
              )
            }));
            const { resource } = this.state;
            if (resource.fleetOwner) {
              const ownerResource = resource.fleetOwner;
              this.setState({
                selectedFleetOwner: this.buildOwnerOptionFromTheResource(
                  ownerResource
                )
              });
            }
          });
        });
      }
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param status
     * @return {{value: *, label: string, data: *}}
     */
    this.buildStatusOptionFromTheResource = status => ({
      value: status.id,
      label: T.translate(`agents.fields.statuses.${status.name}`),
      data: status
    });

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param type
     * @return {{value: *, label: string, data: *}}
     */
    this.buildTypeOptionFromTheResource = type => ({
      value: type.id,
      label: T.translate(`agents.fields.types.${type.name}`),
      data: type
    });

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param fleetOwner
     * @return {{value: *, label: string, data: *}}
     */
    this.buildOwnerOptionFromTheResource = fleetOwner => ({
      value: fleetOwner.id,
      label: fleetOwner.name,
      data: fleetOwner
    });

    /**
     * Loads from API all available status, to build up the select options in the form.
     */
    this.loadAvailableStatuses = () => {
      this.API.get("/agentStatuses").then(response => {
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
     * Loads from API all available types, to build up the select options in the form.
     */
    this.loadAvailableTypes = () => {
      this.API.get("/agentTypes").then(response => {
        const typeOptions = [];
        response.data.forEach(item => {
          const typeOption = this.buildTypeOptionFromTheResource(item);
          typeOptions.push(typeOption);
        });
        this.setState({
          typeSelectOptions: typeOptions
        });
      });
    };

    /**
     * Loads from API all available fleet owners, to build up the select options in the form.
     */
    this.loadAvailableFleetOwners = () => {
      this.API.get("/fleetOwners").then(response => {
        const fleetOwnerOptions = [];
        response.data.forEach(item => {
          const fleetOwnerOption = this.buildOwnerOptionFromTheResource(item);
          fleetOwnerOptions.push(fleetOwnerOption);
        });
        this.setState({
          fleetOwnerSelectOptions: fleetOwnerOptions
        });
      });
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
     * Callback function to when user selects some value on Type
     * form field. Saves type to this component state.
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
     * Callback function to when user selects some value on Fleet Owner
     * form field. Saves fleet owner to this component state.
     * @param selectedFleetOwner
     */
    this.handleChangeOnFleetOwner = selectedFleetOwner => {
      this.setState(prevState => ({
        selectedFleetOwner,
        resource: {
          ...prevState.resource,
          fleetOwner: get(selectedFleetOwner, "data", null),
          fleetOwnerId: get(selectedFleetOwner, "data.id", null)
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
          ? T.translate("agents.form.title.create")
          : T.translate("agents.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
    this.loadAvailableStatuses();
    this.loadAvailableTypes();
    this.loadAvailableFleetOwners();
  }

  render() {
    const {
      redirectTo,
      isNewRecord,
      resource,
      selectedStatus,
      statusSelectOptions,
      selectedType,
      typeSelectOptions,
      selectedFleetOwner,
      fleetOwnerSelectOptions
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
                  <Row>
                    <Col md={8}>
                      <FormGroup>
                        <Label>
                          {T.translate("agents.fields.name") + " *"}
                        </Label>
                        <Input
                          type="text"
                          name="name"
                          value={resource.name || ""}
                          onChange={this.handleInputChange}
                          required
                          valid={(resource.name || "").length >= 3}
                          invalid={(resource.name || "").length < 3}
                        />
                        <FormFeedback>
                          {T.translate("agents.fields.invalidNameLength")}
                        </FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>{T.translate("agents.fields.phone")}</Label>
                        <Input
                          type="text"
                          name="phone"
                          value={resource.phone || ""}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  {isNewRecord && (
                    <div>
                      <Row>
                        <Col md={6}>
                          <FormGroup>
                            <Label>
                              {T.translate("users.fields.username") + " *"}
                            </Label>
                            <Input
                              type="text"
                              name="username"
                              value={resource.username || ""}
                              onChange={this.handleInputChange}
                              required
                              valid={(resource.username || "").length >= 3}
                              invalid={(resource.username || "").length < 3}
                            />
                            <FormFeedback>
                              {T.translate(
                                "agents.fields.invalidUsernameLength"
                              )}
                            </FormFeedback>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label>
                              {T.translate("users.fields.password") + " *"}
                            </Label>
                            <Input
                              type="password"
                              name="password"
                              value={resource.password || ""}
                              onChange={this.handleInputChange}
                              required
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <FormGroup>
                        <Label>
                          {T.translate("users.fields.email") + " *"}
                        </Label>
                        <Input
                          type="email"
                          name="email"
                          value={resource.email || ""}
                          onChange={this.handleInputChange}
                          required
                        />
                      </FormGroup>
                    </div>
                  )}
                  <FormGroup>
                    <Label>{T.translate("agents.fields.status")}</Label>
                    <Select
                      name="status"
                      value={selectedStatus}
                      onChange={this.handleChangeOnStatus}
                      options={statusSelectOptions}
                      placeholder={T.translate("defaults.placeholder.select")}
                      isClearable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>{T.translate("agents.fields.type")}</Label>
                    <Select
                      name="selectedType"
                      value={selectedType}
                      onChange={this.handleChangeOnType}
                      options={typeSelectOptions}
                      placeholder={T.translate("defaults.placeholder.select")}
                      isClearable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>{T.translate("agents.fields.fleetOwner")}</Label>
                    <Select
                      name="fleetOwner"
                      value={selectedFleetOwner}
                      onChange={this.handleChangeOnFleetOwner}
                      options={fleetOwnerSelectOptions}
                      placeholder={T.translate("defaults.placeholder.select")}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                    />
                  </FormGroup>
                  <Row>
                    <Col md={4}>
                      <FormGroup>
                        <Label>
                          {T.translate(
                            "agents.fields.agreedMinimumWorkingHours"
                          )}
                        </Label>
                        <Input
                          type="number"
                          name="agreedMinimumWorkingHours"
                          value={resource.agreedMinimumWorkingHours || ""}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>
                          {T.translate("agents.fields.agreedMinimumShipments")}
                        </Label>
                        <Input
                          type="number"
                          name="agreedMinimumShipments"
                          value={resource.agreedMinimumShipments || ""}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>
                          {T.translate("agents.fields.agreedMinimumPayment")}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          name="agreedMinimumPayment"
                          value={resource.agreedMinimumPayment || ""}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
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
                ? T.translate("agents.form.createButton")
                : T.translate("agents.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

AgentForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

AgentForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(AgentForm));
