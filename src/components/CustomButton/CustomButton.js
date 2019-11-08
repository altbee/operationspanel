import React from "react";
import { Button } from "react-bootstrap";
import cx from "classnames";
import PropTypes from "prop-types";

export const CustomButton = props => {
  const { fill, simple, pullRight, round, block, ...rest } = props;

  const btnClasses = cx({
    "btn-fill": fill,
    "btn-simple": simple,
    "pull-right": pullRight,
    "btn-block": block,
    "btn-round": round
  });

  return <Button className={btnClasses} {...rest} />;
};

CustomButton.propTypes = {
  fill: PropTypes.bool.isRequired,
  simple: PropTypes.bool.isRequired,
  pullRight: PropTypes.bool.isRequired,
  block: PropTypes.bool.isRequired,
  round: PropTypes.bool.isRequired
};

export default CustomButton;
