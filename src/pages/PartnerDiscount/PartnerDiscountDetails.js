import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class PartnerDiscountDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "partnerDiscounts",
      resource: {},
      hiddenPropertyNamesOnDetail: ["id", "partnerId", "feeTypeId"]
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("partnerDiscounts.detail.title"),
        T.translate("partnerDiscounts.detail.description")
      );
    }

    const { resourceNameOnApi } = this.state;
    const { match } = this.props;
    this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
      params: {
        filter: {
          include: ["partner", "feeType"]
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
                      "startDatetime",
                      "endDatetime"
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
                  } else if (property === "partner") {
                    propertyValue = (
                      <span>
                        <Link to={`/partners/details/${resource[property].id}`}>
                          {resource[property].name}
                        </Link>
                      </span>
                    );
                  } else if (property === "feeType") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `partnerDiscounts.fields.feeTypes.${
                            resource[property].name
                          }`
                        )}
                      </span>
                    );
                  } else if (property === "isActive") {
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
                          {T.translate(`partnerDiscounts.fields.${property}`)}
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
            {T.translate("partnerDiscounts.detail.editButton")}
          </Link>
        </div>
      </Container>
    );
  }
}

PartnerDiscountDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

PartnerDiscountDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(PartnerDiscountDetails));
