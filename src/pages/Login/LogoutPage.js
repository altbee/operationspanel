import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  AuthProvider,
  withAuth,
  AuthProps
} from "../../components/Auth/AuthProvider";
import API from "../../components/API/API";

class LogoutPage extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "users"
    };
  }

  componentWillMount() {
    const { auth } = this.props;
    const { resourceNameOnApi } = this.state;
    if (auth.isAuth) {
      const authProvider = new AuthProvider();
      const accessToken = authProvider.getAccessToken();
      this.API.post(`/${resourceNameOnApi}/logout?access_token=${accessToken}`)
        .then(() => {
          auth.logout();
        })
        .catch(() => {
          auth.logout();
        });
    }
  }

  render() {
    return (
      <Card className="box-shadow-z5 text-color m-a rounded">
        <CardBody className="text-center">
          <h1 style={{ fontSize: "50px" }}>
            <FontAwesomeIcon icon="sign-out-alt" className="text-muted" />
          </h1>
          <CardTitle>{T.translate("logout.title")}</CardTitle>
          <CardSubtitle className="font-weight-normal">
            {T.translate("logout.message")}
          </CardSubtitle>
          <Link
            to="/login"
            className="btn btn-primary btn-rounded btn-block rounded mt-4"
          >
            {T.translate("logout.loginButton")}
          </Link>
        </CardBody>
      </Card>
    );
  }
}

LogoutPage.propTypes = {
  auth: AuthProps.isRequired
};

export default withAuth(LogoutPage);
