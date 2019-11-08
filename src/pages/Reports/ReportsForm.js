import React, { Component } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import { Container, Row, Col, FormGroup, Label, Button } from "reactstrap";
import Select from "react-select";
import T from "i18n-react";
import SweetAlert from "sweetalert2-react";
import "react-datepicker/dist/react-datepicker.css";

import API from "../../components/API/API";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";
import Loader from "../../components/Loader/Loader";

class ReportsForm extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      isLoading: false,
      errorMessage: null,
      agentPerformanceFromDate: moment(),
      agentPerformanceToDate: moment(),
      agentCashBalanceFromDate: moment(),
      agentCashBalanceToDate: moment(),
      shipmentsFromDate: moment(),
      shipmentsToDate: moment(),
      agentTypesOptions: [],
      shipmentStatusesOptions: [],
      selectedShipmentStatus: {
        value: 0,
        label: T.translate("defaults.all")
      },
      selectedAgentType: {
        value: 0,
        label: T.translate("defaults.all")
      }
    };

    this.endpoints = {
      agentCashBalance: "agents/download-balance-report",
      agentPerformance: "agents/download-performance-report",
      shipments: "shipments/download-report"
    };

    /**
     * Callback function to when user selects a date in date picker.
     * @param {Date} date
     * @param {string} property
     */
    this.handleDateChange = (date, property) => {
      this.setState({
        [property]: date
      });
    };

    /**
     * Returns the select option (used in react-select) component,
     * based on the resource retrieved from database.
     * @param type
     * @param translation
     * @return {{value: *, label: string, data: *}}
     */
    this.buildOptionFromTheResource = (type, translation) => ({
      value: type.id,
      label: translation
        ? T.translate(`${translation}.${type.name}`)
        : type.name
    });

    /**
     * Loads from API all available shipment statuses,
     * to build up the select options in the form.
     */
    this.loadShipmentStatuses = () => {
      this.API.get("/shipmentStatuses").then(response => {
        const typeOptions = [
          {
            value: 0,
            label: T.translate("defaults.all")
          }
        ];
        response.data.forEach(item => {
          const option = this.buildOptionFromTheResource(
            item,
            "shipments.fields.statuses"
          );
          typeOptions.push(option);
        });
        this.setState({
          shipmentStatusesOptions: typeOptions
        });
      });
    };

    /**
     * Loads from API all available agent types,
     * to build up the select options in the form.
     */
    this.loadAgentTypes = () => {
      this.API.get("/agentTypes").then(response => {
        const typeOptions = [
          {
            value: 0,
            label: T.translate("defaults.all")
          }
        ];
        response.data.forEach(item => {
          const option = this.buildOptionFromTheResource(
            item,
            "agents.fields.types"
          );
          typeOptions.push(option);
        });
        this.setState({
          agentTypesOptions: typeOptions
        });
      });
    };

    /**
     * Callback function to when user selects some value on Shipment Status
     * form field. Saves status to this component state.
     * @param selectedShipmentStatus
     */
    this.handleChangeOnStatus = selectedShipmentStatus => {
      this.setState({ selectedShipmentStatus });
    };

    /**
     * Callback function to when user selects some value on Agent Type
     * form field. Saves status to this component state.
     * @param selectedAgentType
     */
    this.handleChangeOnType = selectedAgentType => {
      this.setState({ selectedAgentType });
    };

    /**
     * Fetch the spreadsheet file from the API and make the browser download it.
     * @param report
     * @param params
     */
    this.downloadReport = async (report, params) => {
      await this.setState({ isLoading: true });

      const response = await this.API.get(`/${this.endpoints[report]}`, {
        showLoader: false,
        responseType: "blob",
        params
      });

      const pattern = /.*filename=['"]?([^"]+)/;
      const filename = pattern.exec(response.headers["content-disposition"])[1];

      if (!filename) {
        this.setState({
          isLoading: false,
          errorMessage:
            "Could not process the report file at this moment. Please try again later."
        });
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      this.setState({ isLoading: false });
    };
  }

  componentDidMount() {
    const { header } = this.props;
    header.setTitle(
      T.translate("reports.form.title"),
      T.translate("reports.form.description")
    );

    this.loadAgentTypes();
    this.loadShipmentStatuses();
  }

  render() {
    const {
      agentCashBalanceFromDate,
      agentCashBalanceToDate,
      agentPerformanceFromDate,
      agentPerformanceToDate,
      shipmentsFromDate,
      shipmentsToDate,
      agentTypesOptions,
      shipmentStatusesOptions,
      selectedAgentType,
      selectedShipmentStatus,
      errorMessage,
      isLoading
    } = this.state;

    return [
      <Container key="report-container" className="pt-3">
        <Row>
          <Col md={12}>
            {/* Agent Cash Balance */}
            <div className="box">
              <div className="box-header">
                <h3>{T.translate("reports.form.agentCashBalance.title")}</h3>
                <small>
                  {T.translate("reports.form.agentCashBalance.description")}
                </small>
              </div>
              <div className="box-divider m-0" />
              <div className="box-body">
                <Row>
                  <Col sm={10}>
                    <Row className="align-items-center">
                      <Col sm={2} className="mb-sm-0 mb-3">
                        <strong>
                          {T.translate("reports.form.dateRange.title")}
                        </strong>
                      </Col>
                      <Col sm={5}>
                        <FormGroup className="input-group mb-sm-0 mb-2">
                          <Label className="col-3 col-sm-2 px-0 form-control-label">
                            {T.translate("reports.form.dateRange.from")}
                          </Label>
                          <div className="flex-grow-1">
                            <DatePicker
                              selected={agentCashBalanceFromDate}
                              onChange={date =>
                                this.handleDateChange(
                                  date,
                                  "agentCashBalanceFromDate"
                                )
                              }
                              dateFormat="ll"
                              className="form-control w-100"
                            />
                          </div>
                        </FormGroup>
                      </Col>
                      <Col sm={5}>
                        <FormGroup className="input-group mb-sm-0 mb-2">
                          <Label className="col-3 col-sm-2 px-0 form-control-label">
                            {T.translate("reports.form.dateRange.to")}
                          </Label>
                          <div className="flex-grow-1">
                            <DatePicker
                              selected={agentCashBalanceToDate}
                              onChange={date =>
                                this.handleDateChange(
                                  date,
                                  "agentCashBalanceToDate"
                                )
                              }
                              dateFormat="ll"
                              className="form-control w-100"
                            />
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={2}>
                    <Button
                      block
                      color="primary"
                      onClick={() =>
                        this.downloadReport("agentCashBalance", {
                          from: agentCashBalanceFromDate.format("YYYY-MM-DD"),
                          to: agentCashBalanceToDate.format("YYYY-MM-DD")
                        })
                      }
                    >
                      {T.translate("reports.form.download")}
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Shipments */}
            <div className="box">
              <div className="box-header">
                <h3>{T.translate("reports.form.shipments.title")}</h3>
                <small>
                  {T.translate("reports.form.shipments.description")}
                </small>
              </div>
              <div className="box-divider m-0" />
              <div className="box-body">
                <Row>
                  <Col sm={10}>
                    <Row className="align-items-center">
                      <Col sm={2} className="mb-sm-0 mb-3">
                        <strong>
                          {T.translate("reports.form.dateRange.title")}
                        </strong>
                      </Col>
                      <Col sm={5}>
                        <FormGroup className="input-group mb-sm-0 mb-2">
                          <Label className="col-3 col-sm-2 px-0 form-control-label">
                            {T.translate("reports.form.dateRange.from")}
                          </Label>
                          <div className="flex-grow-1">
                            <DatePicker
                              selected={shipmentsFromDate}
                              onChange={date =>
                                this.handleDateChange(date, "shipmentsFromDate")
                              }
                              dateFormat="ll"
                              className="form-control w-100"
                            />
                          </div>
                        </FormGroup>
                      </Col>
                      <Col sm={5}>
                        <FormGroup className="input-group mb-sm-0 mb-2">
                          <Label className="col-3 col-sm-2 px-0 form-control-label">
                            {T.translate("reports.form.dateRange.to")}
                          </Label>
                          <div className="flex-grow-1">
                            <DatePicker
                              selected={shipmentsToDate}
                              onChange={date =>
                                this.handleDateChange(date, "shipmentsToDate")
                              }
                              dateFormat="ll"
                              className="form-control w-100"
                            />
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="align-items-center mt-2">
                      <Col sm={2} className="mb-sm-0 mb-3">
                        <strong>{T.translate("reports.form.filterBy")}</strong>
                      </Col>
                      <Col sm={5}>
                        <FormGroup className="input-group mb-sm-0 mb-2">
                          <Label className="col-3 col-sm-2 px-0 form-control-label">
                            {T.translate("shipments.fields.status")}
                          </Label>
                          <div className="flex-grow-1">
                            <Select
                              value={selectedShipmentStatus}
                              onChange={this.handleChangeOnStatus}
                              options={shipmentStatusesOptions}
                              placeholder={T.translate(
                                "defaults.placeholder.select"
                              )}
                              isClearable={false}
                              className="react-select-container w-100"
                              classNamePrefix="react-select"
                            />
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={2}>
                    <Button
                      block
                      color="primary"
                      className="mt-sm-0 mt-2"
                      onClick={() =>
                        this.downloadReport("shipments", {
                          from: shipmentsFromDate.format("YYYY-MM-DD"),
                          to: shipmentsToDate.format("YYYY-MM-DD"),
                          statusId: selectedShipmentStatus.value
                        })
                      }
                    >
                      {T.translate("reports.form.download")}
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Agents Performance */}
            <div className="box">
              <div className="box-header">
                <h3>{T.translate("reports.form.agentPerformance.title")}</h3>
                <small>
                  {T.translate("reports.form.agentPerformance.description")}
                </small>
              </div>
              <div className="box-divider m-0" />
              <div className="box-body">
                <Row>
                  <Col sm={10}>
                    <Row className="align-items-center">
                      <Col sm={2} className="mb-sm-0 mb-3">
                        <strong>
                          {T.translate("reports.form.dateRange.title")}
                        </strong>
                      </Col>
                      <Col sm={5}>
                        <FormGroup className="input-group mb-sm-0 mb-2">
                          <Label className="col-3 col-sm-2 px-0 form-control-label">
                            {T.translate("reports.form.dateRange.from")}
                          </Label>
                          <div className="flex-grow-1">
                            <DatePicker
                              selected={agentPerformanceFromDate}
                              onChange={date =>
                                this.handleDateChange(
                                  date,
                                  "agentPerformanceFromDate"
                                )
                              }
                              dateFormat="ll"
                              className="form-control w-100"
                            />
                          </div>
                        </FormGroup>
                      </Col>
                      <Col sm={5}>
                        <FormGroup className="input-group mb-sm-0 mb-2">
                          <Label className="col-3 col-sm-2 px-0 form-control-label">
                            {T.translate("reports.form.dateRange.to")}
                          </Label>
                          <div className="flex-grow-1">
                            <DatePicker
                              selected={agentPerformanceToDate}
                              onChange={date =>
                                this.handleDateChange(
                                  date,
                                  "agentPerformanceToDate"
                                )
                              }
                              dateFormat="ll"
                              className="form-control w-100"
                            />
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="align-items-center mt-2">
                      <Col sm={2} className="mb-sm-0 mb-3">
                        <strong>{T.translate("reports.form.filterBy")}</strong>
                      </Col>
                      <Col sm={5}>
                        <FormGroup className="input-group mb-sm-0 mb-2">
                          <Label className="col-3 col-sm-2 px-0 form-control-label">
                            {T.translate("agents.fields.type")}
                          </Label>
                          <div className="flex-grow-1">
                            <Select
                              value={selectedAgentType}
                              onChange={this.handleChangeOnType}
                              options={agentTypesOptions}
                              placeholder={T.translate(
                                "defaults.placeholder.select"
                              )}
                              isClearable={false}
                              className="react-select-container w-100"
                              classNamePrefix="react-select"
                            />
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={2}>
                    <Button
                      block
                      color="primary"
                      className="mt-sm-0 mt-2"
                      onClick={() =>
                        this.downloadReport("agentPerformance", {
                          from: agentPerformanceFromDate.format("YYYY-MM-DD"),
                          to: agentPerformanceToDate.format("YYYY-MM-DD"),
                          typeId: selectedAgentType.value
                        })
                      }
                    >
                      {T.translate("reports.form.download")}
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>,
      <Loader key="report-loader" visible={isLoading} />,
      <SweetAlert
        key="sweet-alert-api-error"
        show={!!errorMessage}
        title={T.translate("routes.list.autoAssignErrorAlert.title")}
        text={errorMessage}
        type="warning"
        confirmButtonText={T.translate(
          "routes.list.autoAssignErrorAlert.confirmButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.setState({ errorMessage: null });
        }}
      />
    ];
  }
}

export default withHeader(ReportsForm);
