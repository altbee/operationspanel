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
  Button
} from "reactstrap";
import Select from "react-select";
import T from "i18n-react";
import get from "get-value";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class UserForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = this.props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "users",
      resource: {
        username: "",
        email: "",
        password: "",
        role: "",
        partnerId: null,
        agentId: null
      },
      selectedPartner: null,
      partnersSelectOptions: [],
      selectedAgent: null,
      agentsSelectOptions: [],
      hiddenPropertyNamesOnForm: [
        "id",
        "createdAt",
        "updatedAt",
        "realm",
        "emailVerified",
        "roles",
        "partnerId",
        "partner",
        "agentId",
        "agent"
      ]
    };

    this.roles = [
      "admin",
      "operationsTeamMember",
      "accountant",
      "agent",
      "partner"
    ];

    this.requiredFields = ["email", "password", "username"];

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
      const resource = data;
      if (resource.password === "") {
        delete resource.password;
      }
      const { resourceNameOnApi } = this.state;
      const response = await this.API.patch(`/${resourceNameOnApi}`, resource);
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
              include: ["partner", "agent"]
            }
          }
        }).then(response => {
          this.setState(
            {
              resource: {
                ...response.data,
                password: "",
                role: response.data.roles[0] ? response.data.roles[0].name : ""
              }
            },
            () => {
              const { resource } = this.state;

              if (resource.partner) {
                this.setState(prevState => ({
                  selectedPartner: this.buildOptionFromTheResource(
                    prevState.resource.partner
                  )
                }));
              }

              if (resource.agent) {
                this.setState(prevState => ({
                  selectedAgent: this.buildOptionFromTheResource(
                    prevState.resource.agent
                  )
                }));
              }
            }
          );
        });
      }
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param type
     * @param translation
     * @return {{value: *, label: string, data: *}}
     */
    this.buildOptionFromTheResource = (type, translation) => ({
      value: type.id,
      label: translation
        ? T.translate(`${translation}.${type.name}`)
        : type.name,
      data: type
    });

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
     * Loads from API all available agents, to build up the select options in the form.
     */
    this.loadAvailableAgents = () => {
      this.API.get("/agents").then(response => {
        const agentOptions = [];
        response.data.forEach(item => {
          const option = this.buildOptionFromTheResource(item);
          agentOptions.push(option);
        });
        this.setState({
          agentsSelectOptions: agentOptions
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
            agentId: null
          }
        }));
      } else {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            agent: get(selectedAgent, "data", null),
            agentId: get(selectedAgent, "data.id", null)
          }
        }));
      }
    };

    /**
     * Callback function to when user selects some value on Role
     * form field. Saves status to this component state.
     * If Role chosen is not "Partner", sets partnerId to null.
     * @param event
     */
    this.handleChangeOnRole = event => {
      const { target } = event;
      const { name } = target;
      const { value } = target;

      if (value !== "partner") {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            partnerId: null,
            partner: null,
            [name]: value
          }
        }));
      } else if (value !== "agent") {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            agentId: null,
            agent: null,
            [name]: value
          }
        }));
      } else {
        this.setState(prevState => ({
          resource: { ...prevState.resource, [name]: value }
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
          ? T.translate("users.form.title.create")
          : T.translate("users.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
    this.loadAvailablePartners();
    this.loadAvailableAgents();
  }

  render() {
    const {
      redirectTo,
      isNewRecord,
      resource,
      hiddenPropertyNamesOnForm,
      selectedPartner,
      partnersSelectOptions,
      selectedAgent,
      agentsSelectOptions
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
                    if (["email"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`users.fields.${propertyName}`) + " *"}
                          </Label>
                          <Input
                            type={propertyName}
                            name={propertyName}
                            value={resource[propertyName]}
                            onChange={this.handleInputChange}
                            required
                          />
                        </FormGroup>
                      );
                    }
                    if (["password"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`users.fields.${propertyName}`) + " *"}
                          </Label>
                          <Input
                            type={propertyName}
                            name={propertyName}
                            value={resource[propertyName]}
                            onChange={this.handleInputChange}
                            placeholder="Leave in blank to keep the current password"
                            required
                          />
                        </FormGroup>
                      );
                    }
                    if (["role"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`users.fields.${propertyName}`)}
                          </Label>
                          <select
                            name={propertyName}
                            value={resource[propertyName]}
                            onBlur={this.handleChangeOnRole}
                            onChange={this.handleChangeOnRole}
                            placeholder={T.translate(
                              "defaults.placeholder.select"
                            )}
                            className="form-control"
                          >
                            {this.roles.map(role => (
                              <option key={role} value={role}>
                                {T.translate(`users.fields.roleList.${role}`)}
                              </option>
                            ))}
                          </select>
                        </FormGroup>
                      );
                    }

                    return (
                      <FormGroup key={propertyName}>
                        <Label>
                          {T.translate(`users.fields.${propertyName}`) + " *"}
                        </Label>
                        <Input
                          type="text"
                          name={propertyName}
                          value={resource[propertyName] || ""}
                          onChange={this.handleInputChange}
                          required={this.requiredFields.includes(propertyName)}
                        />
                      </FormGroup>
                    );
                  })}
                  {resource.role === "partner" && (
                    <FormGroup key="partnerId">
                      <Label>{T.translate("users.fields.partner")}</Label>
                      <Select
                        name="partnerId"
                        value={selectedPartner}
                        onChange={this.handleChangeOnPartner}
                        options={partnersSelectOptions}
                        placeholder={T.translate("defaults.placeholder.select")}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </FormGroup>
                  )}
                  {resource.role === "agent" && (
                    <FormGroup key="agentId">
                      <Label>{T.translate("users.fields.agent")}</Label>
                      <Select
                        name="agentId"
                        value={selectedAgent}
                        onChange={this.handleChangeOnAgent}
                        options={agentsSelectOptions}
                        placeholder={T.translate("defaults.placeholder.select")}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </FormGroup>
                  )}
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
                ? T.translate("users.form.createButton")
                : T.translate("users.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

UserForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

UserForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(UserForm));
