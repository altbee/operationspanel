import React, { Component } from "react";
import PropTypes from "prop-types";

export default class SortBy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      selected: props.sorts[0] || ""
    };
  }

  toggleDropdown() {
    const { opened } = this.state;
    this.setState({ opened: !opened });
  }

  selectFilter(filter) {
    const { handleChange } = this.props;

    this.setState({ selected: filter });
    handleChange(filter, "dropdown");
  }

  render() {
    const { sorts, handleChange } = this.props;
    const { opened, selected } = this.state;
    const dropdownClass = opened ? "show" : "";

    return (
      <div className="search-component width_60">
        <div className="input-group">
          <input
            type="hidden"
            name="search_param"
            value="all"
            id="search_param"
          />
          <input
            type="text"
            disabled
            className="form-control input"
            placeholder="Sort list by..."
            onChange={e => handleChange(e.target.value, "input")}
          />

          <div className="input-group-btn search-panel dropdown-wrapper">
            <div
              title={`Sort By ${selected}`}
              className="btn-group"
              onClick={this.toggleDropdown.bind(this)}
              role="button"
              tabIndex={-1}
              onKeyPress={() => {}}
            >
              <button
                type="button"
                className="btn btn-danger dropdown-toggle"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {selected}
              </button>

              <div className={`dropdown-menu ${dropdownClass}`}>
                {sorts.map(d => (
                  <button
                    className="dropdown-item"
                    key={d}
                    onKeyPress={() => {}}
                    onClick={() => this.selectFilter(d)}
                    type="button"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SortBy.propTypes = {
  sorts: PropTypes.instanceOf(Array).isRequired,
  handleChange: PropTypes.func.isRequired
};
