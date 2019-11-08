import React, { Component } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import moment from "moment";
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

class PartnerDiscountForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = this.props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "partnerDiscounts",
      resource: {
        code: "",
        isActive: true,
        startDatetime: "",
        endDatetime: "",
        count: "1",
        rate: "0",
        partnerId: null,
        feeTypeId: null
      },
      hiddenPropertyNamesOnForm: [
        "id",
        "createdAt",
        "updatedAt",
        "partner",
        "feeType"
      ],
      selectedPartner: null,
      selectedType: null,
      partnersSelectOptions: [],
      typesSelectOptions: [],
      startDatetime: null,
      endDatetime: null
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
              include: ["partner", "feeType"]
            }
          }
        }).then(response => {
          this.setState({ resource: response.data }, () => {
            this.setState(prevState => ({
              isLoading: false,
              selectedType: this.buildOptionFromTheResource(
                prevState.resource.feeType,
                "partnerDiscounts.fields.feeTypes"
              ),
              startDatetime: prevState.resource.startDatetime
                ? moment(prevState.resource.startDatetime)
                : null,
              endDatetime: prevState.resource.endDatetime
                ? moment(prevState.resource.endDatetime)
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
          });
        });
      }
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param resource
     * @param translation
     * @return {{value: *, label: string, data: *}}
     */
    this.buildOptionFromTheResource = (resource, translation) => {
      let option = {
        value: "",
        label: "",
        data: resource
      };
      if (resource) {
        option = {
          value: resource.id,
          label: translation
            ? T.translate(`${translation}.${resource.name}`)
            : resource.name,
          data: resource
        };
      }
      return option;
    };

    /**
     * Loads from API all available types, to build up the select options in the form.
     */
    this.loadAvailableTypes = () => {
      this.API.get("/partnerFeeTypes").then(response => {
        const typeOptions = [];
        response.data.forEach(item => {
          const statusOption = this.buildOptionFromTheResource(
            item,
            "partnerDiscounts.fields.feeTypes"
          );
          typeOptions.push(statusOption);
        });
        this.setState({
          typesSelectOptions: typeOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Status
     * form field. Saves status to this component state.
     * @param selectedType
     */
    this.handleChangeOnType = selectedType => {
      this.setState(prevState => ({
        selectedType,
        resource: {
          ...prevState.resource,
          feeType: get(selectedType, "data", null)
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
          ? T.translate("partnerDiscounts.form.title.create")
          : T.translate("partnerDiscounts.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
    this.loadAvailableTypes();
    this.loadAvailablePartners();
  }

  render() {
    const {
      redirectTo,
      isNewRecord,
      resource,
      hiddenPropertyNamesOnForm,
      selectedType,
      typesSelectOptions,
      selectedPartner,
      partnersSelectOptions,
      startDatetime,
      endDatetime
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
                    if (["count", "rate"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `partnerDiscounts.fields.${propertyName}`
                            )}
                          </Label>
                          <Input
                            type="number"
                            name={propertyName}
                            value={resource[propertyName]}
                            onChange={this.handleInputChange}
                          />
                        </FormGroup>
                      );
                    }
                    if (propertyName === "isActive") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `partnerDiscounts.fields.${propertyName}`
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
                    if (["feeTypeId"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("partnerDiscounts.fields.feeType")}
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
                    if (["partnerId"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("partnerDiscounts.fields.partner")}
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
                    if (propertyName === "startDatetime") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `partnerDiscounts.fields.${propertyName}`
                            ) + " *"}
                          </Label>
                          <DatePicker
                            selected={startDatetime}
                            onChange={this.handleStartDateChange}
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
                    if (propertyName === "endDatetime") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `partnerDiscounts.fields.${propertyName}`
                            ) + " *"}
                          </Label>
                          <DatePicker
                            selected={endDatetime}
                            onChange={this.handleEndDateChange}
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

                    return (
                      <FormGroup key={propertyName}>
                        <Label>
                          {T.translate(
                            `partnerDiscounts.fields.${propertyName}`
                          ) + " *"}
                        </Label>
                        <Input
                          type="text"
                          name={propertyName}
                          value={resource[propertyName] || ""}
                          onChange={this.handleInputChange}
                          required
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
                ? T.translate("partnerDiscounts.form.createButton")
                : T.translate("partnerCashInstances.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

PartnerDiscountForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

PartnerDiscountForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(PartnerDiscountForm));
