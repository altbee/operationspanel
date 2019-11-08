import React, { Component } from "react";
import PropTypes from "prop-types";
import { Redirect, Link } from "react-router-dom";
import T from "i18n-react";
import { Alert, Label, Input, Button } from "reactstrap";

import { withAuth, AuthProps } from "../../components/Auth/AuthProvider";
import API from "../../components/API/API";

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { location } = this.props;

    const searchParams = new URLSearchParams(location.search);
    this.redirect = searchParams.has("redirect")
      ? searchParams.get("redirect")
      : "/liveOperations";

    this.state = {
      redirectTo: "",
      resourceNameOnApi: "users",
      resource: {
        username: "",
        password: ""
      },
      remember: false,
      errorMessage: null
    };

    /**
     * Callback for when user input some data on form fields.
     * It saves the data in their component state.
     * @param event
     */
    this.handleInputChange = event => {
      const { target } = event;
      const { name, type } = target;
      let { value } = target;

      switch (type) {
        case "number":
          value = parseFloat(target.value);
          break;
        case "checkbox":
          value = target.checked;
          break;
        default:
          break;
      }

      this.setState(prevState => ({
        resource: { ...prevState.resource, [name]: value }
      }));
    };

    /**
     * Callback for when user submits the form.
     * It sends the data to database via API.
     * @param event
     */
    this.handleSubmit = event => {
      event.preventDefault();
      this.setState({
        errorMessage: null
      });
      const { resourceNameOnApi, resource } = this.state;
      this.API.post(`/${resourceNameOnApi}/login`, resource, {
        params: {
          include: "user"
        },
        errorHandle: false
      })
        .then(response => {
          const { id: accessToken, user } = response.data;
          const { auth } = this.props;
          const { remember } = this.state;
          if (["admin", "operationsTeamMember"].includes(user.roles[0].name)) {
            auth.login(accessToken, user, remember);
            this.setState({ redirectTo: this.redirect });
          } else {
            this.setState({
              errorMessage: T.translate("error.forbidden.message")
            });
          }
        })
        .catch(error => {
          let errorMessage;
          if (error.request.status === 0) {
            errorMessage = T.translate("error.statusCode.message", {
              error: T.translate("error.statusCode.0")
            });
          } else {
            switch (error.response.status) {
              case 401:
                errorMessage = T.translate("login.badCredentials");
                break;
              case 400:
              case 422:
                errorMessage = T.translate("error.statusCode.message", {
                  error: T.translate(
                    `error.statusCode.${error.response.status}`
                  )
                });
                break;
              default:
                errorMessage = T.translate("error.statusCode.message", {
                  error: T.translate("error.statusCode.default")
                });
                break;
            }
          }
          this.setState({
            errorMessage
          });
        });
    };
  }

  componentWillMount() {
    const { auth } = this.props;
    if (auth.isAuth) auth.logout();
  }

  render() {
    const { redirectTo, errorMessage, resource } = this.state;

    if (redirectTo) return <Redirect to={redirectTo} />;

    return (
      <div>
        <div className="navbar">
          <img
            src="/img/logo-white.png"
            alt="Jak Logistics"
            style={{ width: "100%", maxWidth: "150px" }}
            className="d-block mx-auto"
          />
        </div>
        <div className="p-a-md box-color box-shadow-z5 rounded text-color m-a">
          <div className="m-b text-center">{T.translate("login.title")}</div>
          <form onSubmit={event => this.handleSubmit(event)}>
            {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
            {Object.keys(resource).map(propertyName => (
              <div key={propertyName} className="md-form-group float-label">
                <input
                  className={`md-input ${
                    resource[propertyName] ? "has-value" : ""
                  }`}
                  type={propertyName === "username" ? "text" : "password"}
                  name={propertyName}
                  onChange={event => {
                    this.handleInputChange(event);
                  }}
                />
                <Label>{T.translate(`users.fields.${propertyName}`)}</Label>
              </div>
            ))}
            <div className="m-b-md">
              <Label className="md-check" check>
                <Input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  onChange={event => {
                    this.setState({ remember: event.target.checked });
                  }}
                />
                <i className="primary" />
                Remember me
              </Label>
            </div>
            <Button
              className="btn p-x-md"
              block
              color="primary"
              type="submit"
              disabled={!resource.username || !resource.password}
            >
              {T.translate("login.loginButton")}
            </Button>
          </form>
        </div>
        <div className="p-v-lg text-center">
          <div className="m-b">
            <Link to="/forgotPassword" className="text-primary _600">
              {T.translate("login.forgotPassword")}
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

LoginForm.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired,
  auth: AuthProps.isRequired
};

export default withAuth(LoginForm);
