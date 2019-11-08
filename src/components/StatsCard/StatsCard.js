import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const StatsCard = props => {
  const { icon, className, statsText, statsValue, small } = props;
  const iconSize = small ? "20px" : "45px";
  return (
    <Card className="border-0">
      <CardBody>
        <Row>
          <Col className={small ? "text-center" : ""}>
            <h1
              style={{ fontSize: iconSize }}
              className={small ? "" : "mr-3 mb-0"}
            >
              <FontAwesomeIcon icon={icon} className={className} />
            </h1>
            {!small && (
              <CardTitle className="h6 font-weight-light text-muted">
                {statsText}
              </CardTitle>
            )}
            <CardSubtitle className={small ? "h6" : "h4"}>
              {statsValue}
            </CardSubtitle>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

StatsCard.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  statsText: PropTypes.string.isRequired,
  statsValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  small: PropTypes.bool
};

StatsCard.defaultProps = {
  small: false
};

export default StatsCard;
