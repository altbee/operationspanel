import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";

import API from "../../components/API/API";
import ManyToManyRelationManager from "../../components/ManyToManyRelationManager/ManyToManyRelationManager";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class AgentDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "agents",
      resource: {},
      hiddenPropertyNamesOnDetail: [
        "id",
        "currentGeoPoint",
        "statusId",
        "fleetOwnerId",
        "typeId"
      ]
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("agents.detail.title"),
        T.translate("agents.detail.description")
      );
    }

    const { resourceNameOnApi } = this.state;
    const { match } = this.props;
    this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
      params: {
        filter: {
          include: ["status", "type", "fleetOwner"]
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
                  } else if (property === "status") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `agents.fields.statuses.${resource.status.name}`
                        )}
                      </span>
                    );
                  } else if (property === "type") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `agents.fields.types.${resource.type.name}`
                        )}
                      </span>
                    );
                  } else if (property === "fleetOwner") {
                    propertyValue = <span>{resource.fleetOwner.name}</span>;
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
                        <span>{T.translate(`agents.fields.${property}`)}</span>
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
          <Col md={6}>
            {resource.id && (
              <ManyToManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="areas"
                relationLabel={T.translate("agents.detail.areas.label")}
                title={T.translate("agents.detail.areas.title")}
                category={T.translate("agents.detail.areas.description")}
              />
            )}
          </Col>
          <Col md={6}>
            {resource.id && (
              <ManyToManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="tags"
                relationLabel={T.translate("agents.form.tags.label")}
                title={T.translate("agents.form.tags.title")}
                category={T.translate("agents.form.tags.description")}
              />
            )}
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {resource.id && (
              <ManyToManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="workingDays"
                relationLabel={T.translate("agents.detail.workingDays.label")}
                title={T.translate("agents.detail.workingDays.title")}
                category={T.translate("agents.detail.workingDays.description")}
                translate="workingDays.fields.names"
              />
            )}
          </Col>
          <Col md={6}>
            {resource.id && (
              <ManyToManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="workingHours"
                relationLabel={T.translate("agents.detail.workingHours.label")}
                title={T.translate("agents.detail.workingHours.title")}
                category={T.translate("agents.detail.workingHours.description")}
              />
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
          <Link
            to={`/${resourceNameOnApi}/update/${resource.id}`}
            className="btn btn-rounded btn-lg btn-primary float-md-right px-5"
          >
            {T.translate("agents.detail.editButton")}
          </Link>
        </div>
      </Container>
    );
  }
}

AgentDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  location: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

AgentDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(AgentDetails));
