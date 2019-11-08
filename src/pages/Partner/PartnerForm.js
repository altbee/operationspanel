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

class PartnerForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "partners",
      resource: {
        name: "",
        username: "",
        password: "",
        email: "",
        website: "",
        phone: "",
        isActive: true,
        maxShipmentPartsAllowed: "0",
        maxShipmentPartWeight: "0",
        codIsCollect: false,
        codFee: "0",
        maxCodAmount: "0",
        extraPartFee: "0",
        extraWeightFee: "0",
        reschedulingFee: "0",
        returnsFee: "0",
        readdressingFee: "0",
        legacyApiKey: "",
        legacyApiSecret: "",
        codFeeTypeId: "1",
        typeId: "1",
        defaultShipmentTypeId: null
      },
      hiddenPropertyNamesOnForm: [
        "id",
        "createdAt",
        "updatedAt",
        "type",
        "codFeeType",
        "defaultShipmentType"
      ],
      selectedType: null,
      selectedFeeType: null,
      selectedShipmentType: null,
      typesSelectOptions: [],
      feeTypesSelectOptions: [],
      shipmentTypesSelectOptions: []
    };

    this.requiredFields = ["name"];

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
      const response = await this.API.put(`/${resourceNameOnApi}`, data);
      if (isNewRecord) {
        const { username, email, password } = data;
        await this.API.put("/users", {
          username,
          email,
          password,
          role: "partner",
          partnerId: response.data.id
        });
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
      const { resourceNameOnApi } = this.state;
      if (match.params.id) {
        this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
          params: {
            filter: {
              include: ["codFeeType", "defaultShipmentType", "type"]
            }
          }
        }).then(response => {
          this.setState({ resource: response.data }, async () => {
            await this.setState(prevState => ({
              isLoading: false,
              selectedType: prevState.resource.type
                ? this.buildTypesOptionFromTheResource(
                    prevState.resource.type,
                    "type"
                  )
                : null,
              selectedFeeType: prevState.resource.codFeeType
                ? this.buildTypesOptionFromTheResource(
                    prevState.resource.codFeeType,
                    "codFeeType"
                  )
                : null,
              selectedShipmentType: prevState.resource.defaultShipmentType
                ? this.buildTypesOptionFromTheResource(
                    prevState.resource.defaultShipmentType,
                    "defaultShipmentType"
                  )
                : null
            }));
          });
        });
      }
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param item
     * @param type
     * @return {{value: *, label: string, data: *}}
     */
    this.buildTypesOptionFromTheResource = (item, type) => {
      let translationPath;
      switch (type) {
        case "type":
          translationPath = `partners.fields.types.${item.name}`;
          break;

        case "codFeeType":
          translationPath = `partners.fields.codFeeTypes.${item.name}`;
          break;

        case "defaultShipmentType":
        default:
          translationPath = `shipments.fields.types.${item.name}`;
      }
      return {
        value: item ? item.id : "",
        label: item ? T.translate(translationPath) : "",
        data: item
      };
    };

    /**
     * Loads from API all available Partner types, to build up the select options in the form.
     */
    this.loadAvailableTypes = () => {
      this.API.get("/partnerTypes").then(response => {
        const typeOptions = [];
        response.data.forEach(item => {
          const typeOption = this.buildTypesOptionFromTheResource(item, "type");
          typeOptions.push(typeOption);
        });
        this.setState({
          typesSelectOptions: typeOptions
        });
      });
    };

    /**
     * Loads from API all available CoD Fee types, to build up the select options in the form.
     */
    this.loadAvailableFeeTypes = () => {
      this.API.get("/partnerFeeTypes").then(response => {
        const typeOptions = [];
        response.data.forEach(item => {
          const typeOption = this.buildTypesOptionFromTheResource(
            item,
            "codFeeType"
          );
          typeOptions.push(typeOption);
        });
        this.setState({
          feeTypesSelectOptions: typeOptions
        });
      });
    };

    /**
     * Loads from API all available Shipment types, to build up the select options in the form.
     */
    this.loadAvailableShipmentTypes = () => {
      this.API.get("/shipmentTypes").then(response => {
        const typeOptions = [];
        response.data.forEach(item => {
          const typeOption = this.buildTypesOptionFromTheResource(
            item,
            "defaultShipmentType"
          );
          typeOptions.push(typeOption);
        });
        this.setState({
          shipmentTypesSelectOptions: typeOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Partner Type
     * form field. Saves status to this component state.
     * @param selectedType
     */
    this.handleChangeOnType = selectedType => {
      this.setState(prevState => ({
        selectedType,
        resource: {
          ...prevState.resource,
          type: get(selectedType, "data", null),
          typeId: get(selectedType, "data.id", null)
        }
      }));
    };

    /**
     * Callback function to when user selects some value on CoD Fee type
     * form field. Saves status to this component state.
     * @param selectedFeeType
     */
    this.handleChangeOnFeeType = selectedFeeType => {
      this.setState(prevState => ({
        selectedFeeType,
        resource: {
          ...prevState.resource,
          codFeeType: get(selectedFeeType, "data", null),
          codFeeTypeId: get(selectedFeeType, "data.id", null)
        }
      }));
    };

    /**
     * Callback function to when user selects some value on Default Shipment
     * Type form field. Saves status to this component state.
     * @param selectedShipmentType
     */
    this.handleChangeOnShipmentType = selectedShipmentType => {
      this.setState(prevState => ({
        selectedShipmentType,
        resource: {
          ...prevState.resource,
          defaultShipmentType: get(selectedShipmentType, "data", null),
          defaultShipmentTypeId: get(selectedShipmentType, "data.id", null)
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
          ? T.translate("partners.form.title.create")
          : T.translate("partners.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
    this.loadAvailableTypes();
    this.loadAvailableFeeTypes();
    this.loadAvailableShipmentTypes();
  }

  render() {
    const {
      redirectTo,
      isNewRecord,
      resource,
      hiddenPropertyNamesOnForm,
      selectedType,
      selectedFeeType,
      selectedShipmentType,
      typesSelectOptions,
      feeTypesSelectOptions,
      shipmentTypesSelectOptions
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
                    if (hiddenPropertyNamesOnForm.includes(propertyName))
                      return null;

                    if (
                      [
                        "maxShipmentPartsAllowed",
                        "maxShipmentPartWeight",
                        "codFee",
                        "maxCodAmount",
                        "extraPartFee",
                        "extraWeightFee",
                        "reschedulingFee",
                        "returnsFee",
                        "readdressingFee"
                      ].includes(propertyName)
                    ) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`partners.fields.${propertyName}`)}
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            name={propertyName}
                            value={resource[propertyName]}
                            onChange={this.handleInputChange}
                          />
                        </FormGroup>
                      );
                    }

                    if (
                      ["username", "email", "password"].includes(propertyName)
                    ) {
                      if (!isNewRecord) return null;
                      const inputType =
                        propertyName === "username" ? "text" : propertyName;
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`users.fields.${propertyName}`) + " *"}
                          </Label>
                          <Input
                            type={inputType}
                            name={propertyName}
                            value={resource[propertyName] || ""}
                            onChange={this.handleInputChange}
                            required
                          />
                        </FormGroup>
                      );
                    }

                    if (["isActive", "codIsCollect"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`partners.fields.${propertyName}`)}
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

                    if (["typeId"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>{T.translate("partners.fields.type")}</Label>
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

                    if (["codFeeTypeId"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("partners.fields.codFeeType")}
                          </Label>
                          <Select
                            name={propertyName}
                            value={selectedFeeType}
                            onChange={this.handleChangeOnFeeType}
                            options={feeTypesSelectOptions}
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

                    if (["defaultShipmentTypeId"].includes(propertyName)) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("partners.fields.defaultShipmentType")}
                          </Label>
                          <Select
                            name={propertyName}
                            value={selectedShipmentType}
                            onChange={this.handleChangeOnShipmentType}
                            options={shipmentTypesSelectOptions}
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

                    return (
                      <FormGroup key={propertyName}>
                        <Label>
                          {T.translate(`partners.fields.${propertyName}`) +
                            (this.requiredFields.includes(propertyName)
                              ? " *"
                              : "")}
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
                ? T.translate("partners.form.createButton")
                : T.translate("partners.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

PartnerForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

PartnerForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(PartnerForm));
