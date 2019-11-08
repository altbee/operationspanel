import React, { Component } from "react";
import T from "i18n-react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import moment from "moment";
import { Redirect, withRouter } from "react-router-dom";
import Select from "react-select";
import get from "get-value";
import {
  Container,
  Row,
  Col,
  Button,
  FormGroup,
  Input,
  Label
} from "reactstrap";
import API from "../../components/API/API";
import { MapAutoComplete } from "../../components/Maps/MapAutoComplete";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";
import { SHIPMENT_STATUS } from "common/constants/models/shipment-status";
import { ROLE } from "common/constants/models/role";
import { hasRoles } from "../../components/Auth/AuthProvider";

import "react-datepicker/dist/react-datepicker.css";

class ShipmentForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = this.props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "shipments",
      resource: {
        trackingId: "",
        senderShipmentId: "",
        senderName: "",
        senderAddress: "",
        senderGeoPoint: {
          lat: 24.71682325993576,
          lng: 46.68241558359375
        },
        senderPhone: "",
        senderEmail: "",
        recipientName: "",
        recipientAddress: "",
        recipientGeoPoint: {
          lat: 24.71682325993576,
          lng: 46.68241558359375
        },
        recipientPhone: "",
        recipientEmail: "",
        pickupDatetime: null,
        deliveryDatetime: null,
        numberOfPackages: 0,
        cashToCollectOnDelivery: 0,
        recipientAddressConfirmed: false,
        recipientAddressConfirmationDatetime: null,
        routePickupOrder: 0,
        routeDeliveryOrder: 0,
        otpNumber: "",
        otpNumberIsNotMandatory: false,
        description: "",
        comment: "",
        shouldNotBeAutoAssigned: false,
        statusId: 0,
        partnerId: 0,
        senderAreaId: 0,
        recipientAreaId: 0,
        typeId: 0,
        cancellationReasonId: null,
        cancellationMessage: ""
      },
      hiddenPropertyNamesOnForm: [
        "id",
        "status",
        "createdAt",
        "updatedAt",
        "route",
        "routeId",
        "type",
        "recipientArea",
        "senderArea",
        "partner",
        "recipientAddressConfirmed",
        "recipientAddressConfirmationDatetime",
        "trackingId",
        "routeDeliveryOrder",
        "routePickupOrder",
        "recipientWasContacted",
        "senderWasContacted",
        "wasScannedBeforePickup",
        "wasScannedAfterContactingRecipient",
        "otpNumberWasConfirmed",
        "cancellationReason",
        "cancellationReasonId",
        "cancellationMessage",
        "unsuccessfulAttemptReason",
        "unsuccessfulAttemptReasonId"
      ],
      selectedSenderArea: null,
      selectedRecipientArea: null,
      selectedType: null,
      areaSelectOptions: [],
      typeSelectOptions: [],
      selectedStatus: null,
      statusSelectOptions: [],
      selectedReason: null,
      selectedUnsuccessfulReason: null,
      reasonSelectOptions: [],
      unsuccessfulReasonSelectOptions: [],
      selectedPickupDatetime: null,
      selectedDeliveryDatetime: null,
      geoPointDefaults: {
        senderGeoPoint: {
          lat: 24.71682325993576,
          lng: 46.68241558359375
        },
        recipientGeoPoint: {
          lat: 24.71682325993576,
          lng: 46.68241558359375
        }
      }
    };

    this.requiredFields = ["senderName", "recipientName", "recipientAddress"];

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
          if (
            ["numberOfPackages", "cashToCollectOnDelivery"].includes(name) &&
            value < 0
          ) {
            value = 0;
          }
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
     * Callback for when the location is updated
     * in MapAutoComplete component
     * @param property
     * @param location
     */
    this.handleLocationChange = (property, location) => {
      const { resource } = this.state;
      this.setState({
        resource: {
          ...resource,
          [property]: {
            lat: location.lat,
            lng: location.lng
          }
        }
      });
    };

    /**
     * Callback for when the address is updated
     * in MapAutoComplete component
     * @param property
     * @param address
     */
    this.handleAddressChange = (property, address) => {
      let addressProperty;
      switch (property) {
        case "senderGeoPoint":
          addressProperty = "senderAddress";
          break;

        case "recipientGeoPoint":
          addressProperty = "recipientAddress";
          break;

        default:
          return;
      }
      const { resource } = this.state;
      this.setState({
        resource: {
          ...resource,
          [addressProperty]: address
        }
      });
    };

    /**
     * Callback for when user submits the form.
     * It sends the data to database via API.  @param event
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

      try {
        const response = await this.API.put(`/${resourceNameOnApi}`, data);
        this.setState(prevState => ({
          redirectTo: `/${prevState.resourceNameOnApi}/details/${
            response.data.id
          }`
        }));
      } catch (err) {
        const { log } = console;
        log("err", err);
      }
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
              include: [
                "type",
                "status",
                "senderArea",
                "recipientArea",
                "partner",
                "cancellationReason",
                "unsuccessfulAttemptReason",
                { route: ["bundle"] }
              ]
            }
          }
        }).then(response => {
          this.setState({ resource: response.data }, () => {
            this.setState(prevState => ({
              isLoading: false,
              selectedStatus: prevState.resource.status
                ? this.buildStatusOptionFromTheResource(
                    prevState.resource.status
                  )
                : null,
              selectedReason: prevState.resource.cancellationReason
                ? this.buildReasonOptionFromTheResource(
                    prevState.resource.cancellationReason
                  )
                : null,
              selectedUnsuccessfulReason: prevState.resource
                .unsuccessfulAttemptReason
                ? this.buildReasonOptionFromTheResource(
                    prevState.resource.unsuccessfulAttemptReason
                  )
                : null,
              selectedType: prevState.resource.type
                ? this.buildTypeOptionFromTheResource(prevState.resource.type)
                : null,
              selectedSenderArea: prevState.resource.senderArea
                ? this.buildAreaOptionFromTheResource(
                    prevState.resource.senderArea
                  )
                : null,
              selectedRecipientArea: prevState.resource.recipientArea
                ? this.buildAreaOptionFromTheResource(
                    prevState.resource.recipientArea
                  )
                : null,
              selectedPartner: prevState.resource.partner
                ? this.buildPartnerOptionFromTheResource(
                    prevState.resource.partner
                  )
                : null,
              selectedPickupDatetime: prevState.resource.pickupDatetime
                ? moment(prevState.resource.pickupDatetime)
                : null,
              selectedDeliveryDatetime: prevState.resource.deliveryDatetime
                ? moment(prevState.resource.deliveryDatetime)
                : null
            }));
            const { resource, geoPointDefaults } = this.state;
            const { senderGeoPoint, recipientGeoPoint } = resource;
            if (senderGeoPoint && senderGeoPoint.lat && senderGeoPoint.lng) {
              geoPointDefaults.senderGeoPoint = senderGeoPoint;
            }
            if (
              recipientGeoPoint &&
              recipientGeoPoint.lat &&
              recipientGeoPoint.lng
            ) {
              geoPointDefaults.recipientGeoPoint = recipientGeoPoint;
            }
            this.setState({ geoPointDefaults });
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
      label: T.translate(`shipments.fields.statuses.${status.name}`),
      data: status
    });

    /**
     * Loads from API all available status, to build up the select options in the form.
     */
    this.loadAvailableStatuses = () => {
      this.API.get("/shipmentStatuses").then(response => {
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
     * Callback function to when user selects some value on Status
     * form field. Saves status to this component state.
     * @param selectedStatus
     */
    this.handleChangeOnStatus = selectedStatus => {
      const { resource } = this.state;
      let { selectedReason } = this.state;
      let { selectedUnsuccessfulReason } = this.state;

      if (selectedStatus.data.id !== SHIPMENT_STATUS.CANCELED.id) {
        resource.cancellationMessage = null;
        resource.cancellationReason = null;
        resource.cancellationReasonId = null;
        selectedReason = null;
      }

      if (
        selectedStatus.data.id !==
        SHIPMENT_STATUS.DELIVERY_ATTEMPT_UNSUCCESSFUL.id
      ) {
        resource.unsuccessfulAttemptReason = null;
        resource.unsuccessfulAttemptReasonId = null;
        selectedUnsuccessfulReason = null;
      }

      resource.status = get(selectedStatus, "data", null);
      resource.statusId = get(selectedStatus, "data.id", null);

      this.setState({
        selectedStatus,
        selectedReason,
        selectedUnsuccessfulReason,
        resource
      });
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param reason
     * @return {{value: *, label: string, data: *}}
     */
    this.buildReasonOptionFromTheResource = reason => ({
      value: reason.id,
      label: T.translate(`shipments.fields.cancellationReasons.${reason.name}`),
      data: reason
    });

    /**
     * Loads from API all available cancellation reasons, to build up
     * the select options in the form.
     */
    this.loadAvailableReasons = () => {
      this.API.get("/cancellationReasons").then(response => {
        const reasonOptions = [];
        response.data.forEach(item => {
          const reasonOption = this.buildReasonOptionFromTheResource(item);
          reasonOptions.push(reasonOption);
        });
        this.setState({
          reasonSelectOptions: reasonOptions
        });
      });
    };
    /**
     * Loads from API all available unsuccessful reasons, to build up
     * the select options in the form.
     */
    this.loadAvailableReasons = () => {
      this.API.get("/unsuccessfulAttemptReasons").then(response => {
        const unsuccessfulReasonOptions = [];
        response.data.forEach(item => {
          const reasonOption = this.buildReasonOptionFromTheResource(item);
          unsuccessfulReasonOptions.push(reasonOption);
        });
        this.setState({
          unsuccessfulReasonSelectOptions: unsuccessfulReasonOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Cancellation Reason
     * form field. Saves cancellation reason to this component state.
     * @param selectedReason
     */
    this.handleChangeOnReason = selectedReason => {
      this.setState(prevState => ({
        selectedReason,
        resource: {
          ...prevState.resource,
          cancellationReason: get(selectedReason, "data", null),
          cancellationReasonId: get(selectedReason, "data.id", null)
        }
      }));
    };

    /**
     * Callback function to when user selects some value on Unsuccessful Reason
     * form field. Saves unsuccessful reason to this component state.
     * @param selectedUnsuccessfulReason
     */
    this.handleChangeOnUnsuccessfulReason = selectedUnsuccessfulReason => {
      console.log(selectedUnsuccessfulReason);
      this.setState(prevState => ({
        selectedUnsuccessfulReason,
        resource: {
          ...prevState.resource,
          unsuccessfulAttemptReason: get(
            selectedUnsuccessfulReason,
            "data",
            null
          ),
          unsuccessfulAttemptReasonId: get(
            selectedUnsuccessfulReason,
            "data.id",
            null
          )
        }
      }));
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param type
     * @return {{value: *, label: string, data: *}}
     */
    this.buildTypeOptionFromTheResource = type => ({
      value: type.id,
      label: T.translate(`shipments.fields.types.${type.name}`),
      data: type
    });

    /**
     * Loads from API all available types, to build up the select options in the form.
     */
    this.loadAvailableTypes = () => {
      this.API.get("/shipmentTypes").then(response => {
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
     * Callback function to when user selects some value on Type
     * form field. Saves type to this component state.
     * @param {Object} selectedType
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

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param area
     * @return {{value: *, label: string, data: *}}
     */
    this.buildAreaOptionFromTheResource = area => ({
      value: area.id,
      label: area.name,
      data: area
    });

    /**
     * Loads from API all available areas, to build up the select options in the form.
     */
    this.loadAvailableAreas = () => {
      this.API.get("/areas").then(response => {
        const typeOptions = [];
        response.data.forEach(item => {
          const typeOption = this.buildAreaOptionFromTheResource(item);
          typeOptions.push(typeOption);
        });
        this.setState({
          areaSelectOptions: typeOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Sender Area
     * form field. Saves type to this component state.
     * @param selectedSenderArea
     */
    this.handleChangeOnSenderArea = selectedSenderArea => {
      this.setState({ selectedSenderArea });
      if (selectedSenderArea === null) {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            senderArea: null,
            senderAreaId: null
          }
        }));
      } else {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            senderArea: get(selectedSenderArea, "data", null),
            senderAreaId: get(selectedSenderArea, "data.id", null)
          }
        }));
      }
    };

    /**
     * Callback function to when user selects some value on Sender Area
     * form field. Saves type to this component state.
     * @param selectedRecipientArea
     */
    this.handleChangeOnRecipientArea = selectedRecipientArea => {
      this.setState({ selectedRecipientArea });
      if (selectedRecipientArea === null) {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            recipientArea: null,
            recipientAreaId: null
          }
        }));
      } else {
        this.setState(prevState => ({
          resource: {
            ...prevState.resource,
            recipientArea: get(selectedRecipientArea, "data", null),
            recipientAreaId: get(selectedRecipientArea, "data.id", null)
          }
        }));
      }
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param partner
     * @return {{value: *, label: string, data: *}}
     */
    this.buildPartnerOptionFromTheResource = partner => ({
      value: partner.id,
      label: partner.name,
      data: partner
    });

    /**
     * Loads from API all available partners, to build up the select options in the form.
     */
    this.loadAvailablePartners = () => {
      this.API.get("/partners").then(response => {
        const partnerOptions = [];
        response.data.forEach(item => {
          const partnerOption = this.buildPartnerOptionFromTheResource(item);
          partnerOptions.push(partnerOption);
        });
        this.setState({
          partnerSelectOptions: partnerOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Sender Area
     * form field. Saves type to this component state.
     * @param selectedRecipientArea
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
     * Callback function to when user selects the PickupDatetime.
     * @param {Date} date
     */
    this.handlePickupDatetimeChange = date => {
      this.setState(prevState => ({
        selectedPickupDatetime: date,
        resource: {
          ...prevState.resource,
          pickupDatetime: date
        }
      }));
    };

    /**
     * Callback function to when user selects the DeliveryDatetime.
     * @param {Date} date
     */
    this.handleDeliveryDatetimeChange = date => {
      this.setState(prevState => ({
        selectedDeliveryDatetime: date,
        resource: {
          ...prevState.resource,
          deliveryDatetime: date
        }
      }));
    };
  }

  async componentDidMount() {
    const { isNewRecord } = this.state;
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        isNewRecord
          ? T.translate("shipments.form.title.create")
          : T.translate("shipments.form.title.update")
      );
    }

    await this.loadResourceIfNeeded();
    this.loadAvailableStatuses();
    this.loadAvailableTypes();
    this.loadAvailableAreas();
    this.loadAvailablePartners();
    this.loadAvailableReasons();
  }

  render() {
    const {
      redirectTo,
      isNewRecord,
      resource,
      hiddenPropertyNamesOnForm,
      selectedType,
      typeSelectOptions,
      selectedStatus,
      statusSelectOptions,
      selectedReason,
      selectedUnsuccessfulReason,
      reasonSelectOptions,
      unsuccessfulReasonSelectOptions,
      geoPointDefaults,
      partnerSelectOptions,
      areaSelectOptions,
      selectedPartner,
      selectedSenderArea,
      selectedRecipientArea,
      selectedPickupDatetime,
      selectedDeliveryDatetime
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
                      ["numberOfPackages", "cashToCollectOnDelivery"].includes(
                        propertyName
                      )
                    ) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`shipments.fields.${propertyName}`)}
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            name={propertyName}
                            value={resource[propertyName] || ""}
                            onChange={this.handleInputChange}
                          />
                        </FormGroup>
                      );
                    }

                    if (propertyName === "typeId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>{T.translate("shipments.fields.type")}</Label>
                          <Select
                            name="form-field-name"
                            value={selectedType}
                            onChange={this.handleChangeOnType}
                            options={typeSelectOptions}
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

                    if (propertyName === "senderAreaId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("shipments.fields.senderArea")}
                          </Label>
                          <Select
                            name="form-field-name"
                            value={selectedSenderArea}
                            onChange={this.handleChangeOnSenderArea}
                            options={areaSelectOptions}
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

                    if (propertyName === "recipientAreaId") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate("shipments.fields.recipientArea")}
                          </Label>
                          <Select
                            name="form-field-name"
                            value={selectedRecipientArea}
                            onChange={this.handleChangeOnRecipientArea}
                            options={areaSelectOptions}
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
                      if (hasRoles(ROLE.ADMIN)) {
                        return (
                          <FormGroup key={propertyName}>
                            <Label>
                              {T.translate("shipments.fields.partner")}
                            </Label>
                            <Select
                              name="form-field-name"
                              value={selectedPartner}
                              onChange={this.handleChangeOnPartner}
                              options={partnerSelectOptions}
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

                      return "";
                    }

                    if (propertyName === "statusId") {
                      return (
                        <div key={propertyName}>
                          <FormGroup>
                            <Label>
                              {T.translate("shipments.fields.status")}
                            </Label>
                            <Select
                              name="form-field-name"
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
                          {selectedStatus &&
                            selectedStatus.data.id ===
                              SHIPMENT_STATUS.CANCELED.id && (
                              <div>
                                <FormGroup>
                                  <Label>
                                    {T.translate(
                                      "shipments.fields.cancellationReason"
                                    )}
                                    {" *"}
                                  </Label>
                                  <Select
                                    name="form-field-name"
                                    value={selectedReason}
                                    onChange={this.handleChangeOnReason}
                                    options={reasonSelectOptions}
                                    placeholder={T.translate(
                                      "defaults.placeholder.select"
                                    )}
                                    isClearable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <Label>
                                    {T.translate(
                                      "shipments.fields.cancellationMessage"
                                    )}
                                  </Label>
                                  <Input
                                    type="text"
                                    name="cancellationMessage"
                                    value={resource.cancellationMessage || ""}
                                    onChange={this.handleInputChange}
                                  />
                                </FormGroup>
                              </div>
                            )}
                          {selectedStatus &&
                            selectedStatus.data.id ===
                              SHIPMENT_STATUS.DELIVERY_ATTEMPT_UNSUCCESSFUL
                                .id && (
                              <div>
                                <FormGroup>
                                  <Label>
                                    {T.translate(
                                      "shipments.fields.unsuccessfulAttemptReason"
                                    )}
                                    {" *"}
                                  </Label>
                                  <Select
                                    name="form-field-name"
                                    value={selectedUnsuccessfulReason}
                                    onChange={
                                      this.handleChangeOnUnsuccessfulReason
                                    }
                                    options={unsuccessfulReasonSelectOptions}
                                    placeholder={T.translate(
                                      "defaults.placeholder.select"
                                    )}
                                    isClearable={false}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                  />
                                </FormGroup>
                              </div>
                            )}
                        </div>
                      );
                    }

                    if (
                      ["recipientGeoPoint", "senderGeoPoint"].includes(
                        propertyName
                      )
                    ) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(
                              `shipments.fields.${propertyName}.lat`
                            )}
                          </Label>
                          <MapAutoComplete
                            key={`${propertyName}_marker`}
                            placeholder={T.translate(
                              "defaults.placeholder.mapAutoComplete"
                            )}
                            defaultPosition={geoPointDefaults[propertyName]}
                            containerHeight="200px"
                            onLocationUpdate={location => {
                              this.handleLocationChange(propertyName, location);
                            }}
                            onAddressUpdate={address => {
                              this.handleAddressChange(propertyName, address);
                            }}
                          />
                        </FormGroup>
                      );
                    }

                    if (
                      [
                        "recipientAddressConfirmed",
                        "recipientWasContacted",
                        "senderWasContacted",
                        "wasScannedBeforePickup",
                        "wasScannedAfterContactingRecipient",
                        "otpNumberWasConfirmed",
                        "otpNumberIsNotMandatory",
                        "shouldNotBeAutoAssigned"
                      ].includes(propertyName)
                    ) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`shipments.fields.${propertyName}`)}
                          </Label>
                          <select
                            name={propertyName}
                            value={resource[propertyName] || ""}
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

                    if (propertyName === "pickupDatetime") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`shipments.fields.${propertyName}`)}
                          </Label>
                          <DatePicker
                            selected={selectedPickupDatetime}
                            onChange={this.handlePickupDatetimeChange}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="LLL"
                            className="form-control"
                          />
                        </FormGroup>
                      );
                    }

                    if (propertyName === "deliveryDatetime") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`shipments.fields.${propertyName}`)}
                          </Label>
                          <DatePicker
                            selected={selectedDeliveryDatetime}
                            onChange={this.handleDeliveryDatetimeChange}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="LLL"
                            className="form-control"
                          />
                        </FormGroup>
                      );
                    }

                    if (
                      ["recipientEmail", "senderEmail"].includes(propertyName)
                    ) {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`shipments.fields.${propertyName}`)}
                          </Label>
                          <Input
                            type="email"
                            name={propertyName}
                            value={resource[propertyName] || ""}
                            onChange={this.handleInputChange}
                            required={this.requiredFields.includes(
                              propertyName
                            )}
                          />
                        </FormGroup>
                      );
                    }

                    if (propertyName === "comment") {
                      return (
                        <FormGroup key={propertyName}>
                          <Label>
                            {T.translate(`shipments.fields.${propertyName}`)}
                          </Label>
                          <Input
                            type="textarea"
                            name={propertyName}
                            value={resource[propertyName] || ""}
                            placeholder={T.translate("defaults.notSet")}
                            onChange={this.handleInputChange}
                          />
                        </FormGroup>
                      );
                    }

                    return (
                      <FormGroup key={propertyName}>
                        <Label>
                          {T.translate(`shipments.fields.${propertyName}`) +
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
              onClick={event => this.handleSubmit(event)}
            >
              {isNewRecord
                ? T.translate("shipments.form.createButton")
                : T.translate("shipments.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

ShipmentForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

ShipmentForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(ShipmentForm));
