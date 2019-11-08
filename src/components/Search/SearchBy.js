import React, { Component } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import moment from "moment/moment";

import "react-datepicker/dist/react-datepicker.css";

export default class SearchBy extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: false,
      selectedFilter: props.filters[0] || { name: "", type: "text" },
      fromDate: new moment(),
      toDate: new moment(),
      previousSearch: null
    };

    this.searchTimeout = null;
  }

  prepareSearch(data) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const { onSearch } = this.props;
      const { selectedFilter } = this.state;
      onSearch(data, selectedFilter);
      this.setState({ previousSearch: data });
    }, 500);
  }

  handleTextChange(event) {
    this.prepareSearch(event.target.value.toLowerCase());
  }

  handleDateChange(field, date) {
    this.setState(
      {
        [field]: date
      },
      () => {
        const { fromDate, toDate } = this.state;
        this.prepareSearch({
          fromDate: moment(fromDate).startOf("day"),
          toDate: moment(toDate).endOf("day")
        });
      }
    );
  }

  toggleDropdown() {
    const { opened } = this.state;
    this.setState({ opened: !opened });
  }

  selectFilter(filter) {
    const { onDropdownChange, onSearch } = this.props;
    const { selectedFilter, previousSearch } = this.state;

    let shouldClearPreviousSearch = selectedFilter.type !== filter.type;

    this.setState({
      selectedFilter: filter,
      previousSearch: shouldClearPreviousSearch ? null : previousSearch
    });

    onDropdownChange(filter);

    if (!shouldClearPreviousSearch) {
      onSearch(previousSearch, filter);
    }
  }

  render() {
    const { filters, classes } = this.props;
    const { opened, selectedFilter, fromDate, toDate } = this.state;
    const dropdownClass = opened ? "show" : "";

    return (
      <div className={`search-component ${classes.map(d => d).join(" ")}`}>
        <div className="input-group">
          <input
            type="hidden"
            name="search_param"
            value="all"
            id="search_param"
          />
          {selectedFilter.type === "text" && (
            <input
              type="text"
              className="form-control input has-dropdown"
              placeholder="Search term by..."
              onChange={e => this.handleTextChange(e)}
            />
          )}
          {selectedFilter.type === "date" && [
            <div className="input-group-prepend" key="searchDateLabelFrom">
              <span className="input-group-text">From:</span>
            </div>,
            <DatePicker
              key="searchDatePickerFrom"
              selected={fromDate}
              onChange={date => this.handleDateChange("fromDate", date)}
              dateFormat="L"
              className="form-control"
            />,
            <div className="input-group-prepend" key="searchDateLabelTo">
              <span className="input-group-text">To:</span>
            </div>,
            <DatePicker
              key="searchDatePickerTo"
              selected={toDate}
              onChange={date => this.handleDateChange("toDate", date)}
              dateFormat="L"
              className="form-control"
            />
          ]}
          <div className="input-group-btn search-panel dropdown-wrapper">
            <div
              title={`Search By ${selectedFilter.name}`}
              className="btn-group"
              onClick={this.toggleDropdown.bind(this)}
              role="button"
              tabIndex={-1}
              onKeyPress={() => {}}
            >
              <button
                type="button"
                className="btn btn-danger dropdown-toggle search-by-btn-fw"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {selectedFilter.name}
              </button>

              <div className={`dropdown-menu ${dropdownClass}`}>
                {filters.map(d => (
                  <button
                    className="dropdown-item"
                    key={d.name}
                    onKeyPress={() => {}}
                    onClick={() => this.selectFilter(d)}
                    type="button"
                  >
                    {d.name}
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

SearchBy.propTypes = {
  filters: PropTypes.instanceOf(Array).isRequired,
  classes: PropTypes.instanceOf(Array),
  onSearch: PropTypes.func.isRequired,
  onDropdownChange: PropTypes.func
};

SearchBy.defaultProps = {
  classes: [],
  onDropdownChange: () => {}
};
