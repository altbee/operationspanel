import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Dropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      selected: props.list[0] || ""
    };
  }

  toggleDropdown() {
    const { opened } = this.state;
    this.setState({ opened: !opened });
  }

  selectOption(option) {
    const { handleChange } = this.props;
    this.toggleDropdown();
    this.setState({ selected: option });
    handleChange(option);
  }

  render() {
    const { list, title } = this.props;
    const { opened, selected } = this.state;
    const dropdownClass = opened ? "show" : "";

    const label = title ? (
      <div className="dropdown-label btn btn-secondary w-50">{title}</div>
    ) : (
      ""
    );

    return (
      <div
        title={`Search By ${selected}`}
        className="btn-group dropdown-component"
        role="group"
      >
        {label}
        <button
          type="button"
          className="btn btn-secondary dropdown-toggle w-100 text-right"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          onClick={this.toggleDropdown.bind(this)}
        >
          {selected}
        </button>

        <div className={`dropdown-menu dropdown-menu-right ${dropdownClass}`}>
          {list.map(d => (
            <button
              className="dropdown-item"
              key={d}
              onKeyPress={() => {}}
              onClick={() => this.selectOption(d)}
              type="button"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

Dropdown.propTypes = {
  list: PropTypes.instanceOf(Array).isRequired,
  title: PropTypes.string,
  handleChange: PropTypes.func.isRequired
};

Dropdown.defaultProps = {
  title: ""
};
