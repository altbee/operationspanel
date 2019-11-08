import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import moment from "moment";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  UncontrolledTooltip,
  Input
} from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import ReactToPrint from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import T from "i18n-react";
import QRCode from "qrcode.react";
import Barcode from "react-barcode";
import { SHIPMENT_STATUS } from "common/constants/models/shipment-status";
import { AGENT_CASH_TYPE } from "common/constants/models/agent-cash-type";

import API from "../../components/API/API";
import { MapWithMarkers } from "../../components/Maps/MapWithMarkers";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class ShipmentDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "shipments",
      resource: {},
      printViewHide: true,
      allCashInstances: []
    };

    /**
     * Callback for when user input some data on form fields.
     * It saves the data in their component state.
     * @param event
     */
    this.handleInputChange = event => {
      const { target } = event;
      const { name, value } = target;

      this.setState(prevState => ({
        resource: { ...prevState.resource, [name]: value }
      }));
    };

    /**
     * Callback for when user submits the form.
     * It sends the data to database via API to update the record.
     * @param event
     */
    this.update = async event => {
      event.preventDefault();
      const { resource, resourceNameOnApi } = this.state;
      const { id } = resource;
      try {
        const response = await this.API.patch(
          `/${resourceNameOnApi}/${id}`,
          resource
        );
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

    this.printableView = () => {
      const { resource } = this.state;

      const renderValue = value => (value ? value : "");

      return (
        <div ref={el => (this.componentRef = el)} className="print-view white">
          <section className="print-view shipment-label">
            <div className="print-view print-header">
              <div className="print-view qr">
                {resource.trackingId && (
                  <QRCode
                    value={resource.trackingId}
                    renderAs="svg"
                    size={150}
                  />
                )}
                <p>Shipment #{resource.senderShipmentId}</p>
              </div>
              <div className="print-view barcode">
                {resource.trackingId && (
                  <Barcode
                    value={resource.trackingId}
                    height={50}
                    fontSize={15}
                  />
                )}
              </div>
              <div className="print-view logo">
                <img src="/img/logo.png" alt="Jak" />
              </div>
            </div>

            <table className="print-view heading">
              <tr>
                <th>Origin</th>
                <th>Quantity</th>
                <th>Package Type</th>
              </tr>
              <tr>
                <td>{renderValue(resource.senderAddress)}</td>
                <td>{resource.numberOfPackages}</td>
                <td>{renderValue(resource.type ? resource.type.name : "")}</td>
              </tr>
              <tr>
                <th>Destination</th>
                <th>COD</th>
                <th>Area/Zone</th>
              </tr>
              <tr>
                <td>{renderValue(resource.recipientAddress)}</td>
                <td>SAR {resource.cashToCollectOnDelivery}</td>
                <td>
                  {renderValue(
                    resource.recipientArea ? resource.recipientArea.name : ""
                  )}
                </td>
              </tr>
            </table>

            <table className="print-view sender">
              <tr>
                <th>Sender Name:</th>
                <td>{renderValue(resource.senderName)}</td>
              </tr>
              <tr>
                <th>Sender Phone No:</th>
                <td>{renderValue(resource.senderPhone)}</td>
              </tr>
              <tr>
                <th>Sender Address:</th>
                <td>{renderValue(resource.senderAddress)}</td>
              </tr>
              <tr>
                <th>Sender Email:</th>
                <td>{renderValue(resource.senderEmail)}</td>
              </tr>
            </table>

            <hr />

            <table className="print-view customer">
              <tr>
                <th>Customer Name:</th>
                <td>{renderValue(resource.recipientName)}</td>
              </tr>
              <tr>
                <th>Customer Mobile No:</th>
                <td>{renderValue(resource.recipientPhone)}</td>
              </tr>
              <tr>
                <th>Customer Email:</th>
                <td>{renderValue(resource.recipientEmail)}</td>
              </tr>
              <tr>
                <th>Customer Address:</th>
                <td>{renderValue(resource.recipientAddress)}</td>
              </tr>
              <tr>
                <th>Customer Address 2:</th>
                <td />
              </tr>
            </table>

            <hr />

            <table className="print-view extra-info">
              <tr>
                <th>Item Description:</th>
                <td>{renderValue(resource.description)}</td>
              </tr>
              <tr>
                <th>Item Comment:</th>
                <td>{renderValue(resource.comment)}</td>
              </tr>
              <tr>
                <th>Collector Name:</th>
                <td>
                  {renderValue(resource.agent ? resource.agent.name : "")}
                </td>
              </tr>
              <tr>
                <th>Collector Mobile No:</th>
                <td>
                  {renderValue(resource.agent ? resource.agent.phone : "")}
                </td>
              </tr>
            </table>

            <div className="print-view generated-by-jak" />
          </section>
        </div>
      );
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("shipments.detail.title"),
        T.translate("shipments.detail.description")
      );
      header.setActions([
        <Button
          onClick={() => this.setState({ printViewHide: false })}
          className="btn btn-secondary btn-rounded px-3"
        >
          <FontAwesomeIcon icon="print" />{" "}
          {T.translate("shipments.detail.printButton")}
        </Button>
      ]);
    }

    const { resourceNameOnApi } = this.state;
    const { match } = this.props;
    this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
      params: {
        filter: {
          include: [
            "type",
            "status",
            "partner",
            "senderArea",
            "recipientArea",
            "partner",
            "cancellationReason",
            "unsuccessfulAttemptReason",
            { route: ["agent"] },
            { events: ["status", "agent", "route", "user"] },
            { exceptions: ["type", "route"] },
            { cashInstances: ["type", "direction", "partner"] },
            { agentCashInstances: ["type", "agent"] }
          ]
        }
      }
    }).then(response => {
      this.setState(
        {
          resource: response.data
        },
        () => {
          this.API.get(
            `/${resourceNameOnApi}/${match.params.id}/otp-number`
          ).then(otpResponse => {
            this.setState(prevState => ({
              resource: {
                ...prevState.resource,
                otpNumber: otpResponse.data
              }
            }));
          });
          let cashInstanceArray = [];
          response.data.cashInstances.forEach(item => {
            cashInstanceArray.push(item);
          });
          response.data.agentCashInstances.forEach(item => {
            cashInstanceArray.push(item);
          });
          this.setState({ allCashInstances: cashInstanceArray });
        }
      );
    });
  }

  render() {
    const agentCashDirection = typeId => {
      const types = Object.keys(AGENT_CASH_TYPE);
      const isCredit =
        types
          .map(key => AGENT_CASH_TYPE[key])
          .filter(item => item.id === typeId && item.isProfitForCompany)
          .length === 1;
      return isCredit ? "Credit" : "Debit";
    };

    const {
      resourceNameOnApi,
      resource,
      printViewHide,
      allCashInstances
    } = this.state;
    const { history, location } = this.props;
    const isModal = location.state && location.state.modal;

    const renderValue = value =>
      value ? value : T.translate("defaults.notSet");
    if (printViewHide) {
      return (
        <Container className={isModal ? "" : "pt-3"}>
          <Row>
            <Col md={8}>
              {/* Shipment Information */}
              <div className="box pb-1">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("shipments.detail.shipmentInformation")}
                  </h2>
                </div>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <th>{T.translate("shipments.fields.trackingId")}</th>
                      <td>{renderValue(resource.trackingId)}</td>
                    </tr>
                    <tr>
                      <th>
                        {T.translate("shipments.fields.senderShipmentId")}
                      </th>
                      <td>{renderValue(resource.senderShipmentId)}</td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.type")}</th>
                      <td>
                        {resource.type
                          ? T.translate(
                              `shipments.fields.types.${resource.type.name}`
                            )
                          : T.translate("defaults.notSet")}
                      </td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.otpNumber")}</th>
                      <td>
                        {renderValue(resource.otpNumber)}{" "}
                        {!resource.otpNumberIsNotMandatory && (
                          <span className="label rounded primary">
                            {T.translate("shipments.detail.mandatory")}
                          </span>
                        )}
                      </td>
                    </tr>
                    {resource.statusId === SHIPMENT_STATUS.CANCELED.id && [
                      <tr key="cancellationReason">
                        <th>
                          {T.translate("shipments.fields.cancellationReason")}
                        </th>
                        <td>
                          {resource.type
                            ? T.translate(
                                `shipments.fields.cancellationReasons.${
                                  resource.cancellationReason.name
                                }`
                              )
                            : T.translate("defaults.notSet")}
                        </td>
                      </tr>,
                      <tr key="cancellationMessage">
                        <th>
                          {T.translate("shipments.fields.cancellationMessage")}
                        </th>
                        <td>{renderValue(resource.cancellationMessage)}</td>
                      </tr>
                    ]}
                    {resource.statusId ===
                      SHIPMENT_STATUS.DELIVERY_ATTEMPT_UNSUCCESSFUL.id && (
                      <tr>
                        <th>
                          {T.translate(
                            "shipments.fields.unsuccessfulAttemptReason"
                          )}
                        </th>
                        <td>
                          {resource.type
                            ? T.translate(
                                `shipments.fields.unsuccessfulAttemptReasons.${
                                  resource.unsuccessfulAttemptReason.name
                                }`
                              )
                            : T.translate("defaults.notSet")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <hr />
                <Row className="px-2">
                  <Col md={6}>
                    <FontAwesomeIcon
                      fixedWidth
                      icon="box-open"
                      className="text-warning h1 float-left m-2 mr-3"
                    />
                    <label className="d-block m-0 text-muted">
                      {T.translate("shipments.fields.numberOfPackages")}
                    </label>
                    <span className="d-block h3 m-0">
                      {resource.numberOfPackages}
                    </span>
                  </Col>
                  <Col md={6}>
                    <FontAwesomeIcon
                      fixedWidth
                      icon="money-bill-wave"
                      className="text-success h1 float-left m-2 mr-3"
                    />
                    <label className="d-block m-0 text-muted">
                      {T.translate("shipments.fields.cashToCollectOnDelivery")}
                    </label>
                    <span className="d-block h3 m-0">
                      {resource.cashToCollectOnDelivery}
                    </span>
                  </Col>
                </Row>
                <hr />
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <th>{T.translate("shipments.fields.description")}</th>
                      <td>{renderValue(resource.description)}</td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.comment")}</th>
                      <td className="d-block d-sm-flex text-right">
                        <Input
                          type="textarea"
                          name="comment"
                          value={resource.comment || ""}
                          placeholder={T.translate("defaults.notSet")}
                          onChange={this.handleInputChange}
                        />
                        <Button color="primary" onClick={this.update}>
                          {T.translate("shipments.detail.saveButton")}
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <hr />
                <Table borderless size="sm">
                  <tbody>
                    {[
                      "createdAt",
                      "updatedAt",
                      "pickupDatetime",
                      "deliveryDatetime"
                    ].map(property => (
                      <tr key={`shipments.fields.${property}`}>
                        <th>{T.translate(`shipments.fields.${property}`)}</th>
                        <td>
                          {resource[property] ? (
                            <Moment date={resource[property]} />
                          ) : (
                            T.translate("defaults.notSet")
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>

            <Col md={4}>
              {/* QR Code */}
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("shipments.detail.qrCode")}
                  </h2>
                </div>
                <div className="box-body pt-0 text-center">
                  {resource.trackingId && (
                    <QRCode
                      value={resource.trackingId}
                      renderAs="svg"
                      size={180}
                    />
                  )}
                </div>
              </div>

              {/* Statuses */}
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("shipments.detail.statuses")}
                  </h2>
                </div>
                <div className="box-body pt-0">
                  <div className="streamline sl-no-after b-l">
                    {[
                      "senderWasContacted",
                      "wasScannedBeforePickup",
                      "recipientWasContacted",
                      "recipientAddressConfirmed",
                      "wasScannedAfterContactingRecipient",
                      "otpNumberWasConfirmed"
                    ].map(property => {
                      return (
                        <div
                          key={`shipments.fields.${property}`}
                          className={`sl-item ${
                            resource[property] ? "b-success" : ""
                          }`}
                        >
                          {resource[property] && (
                            <div className="sl-icon text-light">
                              <FontAwesomeIcon
                                icon="check"
                                fixedWidth
                                color="white"
                              />
                            </div>
                          )}
                          <div className="sl-content">
                            <p
                              className={`mb-0 ${
                                resource[property] ? "" : "text-muted"
                              }`}
                            >
                              {T.translate(`shipments.fields.${property}`)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {/* Sender Information */}
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("shipments.detail.senderInformation")}
                  </h2>
                </div>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <th>{T.translate("shipments.fields.senderName")}</th>
                      <td>{renderValue(resource.senderName)}</td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.senderPhone")}</th>
                      <td>{renderValue(resource.senderPhone)}</td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.senderEmail")}</th>
                      <td>
                        {resource.senderEmail ? (
                          <a href={`mailto:${resource.senderEmail}`}>
                            {resource.senderEmail}
                          </a>
                        ) : (
                          T.translate("defaults.notSet")
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.senderArea")}</th>
                      <td>
                        {resource.senderArea ? (
                          <Link to={`/areas/details/${resource.senderArea.id}`}>
                            {renderValue(resource.senderArea.name)}
                          </Link>
                        ) : (
                          T.translate("defaults.notSet")
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.senderAddress")}</th>
                      <td>{renderValue(resource.senderAddress)}</td>
                    </tr>
                    {resource.senderAddress && resource.senderGeoPoint && (
                      <tr>
                        <td colSpan="2">
                          <MapWithMarkers
                            mapProps={{
                              defaultCenter: {
                                lat: resource.senderGeoPoint.lat,
                                lng: resource.senderGeoPoint.lng
                              },
                              defaultOptions: {
                                zoom: 15,
                                scrollwheel: false,
                                zoomControl: true
                              }
                            }}
                            containerHeight="150px"
                            markers={[
                              {
                                position: {
                                  lat: resource.senderGeoPoint.lat,
                                  lng: resource.senderGeoPoint.lng
                                }
                              }
                            ]}
                            autoCenter={false}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>

            <Col md={6}>
              {/* Recipient Information */}
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("shipments.detail.recipientInformation")}
                  </h2>
                </div>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <th>{T.translate("shipments.fields.recipientName")}</th>
                      <td>{renderValue(resource.recipientName)}</td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.recipientPhone")}</th>
                      <td>{renderValue(resource.recipientPhone)}</td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.recipientEmail")}</th>
                      <td>
                        {resource.recipientEmail ? (
                          <a href={`mailto:${resource.recipientEmail}`}>
                            {resource.recipientEmail}
                          </a>
                        ) : (
                          T.translate("defaults.notSet")
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>{T.translate("shipments.fields.recipientArea")}</th>
                      <td>
                        {resource.recipientArea ? (
                          <Link
                            to={`/areas/details/${resource.recipientArea.id}`}
                          >
                            {resource.recipientArea.name}
                          </Link>
                        ) : (
                          T.translate("defaults.notSet")
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>
                        {T.translate("shipments.fields.recipientAddress")}
                      </th>
                      <td>
                        {resource.recipientAddress}{" "}
                        <FontAwesomeIcon
                          id="recipientAddressConfirmed"
                          className={`float-right ${
                            resource.recipientAddressConfirmed
                              ? "text-success"
                              : "text-danger"
                          }`}
                          icon={
                            resource.recipientAddressConfirmed
                              ? "check"
                              : "times"
                          }
                          fixedWidth
                        />
                        <UncontrolledTooltip
                          placement="left"
                          target="recipientAddressConfirmed"
                        >
                          {resource.recipientAddressConfirmed
                            ? T.translate(
                                "shipments.detail.recipientAddressConfirmed",
                                {
                                  date: moment(
                                    resource.recipientAddressConfirmationDatetime
                                  )
                                }
                              )
                            : T.translate(
                                "shipments.detail.recipientAddressNotConfirmed"
                              )}
                        </UncontrolledTooltip>
                      </td>
                    </tr>
                    {resource.recipientAddress && resource.recipientGeoPoint && (
                      <tr>
                        <td colSpan="2">
                          <MapWithMarkers
                            mapProps={{
                              defaultCenter: {
                                lat: resource.recipientGeoPoint.lat,
                                lng: resource.recipientGeoPoint.lng
                              },
                              defaultOptions: {
                                zoom: 15,
                                scrollwheel: false,
                                zoomControl: true
                              }
                            }}
                            containerHeight="150px"
                            markers={[
                              {
                                position: {
                                  lat: resource.recipientGeoPoint.lat,
                                  lng: resource.recipientGeoPoint.lng
                                }
                              }
                            ]}
                            autoCenter={false}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              {/* Route Information */}
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("shipments.detail.routeInformation")}
                  </h2>
                </div>
                <Container>
                  <Row>
                    <Col md={8}>
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <th className="pl-0">
                              {T.translate(
                                "shipments.fields.shouldNotBeAutoAssigned"
                              )}
                            </th>
                            <td>
                              {T.translate(
                                `defaults.${
                                  resource.recipientName ? "yes" : "no"
                                }`
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th className="pl-0">
                              {T.translate("shipments.fields.partner")}
                            </th>
                            <td>
                              {resource.partner
                                ? resource.partner.name
                                : T.translate("defaults.notSet")}
                            </td>
                          </tr>
                          <tr>
                            <th className="pl-0">
                              {T.translate("shipments.fields.routePickupOrder")}
                            </th>
                            <td>
                              {resource.routePickupOrder
                                ? resource.routePickupOrder.toString()
                                : T.translate("defaults.notSet")}
                            </td>
                          </tr>
                          <tr>
                            <th className="pl-0">
                              {T.translate(
                                "shipments.fields.routeDeliveryOrder"
                              )}
                            </th>
                            <td>
                              {resource.routeDeliveryOrder
                                ? resource.routeDeliveryOrder.toString()
                                : T.translate("defaults.notSet")}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={4} className="py-3">
                      {resource.route && (
                        <Link
                          to={`/routes/details/${resource.route.id}`}
                          className="btn btn-block btn-primary btn-lg btn-rounded"
                        >
                          <FontAwesomeIcon
                            fixedWidth
                            icon="route"
                            className="mr-3"
                          />
                          {T.translate("shipments.detail.viewRoute")}
                        </Link>
                      )}
                      {resource.partner && (
                        <Link
                          to={`/partners/details/${resource.partner.id}`}
                          className="btn btn-block btn-primary btn-lg btn-rounded"
                        >
                          <FontAwesomeIcon
                            fixedWidth
                            icon="user-friends"
                            className="mr-3"
                          />
                          {T.translate("shipments.detail.viewPartner")}
                        </Link>
                      )}
                    </Col>
                  </Row>
                </Container>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {resource.id && (
                <div className="box">
                  <div className="box-header">
                    <h2 className="text-secondary">
                      {T.translate("shipments.detail.events.title")}
                    </h2>
                    <small>
                      {T.translate("shipments.detail.events.description")}
                    </small>
                  </div>
                  <div>
                    <Table striped hover className="mb-0">
                      <tbody>
                        {resource.events.map(item => (
                          <tr key={item.id}>
                            <td>
                              {item.statusId
                                ? T.translate(
                                    "shipments.detail.events.itemTextStatus",
                                    {
                                      statusName: item.status.name,
                                      createdAt: moment(item.createdAt).format(
                                        "lll"
                                      )
                                    }
                                  )
                                : item.agentId && item.agentId !== 0
                                ? T.translate(
                                    "shipments.detail.events.itemTextAgent",
                                    {
                                      agentName: item.agent.name,
                                      agentId: item.agent.id,
                                      createdAt: moment(item.createdAt).format(
                                        "lll"
                                      )
                                    }
                                  )
                                : item.agentId === 0
                                ? T.translate(
                                    "shipments.detail.events.itemTextNoAgent",
                                    {
                                      createdAt: moment(item.createdAt).format(
                                        "lll"
                                      )
                                    }
                                  )
                                : item.routeId &&
                                  item.routeWasAdded &&
                                  item.userId
                                ? T.translate(
                                    "shipments.detail.events.itemTextAddedToRoute",
                                    {
                                      userName: item.user.username,
                                      routeId: item.route.id,
                                      createdAt: moment(item.createdAt).format(
                                        "lll"
                                      )
                                    }
                                  )
                                : item.routeId &&
                                  item.routeWasAdded &&
                                  !item.userId
                                ? T.translate(
                                    "shipments.detail.events.itemTextAddedToRouteNoUser",
                                    {
                                      routeId: item.route.id,
                                      createdAt: moment(item.createdAt).format(
                                        "lll"
                                      )
                                    }
                                  )
                                : item.routeId &&
                                  !item.routeWasAdded &&
                                  item.userId
                                ? T.translate(
                                    "shipments.detail.events.itemTextRemovedFromRoute",
                                    {
                                      userName: item.user.username,
                                      routeId: item.route.id,
                                      createdAt: moment(item.createdAt).format(
                                        "lll"
                                      )
                                    }
                                  )
                                : ""}
                            </td>
                          </tr>
                        ))}
                        {resource.events && resource.events.length === 0 && (
                          <tr>
                            <td>
                              <em className="text-muted">
                                {T.translate("shipments.detail.events.empty")}
                              </em>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
              {resource.id && (
                <div className="box">
                  <div className="box-header">
                    <h2 className="text-secondary">
                      {T.translate("shipments.detail.exceptions.title")}
                    </h2>
                    <small>
                      {T.translate("shipments.detail.exceptions.description")}
                    </small>
                  </div>
                  <div>
                    <Table striped hover className="mb-0">
                      <tbody>
                        {resource.exceptions.map(item => (
                          <tr key={item.id}>
                            <td>
                              {T.translate(
                                "shipments.detail.exceptions.itemText",
                                {
                                  active: item.active
                                    ? T.translate(
                                        "shipments.detail.exceptions.active"
                                      )
                                    : T.translate(
                                        "shipments.detail.exceptions.inactive"
                                      ),
                                  routeId: item.route.id,
                                  typeName: item.type.name,
                                  createdAt: moment(item.createdAt).format(
                                    "lll"
                                  )
                                }
                              )}
                            </td>
                            <td className="text-right py-0 align-middle">
                              <div className="btn-group" role="group">
                                <Link
                                  id={`details-${item.id}`}
                                  className="btn btn-sm btn-primary"
                                  to={`/routeExceptions/details/${item.id}`}
                                  title={T.translate(
                                    "components.relationManager.detailRelation"
                                  )}
                                >
                                  <FontAwesomeIcon icon="eye" fixedWidth />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {resource.exceptions &&
                          resource.exceptions.length === 0 && (
                            <tr>
                              <td>
                                <em className="text-muted">
                                  {T.translate(
                                    "shipments.detail.exceptions.empty"
                                  )}
                                </em>
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </Col>
            <Col md={6}>
              {resource.id && (
                <div className="box">
                  <div className="box-header">
                    <h2 className="text-secondary">
                      {T.translate("shipments.detail.cashInstances.title")}
                    </h2>
                    <small>
                      {T.translate(
                        "shipments.detail.cashInstances.description"
                      )}
                    </small>
                  </div>
                  <div>
                    <Table striped hover className="mb-0">
                      <tbody>
                        {allCashInstances.map(item => (
                          <tr key={item.id}>
                            <td>
                              {item.partnerId
                                ? item.partner.name +
                                  T.translate(
                                    "shipments.detail.cashInstances.partner"
                                  )
                                : item.agent.name +
                                  T.translate(
                                    "shipments.detail.cashInstances.agent"
                                  )}
                              <div>
                                {item.partnerId
                                  ? item.direction.name
                                  : agentCashDirection(item.typeId)}
                                : {item.amount}
                              </div>
                              <div>{item.type.name}</div>
                            </td>
                            <td className="text-right py-0 align-middle">
                              <div className="btn-group" role="group">
                                <Link
                                  id={`details-${item.id}`}
                                  className="btn btn-sm btn-primary"
                                  to={`/${
                                    item.partnerId
                                      ? "partnerCashInstances"
                                      : "agentCashInstances"
                                  }/details/${item.id}`}
                                  title={T.translate(
                                    "components.relationManager.detailRelation"
                                  )}
                                >
                                  <FontAwesomeIcon icon="eye" fixedWidth />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {allCashInstances && allCashInstances.length === 0 && (
                          <tr>
                            <td>
                              <em className="text-muted">
                                {T.translate(
                                  "shipments.detail.cashInstances.empty"
                                )}
                              </em>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
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
              onClick={() => this.setState({ printViewHide: false })}
              className="btn btn-rounded btn-lg btn-secondary px-5"
            >
              {T.translate("shipments.detail.printButton")}
            </Button>
            <Link
              to={`/${resourceNameOnApi}/update/${resource.id}`}
              className="btn btn-rounded btn-lg btn-primary float-md-right px-5"
            >
              {T.translate("shipments.detail.editButton")}
            </Link>
          </div>
        </Container>
      );
    }
    return (
      <Container className={isModal ? "" : "pt-3"}>
        {this.printableView()}

        <div className="clearfix text-center m-t-lg">
          <Button
            onClick={() => this.setState({ printViewHide: true })}
            className="btn btn-rounded btn-lg btn-secondary float-md-left px-5"
          >
            {T.translate("defaults.goBack")}
          </Button>

          <ReactToPrint
            ref={el => (this.reactToPrint = el)}
            bodyClass={"white"}
            onAfterPrint={() => this.setState({ printViewHide: true })}
            trigger={() => (
              <Button
                onPress={() => {}}
                color="primary"
                className="btn btn-rounded btn-lg float-md-right px-5"
              >
                {T.translate("shipments.detail.printConfirmButton")}
              </Button>
            )}
            content={() => this.componentRef}
          />
        </div>
      </Container>
    );
  }
}

ShipmentDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

ShipmentDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(ShipmentDetails));
