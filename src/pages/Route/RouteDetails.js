import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import moment from "moment";
import { Container, Row, Col, Button, Table } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";
import { SHIPMENT_STATUS } from "common/constants/models/shipment-status";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import API from "../../components/API/API";
import HasManyRelationManager from "../../components/HasManyRelationManager/HasManyRelationManager";
import ManyToManyRelationManager from "../../components/ManyToManyRelationManager/ManyToManyRelationManager";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class RouteDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "routes",
      resource: {},
      hiddenPropertyNamesOnDetail: [
        "id",
        "agentId",
        "agent",
        "shipments",
        "exceptions",
        "bundleId",
        "statusId",
        "agentCashInstanceId"
      ]
    };
  }

  async componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("routes.detail.title"),
        T.translate("routes.detail.description")
      );
    }

    const { resourceNameOnApi } = this.state;
    const { match } = this.props;
    const response = await this.API.get(
      `/${resourceNameOnApi}/${match.params.id}`,
      {
        params: {
          filter: {
            include: [
              "agent",
              "shipments",
              "bundle",
              "status",
              { exceptions: ["type", "shipment"] }
            ]
          }
        }
      }
    );
    this.setState({
      resource: response.data
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

    const shipmentRelationText = item =>
      T.translate("routes.detail.shipments.text", {
        trackingId: item.trackingId,
        name: item.partner ? item.partner.name : T.translate("defaults.notSet"),
        date: moment(item.createdAt).format("lll")
      });

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
                      {!Array.isArray(resource[property])
                        ? resource[property]
                        : "" || T.translate("defaults.notSet")}
                    </span>
                  );

                  if (["isOffered"].includes(property)) {
                    propertyValue = (
                      <span>
                        {!resource[property]
                          ? T.translate("defaults.no")
                          : T.translate("defaults.yes")}
                      </span>
                    );
                  }

                  if (
                    [
                      "startDatetime",
                      "endDatetime",
                      "createdAt",
                      "updatedAt"
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
                  }

                  if (["bundle", "status"].includes(property)) {
                    propertyValue = <span>{resource[property].name}</span>;
                  }

                  return (
                    <Row className="mb-3" key={property}>
                      <Col md={4} className="font-weight-bold">
                        <span>{T.translate(`routes.fields.${property}`)}</span>
                      </Col>
                      <Col md={8}>{propertyValue}</Col>
                    </Row>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>
        {resource.id && (
          <Row>
            <Col md={12}>
              <HasManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="shipments"
                relationAttribute="routeId"
                relationLabel={T.translate("routes.detail.shipments.label")}
                relationDetailRoute="/shipments/details"
                title={T.translate("routes.detail.shipments.title")}
                category={T.translate("routes.detail.shipments.description")}
                itemText={shipmentRelationText}
                optionText={shipmentRelationText}
                fields={["trackingId", "partnerId", "createdAt"]}
                defaultProperty="trackingId"
                optionFilter={{
                  where: {
                    statusId: {
                      nin: [SHIPMENT_STATUS.DELIVERED.id]
                    },
                    routeId: null
                  }
                }}
                include="partner"
              />
            </Col>
          </Row>
        )}
        {resource.agent && (
          <Row>
            <Col md={6}>
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("agentCashInstances.detail.agent.title")}
                  </h2>
                  <small>
                    {T.translate("agentCashInstances.detail.agent.description")}
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
                      {T.translate("agentCashInstances.detail.agent.viewAgent")}
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <ManyToManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="requiredAgentTags"
                relationLabel={T.translate(
                  "routes.detail.requiredAgentTags.label"
                )}
                title={T.translate("routes.detail.requiredAgentTags.title")}
                category={T.translate(
                  "routes.detail.requiredAgentTags.description"
                )}
              />
            </Col>
          </Row>
        )}
        {resource.id && (
          <Row>
            <Col md={12}>
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("routes.detail.exceptions.title")}
                  </h2>
                  <small>
                    {T.translate("routes.detail.exceptions.description")}
                  </small>
                </div>
                <div>
                  <Table striped hover className="mb-0">
                    <tbody>
                      {resource.exceptions.map(item => (
                        <tr key={item.id}>
                          <td>
                            {T.translate("routes.detail.exceptions.itemText", {
                              active: item.active
                                ? T.translate("routes.detail.exceptions.active")
                                : T.translate(
                                    "routes.detail.exceptions.inactive"
                                  ),
                              trackingId: item.shipment.trackingId,
                              typeName: item.type.name,
                              createdAt: moment(item.createdAt).format("lll")
                            })}
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
                      {resource.exceptions && resource.exceptions.length === 0 && (
                        <tr>
                          <td>
                            <em className="text-muted">
                              {T.translate("routes.detail.exceptions.empty")}
                            </em>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Col>
          </Row>
        )}
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
            {T.translate("routes.detail.editButton")}
          </Link>
        </div>
      </Container>
    );
  }
}

RouteDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

RouteDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(RouteDetails));
