import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button
} from "reactstrap";
import T from "i18n-react";
import SweetAlert from "sweetalert2-react";
import "react-datepicker/dist/react-datepicker.css";

import { AuthProvider } from "../../components/Auth/AuthProvider";
import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";
import getValue from "get-value";

class SettingsForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();
    this.account = new AuthProvider().getUser();

    this.state = {
      resourceNameOnApi: "settings",
      resource: [],
      apiError: "",
      showApiError: false,
      apiSuccess: "warning"
    };

    /**
     * Callback for when user input some data on form fields.
     * It saves the data in their component state.
     * @param event
     */
    this.handleInputChange = event => {
      const { resource } = this.state;
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
      const offset = resource.findIndex(item => item.name === name);
      const tempResource = [...resource];
      tempResource[offset] = {
        ...resource[offset],
        value
      };
      this.setState({ resource: tempResource });
    };
    /**
     * Checks if there's an ID set (on URL). If so, updates the record. Otherwise creates one.
     * @param data
     */
    this.saveUpdates = propertyName => {
      const { resourceNameOnApi, resource } = this.state;
      const offset = resource.findIndex(item => item.name === propertyName);
      const subResource = resource[offset];
      const { name, value } = subResource;
      this.API.put(`/${resourceNameOnApi}/${subResource.id}`, {
        name,
        value
      })
        .then(response => {
          const subResourceData = response.data;
          const tempResource = [...resource];
          tempResource[offset] = subResourceData;
          this.setState({
            resource: tempResource,
            apiError: T.translate("settings.form.alert.success.message"),
            showApiError: true,
            apiSuccess: "success"
          });
        })
        .catch(error => {
          this.setState({
            apiError: getValue(
              error,
              "response.data.error.message",
              error.message
            ),
            showApiError: true,
            apiSuccess: "warning"
          });
        });
    };

    /**
     * Loads in the form the data from resource to be updated.
     */
    this.loadResourceIfNeeded = () => {
      const { resourceNameOnApi } = this.state;
      if (this.account.id) {
        this.API.get(`/${resourceNameOnApi}`).then(response => {
          this.setState({ resource: response.data });
        });
      }
    };
  }

  componentDidMount() {
    const { header } = this.props;
    header.setTitle(T.translate("settings.form.title"));

    this.loadResourceIfNeeded();
  }

  render() {
    const { resource, apiError, showApiError, apiSuccess } = this.state;

    return [
      <Container key="settings-list-container" className="pt-3">
        <Row>
          <Col md={12}>
            <div className="box">
              <div className="box-body">
                {resource.map(item => {
                  const propertyName = item.name;
                  const propertyId = item.id;
                  return (
                    <div key={propertyName}>
                      <Label>
                        {T.translate(`settings.fields.${propertyId}`)}
                      </Label>
                      <FormGroup className="input-group">
                        <Input
                          type="text"
                          name={propertyName}
                          value={item.value}
                          onChange={this.handleInputChange}
                        />
                        <span>
                          <Button
                            color="primary"
                            onClick={() => {
                              this.saveUpdates(propertyName);
                            }}
                          >
                            {T.translate("settings.form.saveButton")}
                          </Button>
                        </span>
                      </FormGroup>
                    </div>
                  );
                })}
              </div>
            </div>
          </Col>
        </Row>
      </Container>,
      <SweetAlert
        key="sweet-alert-api-error"
        show={showApiError}
        title={T.translate(`settings.form.alert.${apiSuccess}.title`)}
        text={apiError}
        type={apiSuccess}
        confirmButtonText={T.translate("settings.form.alert.confirmButton")}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.setState({ showApiError: false });
        }}
      />
    ];
  }
}

SettingsForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

SettingsForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(SettingsForm);
