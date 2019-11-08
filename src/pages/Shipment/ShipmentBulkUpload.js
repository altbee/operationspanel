import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  Label,
  Input,
  Button,
  Table
} from "reactstrap";
import T from "i18n-react";
import CsvParse from "@vtex/react-csv-parse";
import titleCase from "title-case";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class ShipmentBulkUpload extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      resourceNameOnApi: "shipments",
      redirectTo: "",
      fileIsUploaded: false,
      totalShipments: null,
      fileData: null,
      failedShipments: null,
      numberOfShipmentsCreated: null,
      numberOfShipmentsFailed: null,
      errorMessage: null
    };

    this.handleCSVInput = input => {
      this.setState({
        fileIsUploaded: true,
        totalShipments: input.length,
        fileData: input
      });
    };

    this.handleSave = async () => {
      const { resourceNameOnApi, fileData } = this.state;

      try {
        const response = await this.API.post(`/${resourceNameOnApi}/csv`, {
          shipments: fileData
        });

        const {
          numberOfShipmentsCreated,
          numberOfShipmentsFailed,
          failedShipmentsList
        } = response.data;

        this.setState({
          numberOfShipmentsCreated:
            numberOfShipmentsCreated > 0 && numberOfShipmentsCreated,
          numberOfShipmentsFailed:
            numberOfShipmentsFailed > 0 && numberOfShipmentsFailed,
          failedShipments: failedShipmentsList.length > 0 && failedShipmentsList
        });
      } catch (err) {
        const { error } = JSON.parse(err.request.response);
        if (error.message) {
          this.setState({ errorMessage: error.message });
        }
      }
    };
  }

  componentDidMount() {
    const { header, history } = this.props;
    header.setTitle(
      T.translate("shipments.bulkUpload.title"),
      T.translate("shipments.bulkUpload.caption")
    );
    header.setActions([
      <Button
        onClick={history.goBack}
        className="btn btn-secondary btn-rounded px-3"
      >
        {T.translate("defaults.goBack")}
      </Button>
    ]);
  }

  render() {
    const {
      redirectTo,
      fileIsUploaded,
      totalShipments,
      numberOfShipmentsCreated,
      numberOfShipmentsFailed,
      failedShipments,
      errorMessage
    } = this.state;

    const keys = [
      "Sender Shipment ID",
      "Sender Name",
      "Sender Address",
      "Sender Area",
      "Sender Geo Point",
      "Sender Phone",
      "Recipient Name",
      "Recipient Address",
      "Recipient Area",
      "Recipient Geo Point",
      "Recipient Phone",
      "Pickup Datetime",
      "Delivery Datetime",
      "Shipment Type",
      "Number of Packages",
      "Cash To Collect On Delivery",
      "Description",
      "Should Not Be Auto-Assigned"
    ];

    if (redirectTo) return <Redirect to={redirectTo} />;

    return (
      <Container className="pt-3">
        <Row>
          <Col md={{ size: 10, offset: 1 }} lg={{ size: 8, offset: 2 }}>
            <form className="text-center mt-3">
              {!fileIsUploaded && (
                <Card className="w-100">
                  <CsvParse
                    keys={keys}
                    onDataUploaded={this.handleCSVInput}
                    render={onChange => (
                      <Label className="custom-file-upload">
                        <Input
                          type="file"
                          name="file"
                          accept=".csv"
                          onChange={onChange}
                        />
                        <CardBody className="drag-body">
                          <h1
                            style={{ fontSize: "50px" }}
                            className="my-1 ml-2 text-primary"
                          >
                            <FontAwesomeIcon icon="cloud-upload-alt" />
                          </h1>
                          <h5>
                            {T.translate("shipments.bulkUpload.fileCaption")}
                          </h5>
                        </CardBody>
                      </Label>
                    )}
                  />
                  <CardFooter className="small">
                    {T.translate("shipments.bulkUpload.fileInfo")}
                    <br />
                    <a href="/shipment_bulk_upload.xlsx" download>
                      {T.translate("shipments.bulkUpload.templateDownload")}
                    </a>
                  </CardFooter>
                </Card>
              )}
              {fileIsUploaded &&
                !numberOfShipmentsCreated &&
                !numberOfShipmentsFailed &&
                !errorMessage && (
                  <div>
                    <Card className="w-100">
                      <CardBody>
                        <h1
                          style={{ fontSize: "50px" }}
                          className="my-1 ml-2 text-primary"
                        >
                          <FontAwesomeIcon icon="check-circle" />
                        </h1>
                        <h5>
                          {T.translate("shipments.bulkUpload.uploadResult", {
                            totalShipments
                          })}
                        </h5>
                      </CardBody>
                    </Card>
                    <Button
                      size="lg"
                      color="primary"
                      className="btn-rounded d-block d-md-inline-block px-5 mx-auto mt-3"
                      onClick={() => this.handleSave()}
                    >
                      {T.translate("shipments.bulkUpload.saveButton")}
                    </Button>
                  </div>
                )}
              {fileIsUploaded && errorMessage && (
                <Card className="w-100">
                  <CardBody>
                    <Card className="w-100 mb-2">
                      <CardBody>
                        <div>
                          <h1
                            style={{
                              fontSize: "50px",
                              display: "inline-block",
                              verticalAlign: "middle"
                            }}
                            className="my-2 mx-2 text-primary"
                          >
                            <FontAwesomeIcon icon="times-circle" />
                          </h1>
                          <h5
                            style={{
                              display: "inline-block",
                              lineHeight: "50px",
                              verticalAlign: "middle"
                            }}
                            className="my-2 mx-2"
                          >
                            {errorMessage}
                          </h5>
                        </div>
                      </CardBody>
                    </Card>
                    <CsvParse
                      keys={keys}
                      onDataUploaded={this.handleCSVInput}
                      render={onChange => (
                        <Label className="custom-file-upload">
                          <Input
                            type="file"
                            name="file"
                            accept=".csv"
                            onChange={onChange}
                          />
                          <CardBody className="drag-body">
                            <h1
                              style={{ fontSize: "50px" }}
                              className="my-1 ml-2 text-primary"
                            >
                              <FontAwesomeIcon icon="cloud-upload-alt" />
                            </h1>
                            <h5>
                              {T.translate("shipments.bulkUpload.fileCaption")}
                            </h5>
                          </CardBody>
                        </Label>
                      )}
                    />
                  </CardBody>
                </Card>
              )}
              {fileIsUploaded &&
                (numberOfShipmentsCreated || numberOfShipmentsFailed) && (
                  <Card className="w-100">
                    <CardBody>
                      {numberOfShipmentsCreated && (
                        <Card className="w-100 mb-2">
                          <CardBody>
                            <div>
                              <h1
                                style={{
                                  fontSize: "50px",
                                  display: "inline-block",
                                  verticalAlign: "middle"
                                }}
                                className="my-2 mx-2 text-primary"
                              >
                                <FontAwesomeIcon icon="check-circle" />
                              </h1>
                              <h5
                                style={{
                                  display: "inline-block",
                                  lineHeight: "50px",
                                  verticalAlign: "middle"
                                }}
                                className="my-2 mx-2"
                              >
                                {T.translate(
                                  "shipments.bulkUpload.uploadSuccess",
                                  { numberOfShipmentsCreated }
                                )}
                              </h5>
                            </div>
                          </CardBody>
                        </Card>
                      )}
                      {numberOfShipmentsFailed && (
                        <Card className="w-100">
                          <CardBody>
                            <div>
                              <h1
                                style={{
                                  fontSize: "50px",
                                  display: "inline-block",
                                  verticalAlign: "middle"
                                }}
                                className="my-2 mx-2 text-primary"
                              >
                                <FontAwesomeIcon icon="times-circle" />
                              </h1>
                              <h5
                                style={{
                                  display: "inline-block",
                                  lineHeight: "50px",
                                  verticalAlign: "middle"
                                }}
                                className="my-2 mx-2"
                              >
                                {T.translate(
                                  "shipments.bulkUpload.uploadError",
                                  { numberOfShipmentsFailed }
                                )}
                              </h5>
                              <Table responsive hover>
                                <thead>
                                  <tr>
                                    <th>Row</th>
                                    <th>Sender Shipment ID</th>
                                    <th>Error</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {failedShipments &&
                                    failedShipments.map(shipment => (
                                      <tr
                                        key={
                                          shipment.entry["Sender Shipment ID"]
                                        }
                                      >
                                        <td>{shipment.index + 2}</td>
                                        <td>
                                          {shipment.entry["Sender Shipment ID"]}
                                        </td>
                                        <td>
                                          {shipment.error.details.codes
                                            ? Object.keys(
                                                shipment.error.details.codes
                                              ).map(key => (
                                                <div key={key}>
                                                  {T.translate(
                                                    "shipments.bulkUpload.errorDetail",
                                                    {
                                                      fieldName: titleCase(key)
                                                    }
                                                  )}
                                                </div>
                                              ))
                                            : "-"}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </Table>
                              <h5 className="mt-5">
                                {T.translate("shipments.bulkUpload.reupload")}
                              </h5>
                            </div>
                          </CardBody>
                          <CsvParse
                            keys={keys}
                            onDataUploaded={this.handleCSVInput}
                            render={onChange => (
                              <Label className="custom-file-upload">
                                <Input
                                  type="file"
                                  name="file"
                                  accept=".csv"
                                  onChange={onChange}
                                />
                                <CardBody className="drag-body">
                                  <h1
                                    style={{ fontSize: "50px" }}
                                    className="my-1 ml-2 text-primary"
                                  >
                                    <FontAwesomeIcon icon="cloud-upload-alt" />
                                  </h1>
                                  <h5>
                                    {T.translate(
                                      "shipments.bulkUpload.fileCaption"
                                    )}
                                  </h5>
                                </CardBody>
                              </Label>
                            )}
                          />
                        </Card>
                      )}
                    </CardBody>
                  </Card>
                )}
            </form>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withHeader(ShipmentBulkUpload);
