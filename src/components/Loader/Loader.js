import React from "react";
import PropTypes from "prop-types";

const Loader = props => {
  const { visible } = props;
  if (!visible) return null;
  return (
    <div className="loader-overlay">
      <div className="loader" />
    </div>
  );
};

Loader.propTypes = {
  visible: PropTypes.bool
};

Loader.defaultProps = {
  visible: false
};

export default Loader;
