import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Search = props => {
  const { handleChange, placeholder } = props;

  return (
    <div className="search-component">
      <div className="input-group search">
        <input
          type="text"
          className="form-control input"
          placeholder={placeholder}
          onChange={e => handleChange(e.target.value)}
        />
        <FontAwesomeIcon icon="search" />
      </div>
    </div>
  );
};

Search.propTypes = {
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

Search.defaultProps = {
  placeholder: "Search Term"
};

export default Search;
