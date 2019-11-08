import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PARTNER_CASH_DIRECTION } from "common/constants/models";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class PartnerCashInstanceDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "partnerCashInstances",
      resource: {},
      hiddenPropertyNamesOnDetail: [
        "id",
        "shipmentId",
        "directionId",
        "typeId",
        "partnerId"
      ]
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("partnerCashInstances.detail.title"),
        T.translate("partnerCashInstances.detail.description")
      );
    }

    const { resourceNameOnApi } = this.state;
    const { match } = this.props;
    this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
      params: {
        filter: {
          include: ["shipment", "direction", "type", "partner"]
        }
      }
    }).then(response => {
      this.setState({
        resource: response.data
      });
    });
  }

  render() {
    const {
      resourceNameOnApi,
      resource,
      hiddenPropertyNamesOnDetail
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

                  let propertyValue;

                  if (
                    [
                      "createdAt",
                      "updatedAt",
                      "dueDatetime",
                      "settledAt"
                    ].includes(property)
                  ) {
                    propertyValue = (
                      <span>
                        {resource[property] ? (
                          <Moment date={resource[property]} />
                        ) : (
                          T.translate("defaults.notSet")
                        )}
                      </span>
                    );
                  } else if (property === "type") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `partnerCashInstances.fields.${property}s.${
                            resource[property].name
                          }`
                        )}
                      </span>
                    );
                  } else if (property === "direction") {
                    propertyValue = (
                      <span
                        className={
                          resource.directionId ===
                          PARTNER_CASH_DIRECTION.CREDIT.id
                            ? "text-info"
                            : "text-danger"
                        }
                      >
                        <span>
                          {T.translate(
                            `partnerCashInstances.fields.directions.${
                              resource[property].name
                            }`
                          ).toUpperCase()}
                        </span>
                        <FontAwesomeIcon
                          icon={
                            resource.directionId ===
                            PARTNER_CASH_DIRECTION.CREDIT.id
                              ? "caret-down"
                              : "caret-up"
                          }
                          fixedWidth
                        />
                      </span>
                    );
                  } else if (property === "partner") {
                    propertyValue = (
                      <span>
                        <Link to={`/partners/details/${resource[property].id}`}>
                          {resource[property].name}
                        </Link>
                      </span>
                    );
                  } else if (property === "shipment") {
                    propertyValue = (
                      <span>
                        <Link
                          to={`/shipments/details/${resource[property].id}`}
                        >
                          {resource[property].trackingId}
                        </Link>
                      </span>
                    );
                  } else if (property === "isSettled") {
                    propertyValue = (
                      <span>
                        {resource[property]
                          ? T.translate("defaults.yes")
                          : T.translate("defaults.no")}
                      </span>
                    );
                  } else {
                    propertyValue = (
                      <span>
                        {resource[property] || T.translate("defaults.notSet")}
                      </span>
                    );
                  }

                  return (
                    <Row className="mb-3" key={property}>
                      <Col md={4} className="font-weight-bold">
                        <span>
                          {T.translate(
                            `partnerCashInstances.fields.${property}`
                          )}
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
          {resource.partnerId && (
            <Col md={6}>
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("partnerCashInstances.detail.partner.title")}
                  </h2>
                  <small>
                    {T.translate(
                      "partnerCashInstances.detail.partner.description"
                    )}
                  </small>
                </div>
                <div className="box-body">
                  {Object.keys(resource.partner).map(property => {
                    if (["name", "phone"].includes(property)) {
                      return (
                        <Row className="mb-3" key={`partner_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>
                              {T.translate(`partners.fields.${property}`)}
                            </span>
                          </Col>
                          <Col md={8}>
                            {resource.partner[property] ||
                              T.translate("defaults.notSet")}
                          </Col>
                        </Row>
                      );
                    }
                    return null;
                  })}
                  <div className="clearfix text-center">
                    <Link
                      to={`/partners/details/${resource.partnerId}`}
                      className="btn btn-rounded btn-outline-primary btn-block"
                    >
                      {T.translate(
                        "partnerCashInstances.detail.partner.viewPartner"
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
          )}
          {resource.shipmentId && (
            <Col md={6}>
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("partnerCashInstances.detail.shipment.title")}
                  </h2>
                  <small>
                    {T.translate(
                      "partnerCashInstances.detail.shipment.description"
                    )}
                  </small>
                </div>
                <div className="box-body">
                  {Object.keys(resource.shipment).map(property => {
                    let propertyValue;

                    if (
                      ["trackingId", "createdAt", "status", "routeId"].includes(
                        property
                      )
                    ) {
                      if (property === "routeId") {
                        propertyValue = (
                          <span>
                            {resource.shipment.routeId ? (
                              <Link
                                to={`/routes/details/${
                                  resource.shipment[property]
                                }`}
                              >
                                {T.translate(
                                  "partnerCashInstances.detail.shipment.viewRoute"
                                )}
                              </Link>
                            ) : (
                              T.translate("defaults.notSet")
                            )}
                          </span>
                        );
                      } else if (property === "createdAt") {
                        propertyValue = (
                          <span>
                            {resource.shipment[property] ? (
                              <Moment date={resource.shipment[property]} />
                            ) : (
                              T.translate("defaults.notSet")
                            )}
                          </span>
                        );
                      } else {
                        propertyValue = (
                          <span>
                            {resource.shipment[property] ||
                              T.translate("defaults.notSet")}
                          </span>
                        );
                      }

                      return (
                        <Row className="mb-3" key={`shipment_${property}`}>
                          <Col md={4} className="font-weight-bold">
                            <span>
                              {T.translate(
                                `shipments.fields.${
                                  property === "routeId" ? "route" : property
                                }`
                              )}
                            </span>
                          </Col>
                          <Col md={8}>{propertyValue}</Col>
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
                        "partnerCashInstances.detail.shipment.viewShipment"
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
          )}
        </Row>
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
            {T.translate("partnerCashInstances.detail.editButton")}
          </Link>
        </div>
      </Container>
    );
  }
}

PartnerCashInstanceDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

PartnerCashInstanceDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(PartnerCashInstanceDetails));
