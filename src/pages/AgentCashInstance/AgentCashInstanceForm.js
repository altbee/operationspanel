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

class AgentCashInstanceForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "agentCashInstances",
      resource: {
        amount: "0",
        dueDatetime: null,
        isSettled: false,
        settledAt: null,
        typeId: "",
        agentId: ""
      },
      hiddenPropertyNamesOnForm: [
        "id",
        "createdAt",
        "updatedAt",
        "agent",
        "type"
      ],
      selectedType: null,
      selectedAgent: null,
      typesSelectOptions: [],
      agentsSelectOptions: [],
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
      if (match.params.id) {
        const { resourceNameOnApi } = this.state;
        this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
          params: {
            filter: {
              include: ["agent", "type"]
            }
          }
        }).then(response => {
          this.setState({ resource: response.data }, () => {
            this.setState(prevState => ({
              isLoading: false,
              selectedType: this.buildOptionFromTheResource(
                prevState.resource.type,
                "agentCashInstances.fields.types"
              ),
              dueDatetime: prevState.resource.dueDatetime
                ? moment(prevState.resource.dueDatetime)
                : null,
              settledAt: prevState.resource.settledAt
                ? moment(prevState.resource.settledAt)
                : null
            }));
            const { resource } = this.state;
            if (resource.agent) {
              this.setState(prevState => ({
                selectedAgent: this.buildOptionFromTheResource(
                  prevState.resource.agent
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
      value: type.id,
      label: translation
        ? T.translate(`${translation}.${type.name}`)
        : type.name,
      data: type
    });

    /**
     * Loads from API all available cash types, to build up the select options in the form.
     */
    this.loadAvailableTypes = () => {
      this.API.get("/agentCashTypes").then(response => {
        const typeOptions = [];
        response.data.forEach(item => {
          const option = this.buildOptionFromTheResource(
            item,
            "agentCashInstances.fields.types"
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
          resource: { ...prevState.resource, agent: null, agentId: null }
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
  }

  componentDidMount() {
    const { isNewRecord } = this.state;
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        isNewRecord
          ? T.translate("agentCashInstances.form.title.create")
          : T.translate("agentCashInstances.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
    this.loadAvailableTypes();
    this.loadAvailableAgents();
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
                    if (propertyName === "amount") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `agentCashInstances.fields.${propertyName}`
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
                              `agentCashInstances.fields.${propertyName}`
                            )}
                          </Label>
                          <DatePicker
                            selected={dueDatetime}
                            onChange={this.handleDueDateTimeChange}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="LLL"
                            className="form-control"
                          />
                        </FormGroup>
                      );
                    }
                    if (propertyName === "settledAt") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `agentCashInstances.fields.${propertyName}`
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
                              `agentCashInstances.fields.${propertyName}`
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
                            {T.translate("agentCashInstances.fields.type")}
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
                    if (propertyName === "agentId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("agentCashInstances.fields.agent")}
                          </Label>
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
                          />
                        </FormGroup>
                      );
                    }

                    return (
                      <FormGroup key={propertyName}>
                        <Label>
                          {T.translate(
                            `agentCashInstances.fields.${propertyName}`
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
                ? T.translate("agentCashInstances.form.createButton")
                : T.translate("agentCashInstances.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

AgentCashInstanceForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

AgentCashInstanceForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(AgentCashInstanceForm));
