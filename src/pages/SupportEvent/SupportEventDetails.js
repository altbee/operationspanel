import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Input, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";
import { SUPPORT_EVENT_STATUS } from "common/constants/models/support-event-status";
import { SHIPMENT_STATUS } from "common/constants/models/shipment-status";
import { SHIPMENT_TYPE } from "common/constants/models/shipment-type";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class SupportEventDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "supportEvents",
      resource: {},
      hiddenPropertyNamesOnDetail: [
        "id",
        "agent",
        "agentId",
        "shipment",
        "shipmentId",
        "typeId",
        "statusId",
        "readUserId",
        "resolvedUserId"
      ]
    };

    /**
     * Loads the resource data from API.
     */
    this.loadResource = async () => {
      const { resourceNameOnApi } = this.state;
      const { match } = this.props;
      const response = await this.API.get(
        `/${resourceNameOnApi}/${match.params.id}`,
        {
          params: {
            filter: {
              include: [
                "agent",
                "shipment",
                "type",
                "status",
                "readUser",
                "resolvedUser"
              ]
            }
          }
        }
      );
      this.setState({
        resource: response.data
      });
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
     * Callback for when user presses the comment save button.
     * It sends the data to database via API to update the record.
     * @param event
     */
    this.updateComment = async () => {
      const { resource, resourceNameOnApi } = this.state;
      const { id, comment } = resource;
      try {
        await this.API.patch(`/${resourceNameOnApi}/${id}`, { comment });
        this.loadResource();
      } catch (err) {
        const { log } = console;
        log("err", err);
      }
    };

    /**
     * Callback for when user presses Mark as Read or Resolved.
     * It triggers the support event endpoint based on requested path.
     * @param path
     */
    const markEvent = async path => {
      const { resourceNameOnApi, resource } = this.state;
      await this.API.get(`/${resourceNameOnApi}/${resource.id}/${path}`);
      this.loadResource();
    };

    /**
     * Action for when user wants to mark a support event as read.
     */
    this.markAsRead = async () => {
      await markEvent("mark-as-read");
    };

    /**
     * Action for when user wants to mark a support event as resolved.
     */
    this.markAsResolved = async () => {
      await markEvent("mark-as-resolved");
    };
  }

  async componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("supportEvents.detail.title"),
        T.translate("supportEvents.detail.description")
      );
    }

    await this.loadResource();
  }

  render() {
    const { resource, hiddenPropertyNamesOnDetail } = this.state;
    const { history, location } = this.props;
    const isModal = location.state && location.state.modal;

    return (
      <Container className={isModal ? "" : "pt-3"}>
        <Row>
          <Col md={12}>
            <div className="box">
              <div className="box-body">
                {Object.keys(resource).map(property => {
                  if (hiddenPropertyNamesOnDetail.includes(property)) {
                    return null;
                  }

                  let propertyValue = (
                    <span>
                      {resource[property] || T.translate("defaults.notSet")}
                    </span>
                  );

                  if (["createdAt", "updatedAt"].includes(property)) {
                    propertyValue = (
                      <span>
                        {resource[property] ? (
                          <Moment date={resource[property]} />
                        ) : (
                          T.translate("defaults.notSet")
                        )}
                      </span>
                    );
                  } else if (["readAt", "resolvedAt"].includes(property)) {
                    propertyValue = (
                      <span>
                        {resource[property] ? (
                          <Moment date={resource[property]} />
                        ) : (
                          T.translate("defaults.notSet")
                        )}
                      </span>
                    );
                  } else if (property === "status") {
                    propertyValue = (
                      <span>
                        {resource[property]
                          ? T.translate(
                              `supportEvents.fields.statuses.${
                                resource[property].name
                              }`
                            )
                          : T.translate("defaults.notSet")}
                        {resource.statusId ===
                          SUPPORT_EVENT_STATUS.CREATED.id && (
                          <Button
                            onClick={this.markAsRead}
                            className="btn btn-rounded btn-sm btn-outline-info px-3 ml-2"
                          >
                            {T.translate(
                              "supportEvents.detail.markAsReadButton"
                            )}
                          </Button>
                        )}
                        {resource.statusId !==
                          SUPPORT_EVENT_STATUS.RESOLVED.id && (
                          <Button
                            onClick={this.markAsResolved}
                            className="btn btn-rounded btn-sm btn-outline-success px-3 ml-2"
                          >
                            {T.translate(
                              "supportEvents.detail.markAsResolvedButton"
                            )}
                          </Button>
                        )}
                      </span>
                    );
                  } else if (property === "type") {
                    propertyValue = (
                      <span>
                        {resource[property]
                          ? T.translate(
                              `supportEvents.fields.types.${
                                resource[property].name
                              }`
                            )
                          : T.translate("defaults.notSet")}
                      </span>
                    );
                  } else if (["readUser", "resolvedUser"].includes(property)) {
                    propertyValue = (
                      <span>
                        {resource[property]
                          ? resource[property].username
                          : T.translate("defaults.notSet")}
                      </span>
                    );
                  } else if (property === "comment") {
                    propertyValue = (
                      <span className="d-block d-sm-flex text-right">
                        <Input
                          type="textarea"
                          name={property}
                          value={resource[property] || ""}
                          placeholder={T.translate("defaults.notSet")}
                          onChange={this.handleInputChange}
                        />
                        <Button color="primary" onClick={this.updateComment}>
                          {T.translate("supportEvents.detail.saveButton")}
                        </Button>
                      </span>
                    );
                  }

                  return (
                    <Row className="mb-3" key={property}>
                      <Col md={4} className="font-weight-bold">
                        <span>
                          {T.translate(`supportEvents.fields.${property}`)}
                        </span>
                      </Col>
                      <Col md={8}>{propertyValue}</Col>
                    </Row>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          {resource.agent && (
            <Col md={6}>
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("supportEvents.detail.agent.title")}
                  </h2>
                  <small>
                    {T.translate("supportEvents.detail.agent.description")}
                  </small>
                </div>
                <div className="box-body">
                  {Object.keys(resource.agent).map(property => {
                    if (["name", "phone"].includes(property)) {
                      return (
                        <Row className="mb-3" key={`agent_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>
                              {T.translate(`agents.fields.${property}`)}
                            </span>
                          </Col>
                          <Col md={8}>
                            {resource.agent[property] ||
                              T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    return null;
                  })}
                  <div className="clearfix text-center">
                    <Link
                      to={`/agents/details/${resource.agentId}`}
                      className="btn btn-rounded btn-outline-primary btn-block"
                    >
                      {T.translate("supportEvents.detail.agent.viewAgent")}
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
          )}
          {resource.shipment && (
            <Col md={6}>
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("supportEvents.detail.shipment.title")}
                  </h2>
                  <small>
                    {T.translate("supportEvents.detail.shipment.description")}
                  </small>
                </div>
                <div className="box-body">
                  {Object.keys(resource.shipment).map(property => {
                    if (
                      [
                        "trackingId",
                        "recipientAddress",
                        "senderAddress"
                      ].includes(property)
                    ) {
                      return (
                        <Row className="mb-3" key={`shipment_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>
                              {T.translate(`shipments.fields.${property}`)}
                            </span>
                          </Col>
                          <Col md={8}>
                            {resource.shipment[property] ||
                              T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    if (property === "typeId") {
                      const type = Object.keys(SHIPMENT_TYPE)
                        .map(type => SHIPMENT_TYPE[type])
                        .filter(type => type.id === resource.shipment.typeId)
                        .pop();
                      return (
                        <Row className="mb-3" key={`shipment_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>{T.translate(`shipments.fields.type`)}</span>
                          </Col>
                          <Col md={8}>
                            {type
                              ? T.translate(
                                  `shipments.fields.types.${type.name}`
                                )
                              : T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    if (property === "statusId") {
                      const status = Object.keys(SHIPMENT_STATUS)
                        .map(status => SHIPMENT_STATUS[status])
                        .filter(
                          status => status.id === resource.shipment.statusId
                        )
                        .pop();
                      return (
                        <Row className="mb-3" key={`shipment_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>
                              {T.translate(`shipments.fields.status`)}
                            </span>
                          </Col>
                          <Col md={8}>
                            {status
                              ? T.translate(
                                  `shipments.fields.statuses.${status.name}`
                                )
                              : T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    if (property === "routeId") {
                      return (
                        <Row className="mb-3" key={`shipment_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>{T.translate(`shipments.fields.route`)}</span>
                          </Col>
                          <Col md={8}>
                            {resource.shipment.routeId ? (
                              <Link
                                to={`/routes/details/${
                                  resource.shipment[property]
                                }`}
                              >
                                {T.translate(
                                  "supportEvents.detail.shipment.viewRoute"
                                )}
                              </Link>
                            ) : (
                              T.translate("defaults.notSet")
                            )}
                          </Col>
                        </Row>
                      );
                    }
                    return null;
                  })}
                  <div className="clearfix text-center">
                    <Link
                      to={`/shipments/details/${resource.shipmentId}`}
                      className="btn btn-rounded btn-outline-primary btn-block"
                    >
                      {T.translate(
                        "supportEvents.detail.shipment.viewShipment"
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
          )}
        </Row>
        <hr className="mt-0" />
        <div className="clearfix text-center">
          <Button
            onClick={history.goBack}
            className="btn btn-rounded btn-lg btn-secondary float-md-left px-5"
          >
            {T.translate("defaults.goBack")}
          </Button>
        </div>
      </Container>
    );
  }
}

SupportEventDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

SupportEventDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(SupportEventDetails));
