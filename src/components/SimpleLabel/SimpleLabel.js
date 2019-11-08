import React from "react";
import PropTypes from "prop-types";

const SimpleLabel = props => {
  const { color, text, width, title } = props;

  return (
    <div
      title={title}
      style={{ width: `${width}px` }}
      className={`simple-label-component bg-${color || "blue"}`}
    >
      {text}
    </div>
  );
};

SimpleLabel.propTypes = {
  color: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  title: PropTypes.string,
  width: PropTypes.number
};

SimpleLabel.defaultProps = {
  width: 100,
  title: ""
};

export default SimpleLabel;
