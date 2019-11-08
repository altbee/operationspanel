import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false
    };

    this.toggleActions = () => {
      const { isActionsOpen } = this.state;
      this.setState({ isActionsOpen: !isActionsOpen });
    };
  }

  render() {
    const { header } = this.props;
    const { isHeaderVisible, title, subTitle, toggleSidebar, actions } = header;
    const { isActionsOpen } = this.state;
    if (!isHeaderVisible) {
      return (
        <button
          type="button"
          onClick={toggleSidebar}
          className="md-fab-bottom-left pos-fix d-lg-none md-btn md-fab m-b-sm primary"
        >
          <FontAwesomeIcon icon="bars" />
        </button>
      );
    }
    return (
      <div className="app-header white box-shadow">
        <div className="navbar navbar-expand-lg flex-row align-items-center">
          {/* Sidebar toggle button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="d-lg-none btn btn-link text-secondary mr-2"
          >
            <FontAwesomeIcon icon="bars" />
          </button>

          {/* Title and Subtitle */}
          {(title || subTitle) && (
            <span className="h5 my-0 mr-auto">
              {title}
              {subTitle && (
                <span className="text-muted _300 d-block m-0 text-uppercase text-sm">
                  {subTitle}
                </span>
              )}
            </span>
          )}

          {/* Actions */}
          {actions && [
            <button
              key="actions_toggle"
              type="button"
              onClick={this.toggleActions}
              className="d-lg-none btn btn-link text-secondary"
            >
              <FontAwesomeIcon icon="ellipsis-v" />
            </button>,
            <div
              key="actions_container"
              className={`text-center navbar-collapse ${
                isActionsOpen ? "" : "collapse"
              }`}
            >
              <hr className="d-none-lg my-2" />
              <ul className="navbar-nav ml-auto">
                {actions.map((action, index) => (
                  <li
                    key={`action_idx_${index}`}
                    className="nav-item m-1 my-lg-0"
                  >
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ]}
        </div>
      </div>
    );
  }
}

export default withHeader(Header);
