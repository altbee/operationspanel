import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class UserDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "users",
      resource: {},
      hiddenPropertyNamesOnDetail: [
        "id",
        "realm",
        "emailVerified",
        "agentId",
        "partnerId"
      ]
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("users.detail.title"),
        T.translate("users.detail.description")
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
                  } else if (property === "roles") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `users.fields.roleList.${
                            resource[property][0]
                              ? resource[property][0].name
                              : "user"
                          }`
                        )}
                      </span>
                    );
                  } else if (property === "agent") {
                    propertyValue = (
                      <span>
                        <Link to={`/agents/details/${resource[property].id}`}>
                          {`${resource[property].name}`}
                        </Link>
                      </span>
                    );
                  } else if (property === "partner") {
                    propertyValue = (
                      <span>
                        <Link to={`/partners/details/${resource[property].id}`}>
                          {`${resource[property].name}`}
                        </Link>
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
                        <span>{T.translate(`users.fields.${property}`)}</span>
                      </Col>
                      <Col md={8}>{propertyValue}</Col>
                    </Row>
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
          <Link
            to={`/${resourceNameOnApi}/update/${resource.id}`}
            className="btn btn-rounded btn-lg btn-primary float-md-right px-5"
          >
            {T.translate("users.detail.editButton")}
          </Link>
        </div>
      </Container>
    );
  }
}

UserDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

UserDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(UserDetails));
