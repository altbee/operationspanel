import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AGENT_CASH_TYPE } from "common/constants/models/agent-cash-type";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class AgentCashInstanceDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "agentCashInstances",
      resource: {},
      hiddenPropertyNamesOnDetail: ["id", "typeId", "agentId", "shipment"]
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("agentCashInstances.detail.title"),
        T.translate("agentCashInstances.detail.description")
      );
    }

    const { resourceNameOnApi } = this.state;
    const { match } = this.props;
    this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
      params: {
        filter: {
          include: ["type", "agent", "shipment"]
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

    const isCredit = typeId => {
      const types = Object.keys(AGENT_CASH_TYPE);
      return (
        types
          .map(key => AGENT_CASH_TYPE[key])
          .filter(item => item.id === typeId && item.isProfitForCompany)
          .length === 1
      );
    };

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
                  } else if (property === "agent") {
                    propertyValue = (
                      <span>
                        <Link to={`/agents/details/${resource[property].id}`}>
                          {resource[property].name}
                        </Link>
                      </span>
                    );
                  } else if (property === "type") {
                    propertyValue = (
                      <span>
                        {resource[property].name}{" "}
                        <em className="text-muted">
                          (
                          {resource[property].isProfitForCompany
                            ? "This agent owes Jak"
                            : "Jak owes this agent"}
                          )
                        </em>
                      </span>
                    );
                  } else if (property === "routeId") {
                    if (resource.typeId !== AGENT_CASH_TYPE.COMMISSION.id)
                      return null;
                    propertyValue = (
                      <span>
                        <Link to={`/routes/details/${resource.routeId}`}>
                          {T.translate("agentCashInstances.detail.routeLink", {
                            route: resource.routeId
                          })}
                        </Link>
                      </span>
                    );
                  } else if (property === "shipmentId") {
                    if (resource.typeId !== AGENT_CASH_TYPE.CASH_COLLECTED.id)
                      return null;
                    propertyValue = (
                      <span>
                        <Link to={`/shipments/details/${resource.shipmentId}`}>
                          {resource.shipment.trackingId}
                        </Link>
                      </span>
                    );
                  } else if (
                    ["isSettled", "isProfitForCompany"].includes(property)
                  ) {
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
                          {T.translate(`agentCashInstances.fields.${property}`)}
                        </span>
                      </Col>
                      <Col md={8}>{propertyValue}</Col>
                    </Row>
                  );
                })}
                {resource.type && (
                  <Row className="mb-3">
                    <Col md={4} className="font-weight-bold">
                      <span>
                        {T.translate("agentCashInstances.fields.direction")}
                      </span>
                    </Col>
                    <Col
                      md={8}
                      className={
                        isCredit(resource.typeId) ? "text-info" : "text-danger"
                      }
                    >
                      <span>
                        {T.translate(
                          `agentCashInstances.fields.directions.${
                            isCredit(resource.typeId) ? "Credit" : "Debit"
                          }`
                        ).toUpperCase()}
                      </span>
                      <FontAwesomeIcon
                        icon={
                          isCredit(resource.typeId) ? "caret-down" : "caret-up"
                        }
                        fixedWidth
                      />
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          {resource.agentId && (
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
            {T.translate("agentCashInstances.detail.editButton")}
          </Link>
        </div>
      </Container>
    );
  }
}

AgentCashInstanceDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

AgentCashInstanceDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(AgentCashInstanceDetails));
