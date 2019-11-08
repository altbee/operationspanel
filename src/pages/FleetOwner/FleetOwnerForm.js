import React, { Component } from "react";
import PropTypes from "prop-types";
import { Redirect, withRouter } from "react-router-dom";
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

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class FleetOwnerForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    const { match } = props;

    this.state = {
      isNewRecord: !match.params.id,
      redirectTo: "",
      resourceNameOnApi: "fleetOwners",
      resource: {}
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
      const { resource } = this.state;
      this.save(resource);
    };

    /**
     * Checks if there's an ID set (on URL). If so, updates the record. Otherwise creates one.
     * @param data
     */
    this.save = async data => {
      const { resourceNameOnApi } = this.state;
      const response = await this.API.put(`/${resourceNameOnApi}`, data);
      this.setState(prevState => ({
        redirectTo: `/${prevState.resourceNameOnApi}/details/${
          response.data.id
        }`
      }));
    };

    /**
     * Loads in the form the data from resource to be updated.
     */
    this.loadResourceIfNeeded = () => {
      if (match.params.id) {
        const { resourceNameOnApi } = this.state;
        this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
          params: {}
        }).then(response => {
          this.setState({
            resource: response.data
          });
        });
      }
    };
  }

  componentDidMount() {
    const { isNewRecord } = this.state;
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        isNewRecord
          ? T.translate("fleetOwners.form.title.create")
          : T.translate("fleetOwners.form.title.update")
      );
    }

    this.loadResourceIfNeeded();
  }

  render() {
    const { redirectTo, isNewRecord, resource } = this.state;
    const { history, location } = this.props;
    const isModal = location.state && location.state.modal;

    if (redirectTo) return <Redirect to={redirectTo} />;

    return (
      <Container className={isModal ? "" : "pt-3"}>
        <form onSubmit={event => this.handleSubmit(event)}>
          <Row>
            <Col md={12}>
              <div className="box">
                <div className="box-body">
                  <FormGroup>
                    <Label>{T.translate("fleetOwners.fields.name") + " *"}</Label>
                    <Input
                      type="text"
                      name="name"
                      value={resource.name || ""}
                      onChange={this.handleInputChange}
                      required
                    />
                  </FormGroup>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>{T.translate("fleetOwners.fields.city")}</Label>
                        <Input
                          type="text"
                          name="city"
                          value={resource.city || ""}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>
                          {T.translate("fleetOwners.fields.country")}
                        </Label>
                        <Input
                          type="text"
                          name="country"
                          value={resource.country || ""}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
          <div className="clearfix text-center">
            <Button
              onClick={history.goBack}
              className="btn btn-rounded btn-lg btn-secondary float-md-left px-5"
            >
              {T.translate("defaults.goBack")}
            </Button>
            <Button
              size="lg"
              color="primary"
              className="btn-rounded float-md-right m-auto px-5"
              type="submit"
            >
              {isNewRecord
                ? T.translate("fleetOwners.form.createButton")
                : T.translate("fleetOwners.form.updateButton")}
            </Button>
          </div>
        </form>
      </Container>
    );
  }
}

FleetOwnerForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

FleetOwnerForm.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(FleetOwnerForm));
