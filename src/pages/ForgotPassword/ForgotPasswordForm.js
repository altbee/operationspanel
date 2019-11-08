import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Alert,
  FormGroup,
  Input,
  Button
} from "reactstrap";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import API from "../../components/API/API";

export default class ForgotPasswordForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      redirectTo: "",
      resourceNameOnApi: "users",
      resource: {
        email: ""
      },
      success: false,
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
      this.API.post(`/${resourceNameOnApi}/reset`, resource)
        .then(() => {
          this.setState({
            success: true
          });
        })
        .catch(error => {
          let errorMessage;
          if (error.request.status === 0) {
            errorMessage = T.translate("error.statusCode.message", {
              error: T.translate("error.statusCode.0")
            });
          } else {
            switch (error.response.status) {
              case 404:
                errorMessage = T.translate("forgotPassword.notFound");
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

  render() {
    const { redirectTo, success, errorMessage, resource } = this.state;

    if (redirectTo) return <Redirect to={redirectTo} />;

    return (
      <Card className="box-shadow-z5 text-color m-a rounded">
        {!success && (
          <CardBody>
            <CardTitle className="text-center">
              {T.translate("forgotPassword.title")}
            </CardTitle>
            <CardSubtitle className="text-center mb-3 font-weight-normal">
              {T.translate("forgotPassword.description")}
            </CardSubtitle>
            <form onSubmit={event => this.handleSubmit(event)}>
              {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
              <FormGroup>
                <Input
                  type="email"
                  name="email"
                  value={resource.email || ""}
                  placeholder={T.translate("users.fields.email")}
                  onChange={event => {
                    this.handleInputChange(event);
                  }}
                />
              </FormGroup>
              <div className="text-center">
                <Button
                  className="btn-rounded btn-block"
                  color="primary"
                  type="submit"
                  disabled={!resource.email}
                >
                  {T.translate("forgotPassword.sendButton")}
                </Button>
              </div>
              <div className="text-center">
                <Link
                  to="/login"
                  className="btn btn-secondary btn-rounded btn-block mt-2"
                >
                  {T.translate("defaults.goBack")}
                </Link>
              </div>
            </form>
          </CardBody>
        )}
        {success && (
          <CardBody className="text-center">
            <h1 style={{ fontSize: "50px" }}>
              <FontAwesomeIcon icon="check-circle" className="text-success" />
            </h1>
            <CardTitle>
              {T.translate("forgotPassword.successMessageTitle")}
            </CardTitle>
            <CardSubtitle className="font-weight-normal">
              {T.translate("forgotPassword.successMessageText")}
            </CardSubtitle>
            <Link
              to="/login"
              className="btn btn-primary btn-rounded btn-block mt-4"
            >
              {T.translate("defaults.goBack")}
            </Link>
          </CardBody>
        )}
      </Card>
    );
  }
}
