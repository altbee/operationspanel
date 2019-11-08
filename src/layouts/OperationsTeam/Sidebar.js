import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import T from "i18n-react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  withAuth,
  AuthProvider,
  hasRoles
} from "../../components/Auth/AuthProvider";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";
import { LanguageSelectorNav } from "./LanguageSelectorNav";
import operationsTeamRoutes from "../../routes/operationsTeam";
import InitialsAvatar from "../../components/InitialsAvatar/InitialsAvatar";

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.account = new AuthProvider().getUser();

    this.hasRights = routeRoles => {
      if (routeRoles && routeRoles.length) {
        return hasRoles(routeRoles);
      }
      return true;
    };
  }

  putActiveClass(route) {
    const { location } = this.props;
    let isActive = "";
    if (typeof route === "string") {
      isActive = location.pathname.indexOf(route) > -1 ? "active" : "";
    } else {
      route.forEach(r => {
        if (isActive === "") {
          isActive = this.putActiveClass(r);
        }
      });
    }
    return isActive;
  }

  render() {
    const {
      header: { isSidebarOpen, toggleSidebar }
    } = this.props;
    return (
      <div
        id="aside"
        className={`app-aside modal fade nav-dropdown show ${
          isSidebarOpen ? "in" : ""
        }`}
      >
        {isSidebarOpen && (
          <div className="modal-backdrop in" onClick={toggleSidebar} />
        )}
        <div className="left navside dark" layout="column">
          <div className="navbar">
            <span className="navbar-brand">
              <Link to="/">
                <img src="/img/logo-white.png" alt="Jak Logistics" />
              </Link>
            </span>
          </div>
          <div className="flex-shrink-0">
            <div className="nav-fold">
              <span className="pull-left">
                <InitialsAvatar name={this.account.username} />
              </span>
              <span className="clear hidden-folded p-x">
                <span className="block _500">{this.account.username}</span>
                <small className="block text-muted">
                  {T.translate(
                    `users.fields.roleList.${this.account.roles[0].name}`
                  )}
                </small>
              </span>
            </div>
          </div>
          <div className="stylize-scroll" flex="true">
            <nav className="nav-light nav-border b-primary">
              <ul className="nav">
                <li className="nav-header hidden-folded">
                  <span className="small text-muted">Navigation</span>
                </li>
                {operationsTeamRoutes.map(prop => {
                  if (
                    !prop.redirect &&
                    prop.icon &&
                    this.hasRights(prop.roles)
                  ) {
                    return (
                      <li
                        key={`sidebar_${prop.name}`}
                        className={`${this.putActiveClass(prop.path)}`}
                      >
                        <Link to={prop.path} replace>
                          <span
                            className={`nav-icon ${
                              this.putActiveClass(prop.path) === "active"
                                ? "text-primary"
                                : ""
                            }`}
                          >
                            <FontAwesomeIcon icon={prop.icon} fixedWidth />
                          </span>
                          <span className="nav-text">
                            {T.translate(prop.name)}
                          </span>
                        </Link>
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </nav>
          </div>
          <div className="flex-shrink-0">
            <nav className="nav-border b-primary">
              <ul className="nav">
                <li>
                  <div className="b-b m-v-sm" />
                </li>
                <LanguageSelectorNav />
                <li>
                  <div className="b-b" />
                </li>
                <li className="no-bg">
                  <Link to="/logout">
                    <span className="nav-icon">
                      <FontAwesomeIcon icon="sign-out-alt" fixedWidth />
                    </span>
                    <span className="nav-text">
                      {T.translate("menu.sidebar.logout")}
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired
};

export default withHeader(withAuth(withRouter(Sidebar)));
