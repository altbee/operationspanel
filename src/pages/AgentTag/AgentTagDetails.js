import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";

import API from "../../components/API/API";
import ManyToManyRelationManager from "../../components/ManyToManyRelationManager/ManyToManyRelationManager";
import HasManyRelationManager from "../../components/HasManyRelationManager/HasManyRelationManager";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class AgentTagDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "agentTags",
      resource: {},
      hiddenPropertyNamesOnDetail: ["id"]
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("agentTags.detail.title"),
        T.translate("agentTags.detail.description")
      );
    }

    const { resourceNameOnApi } = this.state;
    const { match } = this.props;
    this.API.get(`/${resourceNameOnApi}/${match.params.id}`).then(response => {
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
                  }

                  propertyValue = (
                    <span>
                      {resource[property] || T.translate("defaults.notSet")}
                    </span>
                  );

                  return (
                    <Row className="mb-3" key={property}>
                      <Col md={4} className="font-weight-bold">
                        <span>
                          {T.translate(`agentTags.fields.${property}`)}
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
          <Col md={6}>
            {resource.id && (
              <HasManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="routes"
                relationAttribute="bundleId"
                relationLabel={T.translate("agentTags.detail.routes.label")}
                title={T.translate("agentTags.detail.routes.title")}
                category={T.translate("agentTags.detail.routes.description")}
                itemText="{{bundle.name}}-Route #{{id}}"
                readOnly
              />
            )}
          </Col>
          <Col md={6}>
            {resource.id && (
              <ManyToManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="agents"
                relationLabel={T.translate("agentTags.detail.agents.label")}
                title={T.translate("agentTags.detail.agents.title")}
                category={T.translate("agentTags.detail.agents.description")}
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
            {T.translate("agentTags.detail.editButton")}
          </Link>
        </div>
      </Container>
    );
  }
}

AgentTagDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

AgentTagDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(AgentTagDetails));
