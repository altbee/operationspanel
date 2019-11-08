import React from "react";
import PropTypes from "prop-types";

const colors = [
  "#2ecc71", // Green
  "#3498db", // Blue
  "#9b59b6", // Purple
  "#6c7a89", // Gray
  "#f2ca27", // Yellow
  "#e67e22", // Orange
  "#e74c3c" // Red
];

const InitialsAvatar = props => {
  const { name, status, color, className } = props;
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .substr(0, 2)
    .toUpperCase();

  const colorIndex = initials.slice(-1).charCodeAt() % colors.length;

  return (
    <span
      className={`w-40 circle avatar ${className}`}
      style={{ backgroundColor: color ? color : colors[colorIndex] }}
    >
      {initials}
      {status === "green" && <i className="b-white bg-success" />}
      {status === "blue" && <i className="b-white bg-info" />}
      {status === "red" && <i className="b-white bg-danger" />}
    </span>
  );
};

InitialsAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  status: PropTypes.string,
  color: PropTypes.string
};

InitialsAvatar.defaultProps = {
  className: "",
  status: null,
  color: null
};

export default InitialsAvatar;
