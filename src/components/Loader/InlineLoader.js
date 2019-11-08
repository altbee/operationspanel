import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const InlineLoader = props => {
  const { visible, className } = props;
  return (
    <span className={!visible ? "d-none" : ""}>
      <FontAwesomeIcon
        icon="circle-notch"
        className={`text-primary ${className}`}
        spin
      />
    </span>
  );
};

InlineLoader.propTypes = {
  visible: PropTypes.bool,
  className: PropTypes.string
};

InlineLoader.defaultProps = {
  visible: false,
  className: ""
};

export default InlineLoader;
