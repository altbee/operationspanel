import React, { Component } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { Container, Row, Col, Button, Table, Input } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import SweetAlert from "sweetalert2-react";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  InlineForm,
  InlineFormConsumer
} from "../../components/InlineEdit/InlineForm";
import InlineField from "../../components/InlineEdit/InlineField";
import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class PartnerDetails extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "Partners",
      resource: {},
      webhookResource: {
        webhookHeaders: []
      },
      hiddenPropertyNamesOnDetail: [
        "id",
        "codFeeTypeId",
        "defaultShipmentTypeId",
        "typeId"
      ],
      eternalAccessToken: "",
      showRenewConfirmation: false
    };

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

      const { webhookResource } = this.state;
      this.setState({ webhookResource: { ...webhookResource, [name]: value } });
    };

    /**
     * Create or update an webhook header record.
     * @param data
     */
    this.saveHeaderResource = async data => {
      try {
        await this.API.put("/partnerWebhookHeaders", data);
        const { successAlerts } = this.state;
        this.setState({
          successAlerts: {
            ...successAlerts,
            webhookUrl: true
          }
        });
        this.loadHeadersResource();
      } catch (e) {}
    };

    /**
     * Loads in the form the data from resource to be updated.
     */
    this.loadResource = () => {
      const { resourceNameOnApi } = this.state;
      const { match } = this.props;
      this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
        params: {
          filter: {
            fields: ["id", "webhookUrl", "legacyWebhookUrl"],
            include: "webhookHeaders"
          }
        }
      }).then(response => {
        this.setState({
          webhookResource: response.data
        });
      });
    };

    /**
     * Loads in the form the data from resource to be updated.
     */
    this.loadHeadersResource = () => {
      const { resourceNameOnApi } = this.state;
      const { match } = this.props;
      this.API.get(
        `/${resourceNameOnApi}/${match.params.id}/webhookHeaders`
      ).then(response => {
        const { webhookResource } = this.state;
        this.setState({
          webhookResource: {
            ...webhookResource,
            webhookHeaders: response.data
          }
        });
      });
    };

    /**
     * Creates a new webhook header resource
     */
    this.createHeaderResource = async () => {
      const {
        webhookResource: { webhookHeaderName, webhookHeaderValue }
      } = this.state;
      const { match } = this.props;

      if (!webhookHeaderName || !webhookHeaderValue) return;

      const data = {
        name: webhookHeaderName,
        value: webhookHeaderValue,
        partnerId: match.params.id
      };
      try {
        await this.saveHeaderResource(data);
        const { webhookResource } = this.state;
        this.setState({
          webhookResource: {
            ...webhookResource,
            webhookHeaderName: "",
            webhookHeaderValue: ""
          }
        });
        this.loadHeadersResource();
      } catch (e) {}
    };

    /**
     * Deletes an existing webhook header resource
     */
    this.deleteHeaderResource = id => {
      this.API.delete(`/partnerWebhookHeaders/${id}`).then(() => {
        this.loadHeadersResource();
      });
    };
  }

  componentDidMount() {
    const { header, location } = this.props;
    const isModal = location.state && location.state.modal;
    if (!isModal) {
      header.setTitle(
        T.translate("partners.detail.title"),
        T.translate("partners.detail.description")
      );
    }

    const { resourceNameOnApi } = this.state;
    const { match } = this.props;
    this.API.get(`/${resourceNameOnApi}/${match.params.id}`, {
      params: {
        filter: {
          include: ["codFeeType", "defaultShipmentType", "type"]
        }
      }
    }).then(response => {
      this.setState({
        resource: response.data
      });
    });
    this.API.get(
      `/${resourceNameOnApi}/${match.params.id}/eternal-access-token`
    ).then(response => {
      this.setState({ eternalAccessToken: response.data });
    });

    this.onRenewConfirmation = () => {
      this.API.patch(
        `/${resourceNameOnApi}/${match.params.id}/eternal-access-token`
      ).then(response => {
        this.setState({
          eternalAccessToken: response.data,
          showRenewConfirmation: false
        });
      });
    };
    this.loadResource();
  }

  render() {
    const {
      resource,
      webhookResource,
      hiddenPropertyNamesOnDetail,
      resourceNameOnApi,
      eternalAccessToken,
      showRenewConfirmation,
      selectedItemToBeDeleted,
      showDeletionConfirmation
    } = this.state;
    const { history, location } = this.props;
    const isModal = location.state && location.state.modal;

    return [
      <Container className={isModal ? "" : "pt-3"}>
        <Row>
          <Col md={12}>
            <div className="box">
              <div className="box-body">
                {Object.keys(resource).map(property => {
                  if (hiddenPropertyNamesOnDetail.includes(property)) {
                    return null;
                  }

                  let propertyValue;

                  if (["createdAt", "updatedAt"].includes(property)) {
                    propertyValue = (
                      <span>
                        {resource[property] ? (
                          <Moment date={resource[property]} />
                        ) : (
                          T.translate("defaults.notSet")
                        )}
                      </span>
                    );
                  } else if (property === "type") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `partners.fields.types.${resource.type.name}`
                        )}
                      </span>
                    );
                  } else if (property === "codFeeType") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `partners.fields.codFeeTypes.${
                            resource.codFeeType.name
                          }`
                        )}
                      </span>
                    );
                  } else if (property === "defaultShipmentType") {
                    propertyValue = (
                      <span>
                        {T.translate(
                          `shipments.fields.types.${
                            resource.defaultShipmentType.name
                          }`
                        )}
                      </span>
                    );
                  } else if (["isActive", "codIsCollect"].includes(property)) {
                    propertyValue = (
                      <span>
                        {resource[property]
                          ? T.translate("defaults.yes")
                          : T.translate("defaults.no")}
                      </span>
                    );
                  } else {
                    propertyValue = (
                      <span>
                        {resource[property] || T.translate("defaults.notSet")}
                      </span>
                    );
                  }

                  return (
                    <Row className="mb-3" key={property}>
                      <Col md={4} className="font-weight-bold">
                        <span>
                          {T.translate(`partners.fields.${property}`)}
                        </span>
                      </Col>
                      <Col md={8}>{propertyValue}</Col>
                    </Row>
                  );
                })}
                {Object.keys(resource).length > 0 && (
                  <Row className="mb-3" key="eternalAccessToken">
                    <Col md={4} className="font-weight-bold">
                      <span className="line-height-col">
                        {T.translate("partners.fields.accessToken")}
                      </span>
                    </Col>
                    <Col md={8}>
                      <div className="flex-direction-row">
                        <span className="line-height-col mr-16">
                          {eternalAccessToken}
                        </span>

                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate(
                            "partners.detail.renewAccessToken.title"
                          )}
                          onClick={() => {
                            this.setState({
                              showRenewConfirmation: true
                            });
                          }}
                        >
                          {T.translate(
                            "partners.detail.renewAccessToken.title"
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                )}
                <Row className="mb-3" key="eternalAccessToken">
                  <Col md={4} className="font-weight-bold">
                    <span className="line-height-col">
                      {T.translate("webhook.form.caption")}
                    </span>
                  </Col>
                  <Col md={8}>
                    <Table responsive hover striped className="border">
                      <thead>
                        <tr>
                          <th>
                            {T.translate("webhook.fields.webhookHeader.name")}
                          </th>
                          <th>
                            {T.translate("webhook.fields.webhookHeader.value")}
                          </th>
                          <th className="text-center">
                            {T.translate("webhook.form.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Content-Type</td>
                          <td>application/json</td>
                          <td />
                        </tr>
                        {webhookResource &&
                          webhookResource.webhookHeaders &&
                          webhookResource.webhookHeaders.map(item => (
                            <InlineForm resource={item} key={item.id}>
                              <tr>
                                <td>
                                  <InlineField
                                    property="name"
                                    placeholder={T.translate(
                                      "webhook.fields.webhookHeader.name"
                                    )}
                                  />
                                </td>
                                <td>
                                  <InlineField
                                    property="value"
                                    placeholder={T.translate(
                                      "webhook.fields.webhookHeader.value"
                                    )}
                                  />
                                </td>
                                <td className="text-center py-0 align-middle">
                                  <InlineFormConsumer
                                    children={inlineForm => {
                                      if (inlineForm.isEditing) {
                                        return (
                                          <div
                                            className="btn-group"
                                            role="group"
                                            key="inline-editor"
                                          >
                                            <Button
                                              size="sm"
                                              color="primary"
                                              onClick={() => {
                                                this.saveHeaderResource(
                                                  inlineForm.resource
                                                );
                                                inlineForm.toggleEditing();
                                              }}
                                            >
                                              {T.translate("defaults.save")}
                                            </Button>
                                            <Button
                                              size="sm"
                                              color="secondary"
                                              onClick={inlineForm.toggleEditing}
                                            >
                                              {T.translate("defaults.cancel")}
                                            </Button>
                                          </div>
                                        );
                                      }
                                      return (
                                        <div className="btn-group" role="group">
                                          <Button
                                            size="sm"
                                            color="primary"
                                            title={T.translate(
                                              "webhook.form.editTooltip"
                                            )}
                                            onClick={inlineForm.toggleEditing}
                                          >
                                            <FontAwesomeIcon
                                              icon="pencil-alt"
                                              fixedWidth
                                            />
                                          </Button>
                                          <Button
                                            size="sm"
                                            color="primary"
                                            title={T.translate(
                                              "webhook.form.deleteTooltip"
                                            )}
                                            onClick={() => {
                                              this.setState({
                                                selectedItemToBeDeleted: item,
                                                showDeletionConfirmation: true
                                              });
                                            }}
                                          >
                                            <FontAwesomeIcon
                                              icon="trash-alt"
                                              fixedWidth
                                            />
                                          </Button>
                                        </div>
                                      );
                                    }}
                                  />
                                </td>
                              </tr>
                            </InlineForm>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-light">
                          <td>
                            <Input
                              type="text"
                              name="webhookHeaderName"
                              value={webhookResource.webhookHeaderName || ""}
                              placeholder={T.translate(
                                "webhook.fields.webhookHeader.name"
                              )}
                              onChange={this.handleInputChange}
                            />
                          </td>
                          <td>
                            <Input
                              type="text"
                              name="webhookHeaderValue"
                              value={webhookResource.webhookHeaderValue || ""}
                              placeholder={T.translate(
                                "webhook.fields.webhookHeader.value"
                              )}
                              onChange={this.handleInputChange}
                            />
                          </td>
                          <td className="text-center">
                            <Button
                              color="secondary"
                              className="btn-rounded d-block d-md-inline-block px-3"
                              onClick={this.createHeaderResource}
                              disabled={
                                !webhookResource.webhookHeaderName ||
                                !webhookResource.webhookHeaderValue
                              }
                            >
                              <i className="fas fa-plus mr-2" />
                              {T.translate("webhook.form.addHeaderButton")}
                            </Button>
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
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
          <Link
            to={`/${resourceNameOnApi}/update/${resource.id}`}
            className="btn btn-rounded btn-lg btn-primary float-md-right px-5"
          >
            {T.translate("partners.detail.editButton")}
          </Link>
        </div>
      </Container>,
      <SweetAlert
        key="sweet-alert-deletion-confirmation"
        show={showRenewConfirmation}
        title={T.translate("partners.detail.renewAccessToken.title")}
        text={T.translate("partners.detail.renewAccessToken.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "partners.detail.renewAccessToken.confirmButton"
        )}
        cancelButtonText={T.translate(
          "partners.detail.renewAccessToken.cancelButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        cancelButtonClass="btn btn-secondary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={this.onRenewConfirmation}
      />,
      <SweetAlert
        key="sweet-alert"
        show={showDeletionConfirmation}
        title={T.translate("webhook.form.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.name
            : ""
        })}
        text={T.translate("webhook.form.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "webhook.form.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate(
          "webhook.form.deleteWarning.cancelButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        cancelButtonClass="btn btn-secondary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.deleteHeaderResource(selectedItemToBeDeleted.id);
          this.setState({ showDeletionConfirmation: false });
        }}
      />
    ];
  }
}

PartnerDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  location: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired
  }).isRequired
};

PartnerDetails.defaultProps = {
  match: {
    params: {
      id: ""
    }
  }
};

export default withHeader(withRouter(PartnerDetails));
