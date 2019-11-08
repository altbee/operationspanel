import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";

import API from "../../components/API/API";
import ManyToManyRelationManager from "../../components/ManyToManyRelationManager/ManyToManyRelationManager";
import { MapWithMarkers } from "../../components/Maps/MapWithMarkers";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class AreaDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "areas",
      resource: {},
      hiddenPropertyNamesOnDetail: ["id"]
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("areas.detail.title"),
        T.translate("areas.detail.description")
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
                  if (property === "centerGeoPoint") {
                    propertyValue = (
                      <span>
                        ({resource.centerGeoPoint.lat},
                        {resource.centerGeoPoint.lng})
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
                        <span>{T.translate(`areas.fields.${property}`)}</span>
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
          {Object.prototype.hasOwnProperty.call(resource, "centerGeoPoint") && (
            <Col md={6}>
              <div className="box">
                <div className="box-header">
                  <h2 className="text-secondary">
                    {T.translate("areas.detail.centerGeoPoint.title")}
                  </h2>
                  <small>
                    {T.translate("areas.detail.centerGeoPoint.description")}
                  </small>
                </div>
                <div>
                  <MapWithMarkers
                    mapProps={{
                      defaultCenter: {
                        lat: resource.centerGeoPoint.lat,
                        lng: resource.centerGeoPoint.lng
                      },
                      defaultOptions: {
                        zoom: 13,
                        scrollwheel: false,
                        zoomControl: true
                      }
                    }}
                    containerHeight="450px"
                    markers={[
                      {
                        position: {
                          lat: resource.centerGeoPoint.lat,
                          lng: resource.centerGeoPoint.lng
                        }
                      }
                    ]}
                    autoCenter={false}
                  />
                </div>
              </div>
            </Col>
          )}
          <Col md={6}>
            {resource.id && (
              <ManyToManyRelationManager
                resourceEndPoint={resourceNameOnApi}
                resourceId={resource.id}
                relationEndPoint="agents"
                relationLabel={T.translate("areas.detail.agents.label")}
                title={T.translate("areas.detail.agents.title")}
                category={T.translate("areas.detail.agents.description")}
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
            {T.translate("areas.detail.editButton")}
          </Link>
        </div>
      </Container>
    );
  }
}

AreaDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

AreaDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(AreaDetails));
