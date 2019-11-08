import React, { Component } from "react";
import PropTypes from "prop-types";

class CustomCheckbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCheckedFromProps: !!props.isChecked
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      isCheckedFromProps: !prevState.isCheckedFromProps
    }));
  }

  render() {
    const { isChecked, number, label, inline, ...rest } = this.props;
    const { isCheckedFromProps } = this.state;
    const classes = inline ? "checkbox checkbox-inline" : "checkbox";
    return (
      <div className={classes}>
        <label htmlFor={number}>
          <input
            id={number}
            type="checkbox"
            onChange={this.handleClick}
            checked={isCheckedFromProps}
            {...rest}
          />
          {label}
        </label>
      </div>
    );
  }
}

CustomCheckbox.propTypes = {
  isChecked: PropTypes.bool,
  number: PropTypes.number,
  label: PropTypes.string,
  inline: PropTypes.bool
};

CustomCheckbox.defaultProps = {
  isChecked: false,
  number: 0,
  label: "",
  inline: false
};

export default CustomCheckbox;
