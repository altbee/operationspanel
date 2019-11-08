import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class SupportEventDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "routeExceptions",
      resource: {},
      hiddenPropertyNamesOnDetail: [
        "id",
        "route",
        "routeId",
        "shipment",
        "shipmentId",
        "typeId"
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
                "type",
                { shipment: ["partner", "type", "status"] },
                { route: ["agent", "bundle", "status"] }
              ]
            }
          }
        }
      );
      this.setState({
        resource: response.data
      });
    };
  }

  async componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("routeExceptions.detail.title"),
        T.translate("routeExceptions.detail.description")
      );
    }

    await this.loadResource();
  }

  render() {
    const {
      resource,
      hiddenPropertyNamesOnDetail,
      resourceNameOnApi
    } = this.state;
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
                  } else if (property === "active") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `defaults.${resource[property] ? "yes" : "no"}`
                        )}
                      </span>
                    );
                  } else if (property === "type") {
                    propertyValue = (
                      <span>
                        {resource[property]
                          ? T.translate(
                              `routeExceptions.fields.types.${
                                resource[property].name
                              }`
                            )
                          : T.translate("defaults.notSet")}
                      </span>
                    );
                  }

                  return (
                    <Row className="mb-3" key={property}>
                      <Col md={4} className="font-weight-bold">
                        <span>
                          {T.translate(`routeExceptions.fields.${property}`)}
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
          {resource.route && (
            <Col md={6}>
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("routeExceptions.detail.route.title")}
                  </h2>
                  <small>
                    {T.translate("routeExceptions.detail.route.description")}
                  </small>
                </div>
                <div className="box-body">
                  {Object.keys(resource.route).map(property => {
                    if (property === "id") {
                      return (
                        <Row className="mb-3" key={`route_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>
                              {T.translate("routeExceptions.fields.route")}
                            </span>
                          </Col>
                          <Col md={8}>
                            {T.translate("routeExceptions.fields.routeName", {
                              route: resource.route.id
                            })}
                          </Col>
                        </Row>
                      );
                    }
                    if (property === "bundleId") {
                      return (
                        <Row className="mb-3" key={`route_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>{T.translate("routes.fields.bundle")}</span>
                          </Col>
                          <Col md={8}>
                            {resource.route.bundle
                              ? T.translate(
                                  `routes.fields.bundles.${
                                    resource.route.bundle.name
                                  }`
                                )
                              : T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    if (property === "statusId") {
                      return (
                        <Row className="mb-3" key={`route_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>{T.translate("routes.fields.status")}</span>
                          </Col>
                          <Col md={8}>
                            {resource.route.status
                              ? T.translate(
                                  `routes.fields.statuses.${
                                    resource.route.status.name
                                  }`
                                )
                              : T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    if (property === "agent") {
                      return (
                        <Row className="mb-3" key={`route_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>{T.translate("routes.fields.agent")}</span>
                          </Col>
                          <Col md={8}>
                            {resource.route.agent ? (
                              <Link
                                to={{
                                  pathname: `/agents/details/${
                                    resource.route.agent.id
                                  }`,
                                  state: { from: "routeExceptions" }
                                }}
                              >
                                {resource.route.agent.name}
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
                      to={`/routes/details/${resource.routeId}`}
                      className="btn btn-rounded btn-outline-primary btn-block"
                    >
                      {T.translate("routeExceptions.detail.route.viewRoute")}
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
                    {T.translate("routeExceptions.detail.shipment.title")}
                  </h2>
                  <small>
                    {T.translate("routeExceptions.detail.shipment.description")}
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
                      return (
                        <Row className="mb-3" key={`shipment_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>{T.translate(`shipments.fields.type`)}</span>
                          </Col>
                          <Col md={8}>
                            {resource.shipment.type
                              ? T.translate(
                                  `shipments.fields.types.${
                                    resource.shipment.type.name
                                  }`
                                )
                              : T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    if (property === "statusId") {
                      return (
                        <Row className="mb-3" key={`shipment_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>
                              {T.translate(`shipments.fields.status`)}
                            </span>
                          </Col>
                          <Col md={8}>
                            {resource.shipment.status
                              ? T.translate(
                                  `shipments.fields.statuses.${
                                    resource.shipment.status.name
                                  }`
                                )
                              : T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    if (property === "partnerId") {
                      return (
                        <Row className="mb-3" key={`route_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>
                              {T.translate("shipments.fields.partner")}
                            </span>
                          </Col>
                          <Col md={8}>
                            {resource.shipment.partner ? (
                              <Link
                                to={{
                                  pathname: `/partners/details/${
                                    resource.shipment.partner.id
                                  }`,
                                  state: { from: "routeExceptions" }
                                }}
                              >
                                {resource.shipment.partner.name}
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
                        "routeExceptions.detail.shipment.viewShipment"
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
          <Link
            to={`/${resourceNameOnApi}/update/${resource.id}`}
            className="btn btn-rounded btn-lg btn-primary float-md-right px-5"
          >
            {T.translate("routeExceptions.detail.editButton")}
          </Link>
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
