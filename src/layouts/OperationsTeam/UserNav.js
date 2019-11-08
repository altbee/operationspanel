import React, { Component } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from "reactstrap";
import { Link } from "react-router-dom";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AuthProvider } from "../../components/Auth/AuthProvider";

export default class UserNav extends Component {
  constructor(props) {
    super(props);

    this.account = new AuthProvider().getUser();
  }

  render() {
    return (
      <UncontrolledDropdown nav inNavbar {...this.props}>
        <DropdownToggle nav caret>
          <FontAwesomeIcon
            icon="user-circle"
            className="mx-2 text-secondary"
            transform="grow-8"
          />{" "}
          <span className="d-none d-sm-inline">{this.account.username}</span>{" "}
        </DropdownToggle>
        <DropdownMenu right className="py-0 shadow">
          <Link to="/logout" className="dropdown-item">
            {T.translate("menu.header.logout")}
          </Link>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }
}
