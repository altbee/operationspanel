import React, { Component } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { Link } from "react-router-dom";
import SweetAlert from "sweetalert2-react";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import getValue from "get-value";
import { SHIPMENT_STATUS } from "common/constants/models/shipment-status";
import { SHIPMENT_TYPE } from "common/constants/models/shipment-type";
import { ROLE } from "common/constants/models/role";
import { hasRoles } from "../../components/Auth/AuthProvider";
import { Pagination } from "../../components/Pagination/Pagination";
import API from "../../components/API/API";
import Dropdown from "../../components/Dropdown/Dropdown";
import SearchBy from "../../components/Search/SearchBy";
import InitialsAvatar from "../../components/InitialsAvatar/InitialsAvatar";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class ShipmentList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.typeOptions = ["All"].concat(
      Object.keys(SHIPMENT_TYPE).map(type => SHIPMENT_TYPE[type].name)
    );

    this.statusOptions = ["All"].concat(
      Object.keys(SHIPMENT_STATUS).map(status => SHIPMENT_STATUS[status].name)
    );

    this.sortFields = [
      { name: "trackingId", field: "trackingId" },
      { name: "status", field: "statusId" },
      { name: "type", field: "typeId" },
      { name: "partner", field: "partnerId" },
      { name: "createdAt", field: "createdAt" }
    ];

    this.searchFields = [
      { name: "Tracking Id", field: "trackingId", type: "text" },
      { name: "Sender", field: "senderName", type: "text" },
      { name: "Recipient", field: "recipientName", type: "text" },
      { name: "Creation Date", field: "createdAt", type: "date" },
      { name: "Delivery Date", field: "deliveryDatetime", type: "date" },
      { name: "Belongs To", field: "partnerId", type: "text" }
    ];

    this.getIcon = name => {
      const { sortBy } = this.state;

      const element = this.sortFields.find(d => d.name === name);
      if (!element) {
        return "";
      }

      const { field } = this.sortFields.find(d => d.name === name);
      const icon = field === sortBy.field ? sortBy.icon : "sort";
      return <FontAwesomeIcon className="sort-icon" icon={icon} />;
    };

    this.state = {
      resourceNameOnApi: "shipments",
      listItems: [],
      sortBy: {
        field: "",
        type: "",
        icon: ""
      },
      order: "trackingId ASC",
      backupList: [],
      searchKeyword: "",
      selectedFilter: this.searchFields[0],
      statusOption: this.statusOptions[0],
      typeOption: this.typeOptions[0],
      searchParam: {
        filter: {
          include: ["partner", "status", "type"]
        }
      }
    };

    this.delete = id => {
      const { resourceNameOnApi } = this.state;
      this.API.delete(`/${resourceNameOnApi}/${id}`).then(() => {
        this.pagination.current.fetchItems();
      });
    };

    this.getFilterId = (model, value) => {
      const key = Object.keys(model).filter(
        item => model[item].name === value
      )[0];
      return model[key].id;
    };

    this.handleFilterChange = (key, value) => {
      this.setState({ [key]: value }, () => {
        const { searchKeyword, selectedFilter } = this.state;
        this.handleSearch(searchKeyword, selectedFilter);
      });
    };

    this.handleSortChange = name => {
      const element = this.sortFields.find(d => d.name === name);
      if (!element) {
        return;
      }

      const { sortBy } = this.state;
      const { type, field: previousField } = sortBy;
      const { field } = element;

      let newType = "DESC";

      if (field === previousField) {
        newType = type === "ASC" ? "DESC" : "ASC";
      }

      this.setState(
        {
          sortBy: {
            field,
            type: newType,
            icon: newType === "ASC" ? "sort-up" : "sort-down"
          },
          order: `${field} ${newType}`
        },
        () => {
          this.pagination.current.fetchItemCount();
        }
      );
    };

    this.handleSearch = async (data, filter) => {
      const { statusOption, typeOption } = this.state;
      let params;
      if (data) {
        const { field } = filter;
        switch (field) {
          case "createdAt":
          case "deliveryDatetime": {
            params = {
              filter: {
                where: {
                  [field]: {
                    between: [data.fromDate, data.toDate]
                  }
                }
              }
            };
            break;
          }
          case "partnerId": {
            const response = await this.API.get("/partners", {
              params: {
                filter: {
                  fields: ["id"],
                  where: { name: { ilike: `%${data}%` } }
                }
              }
            });
            const ids = response.data.map(agent => agent.id);
            params = {
              filter: {
                where: {
                  [field]: {
                    inq: ids
                  }
                }
              }
            };
            break;
          }
          default: {
            params = {
              filter: {
                where: {
                  [field]: {
                    ilike: `%${data}%`
                  }
                }
              }
            };
            break;
          }
        }
        params.filter.include = ["status", "type", "partner"];
      } else {
        params = {
          filter: {
            where: {},
            include: ["partner", "status", "type"]
          }
        };
      }

      if (statusOption !== this.statusOptions[0]) {
        const statusId = this.getFilterId(SHIPMENT_STATUS, statusOption);
        params.filter.where.statusId = statusId;
      }

      if (typeOption !== this.typeOptions[0]) {
        const typeId = this.getFilterId(SHIPMENT_TYPE, typeOption);
        params.filter.where.typeId = typeId;
      }

      this.setState(
        {
          searchKeyword: data,
          searchParam: params
        },
        () => {
          this.pagination.current.fetchItemCount();
        }
      );
    };
  }

  componentDidMount() {
    const { resourceNameOnApi } = this.state;
    const { header } = this.props;
    header.setTitle(
      T.translate("shipments.list.title"),
      T.translate("shipments.list.description")
    );
    header.setActions([
      <Link
        to={`/${resourceNameOnApi}/upload`}
        className="btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="file-upload" /> {T.translate("Bulk Upload")}
      </Link>,
      <Link
        to={{
          pathname: `/${resourceNameOnApi}/create`,
          state: {
            modal: true,
            modalTitle: T.translate("shipments.form.title.create")
          }
        }}
        className="btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="plus" /> {T.translate("shipments.list.add")}
      </Link>
    ]);

    this.refreshTimer = setInterval(() => {
      this.pagination.current.fetchItemCount();
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
  }

  render() {
    const {
      resourceNameOnApi,
      listItems,
      showDeletionConfirmation,
      selectedItemToBeDeleted,
      order,
      searchParam
    } = this.state;

    return [
      <Container key="shipment-list-container" className="pt-3">
        <div className="box">
          <Container className="py-3">
            <Row className="justify-content-center">
              <Col md={3} sm={6}>
                <Dropdown
                  title="Shipment Type"
                  list={this.typeOptions}
                  handleChange={value =>
                    this.handleFilterChange("typeOption", value)
                  }
                />
              </Col>
              <Col md={3} sm={6}>
                <Dropdown
                  title="Status"
                  list={this.statusOptions}
                  handleChange={value =>
                    this.handleFilterChange("statusOption", value)
                  }
                />
              </Col>
              <Col md={6}>
                <SearchBy
                  filters={this.searchFields}
                  onSearch={this.handleSearch}
                  onDropdownChange={filter =>
                    this.handleFilterChange("selectedFilter", filter)
                  }
                />
              </Col>
            </Row>
          </Container>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>
                  <span
                    className="table-header"
                    onKeyPress={() => {}}
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("trackingId")}
                  >
                    {T.translate("shipments.fields.trackingId")}
                    {this.getIcon("trackingId")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    onKeyPress={() => {}}
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("partner")}
                  >
                    {T.translate("shipments.fields.belongsTo")}
                    {this.getIcon("partner")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("status")}
                    onKeyPress={() => this.handleSortChange("status")}
                  >
                    {T.translate("shipments.fields.status")}
                    {this.getIcon("status")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    onKeyPress={() => {}}
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("type")}
                  >
                    {T.translate("shipments.fields.type")}
                    {this.getIcon("type")}
                  </span>
                </th>
                <th colSpan={2}>
                  <span
                    className="table-header"
                    onKeyPress={() => {}}
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("createdAt")}
                  >
                    {T.translate("shipments.fields.createdAt")}
                    {this.getIcon("createdAt")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {listItems.map(item => (
                <tr key={item.id}>
                  <td className="align-middle">
                    <span className="list-left">
                      <InitialsAvatar
                        name={getValue(item, "type.name", "-")}
                        color={(() => {
                          if (item.status) {
                            switch (item.status.id) {
                              case SHIPMENT_STATUS.CREATED.id:
                                return "#e74c3c"; // Red
                              case SHIPMENT_STATUS.PICKED_UP.id:
                                return "#e67e22"; // Orange
                              case SHIPMENT_STATUS.ON_ROUTE.id:
                                return "#f2ca27"; // Yellow
                              case SHIPMENT_STATUS.DELIVERED.id:
                                return "#2ecc71"; // Green
                              case SHIPMENT_STATUS.RESCHEDULE.id:
                                return "#3498db"; // Blue
                              default:
                                return "#ccc"; // Gray
                            }
                          }
                          return null;
                        })()}
                      />
                    </span>
                    <div className="list-body">
                      {item.trackingId}
                      <small className="text-muted d-block">
                        {item.status
                          ? T.translate(
                              `shipments.fields.statuses.${item.status.name}`
                            )
                          : "--"}
                      </small>
                    </div>
                  </td>
                  <td className="align-middle">
                    {item.partner ? (
                      <Link
                        to={{
                          pathname: `/partners/details/${item.partnerId}`,
                          state: { from: "shipments" }
                        }}
                      >
                        {item.partner.name}
                      </Link>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="align-middle">
                    {item.status
                      ? T.translate(
                          `shipments.fields.statuses.${item.status.name}`
                        )
                      : "--"}
                  </td>
                  <td className="align-middle">
                    {item.type
                      ? T.translate(`shipments.fields.types.${item.type.name}`)
                      : "--"}
                  </td>
                  <td className="align-middle">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "--"}
                  </td>
                  <td className="text-right py-0 align-middle">
                    <div className="btn-group" role="group">
                      <Link
                        to={{
                          pathname: `/${resourceNameOnApi}/details/${item.id}`,
                          state: {
                            modal: true,
                            modalTitle: T.translate("shipments.detail.title")
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        title={T.translate("shipments.list.viewTooltip")}
                      >
                        <FontAwesomeIcon icon="eye" fixedWidth />
                      </Link>
                      <Link
                        className="btn btn-primary btn-sm"
                        to={{
                          pathname: `/${resourceNameOnApi}/update/${item.id}`,
                          state: {
                            modal: true,
                            modalTitle: T.translate(
                              "shipments.form.title.update"
                            )
                          }
                        }}
                        title={T.translate("shipments.list.editTooltip")}
                      >
                        <FontAwesomeIcon icon="pencil-alt" fixedWidth />
                      </Link>
                      {hasRoles(ROLE.ADMIN) && (
                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate("shipments.list.deleteTooltip")}
                          onClick={() => {
                            this.setState({
                              selectedItemToBeDeleted: item,
                              showDeletionConfirmation: true
                            });
                          }}
                        >
                          <FontAwesomeIcon icon="trash-alt" fixedWidth />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <footer className="p-a dker">
            <Pagination
              ref={this.pagination}
              resourceNameOnApi={resourceNameOnApi}
              filter={{ ...searchParam.filter, order }}
              onItemsReceived={async listItemsReceived => {
                this.setState({
                  listItems: listItemsReceived,
                  backupList: listItemsReceived
                });
              }}
            />
          </footer>
        </div>
      </Container>,
      <SweetAlert
        key="sweet-alert"
        show={showDeletionConfirmation}
        title={T.translate("shipments.list.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.trackingId
            : ""
        })}
        text={T.translate("shipments.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "shipments.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate(
          "shipments.list.deleteWarning.cancelButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        cancelButtonClass="btn btn-secondary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.delete(selectedItemToBeDeleted.id);
          this.setState({ showDeletionConfirmation: false });
        }}
      />
    ];
  }
}

export default withHeader(ShipmentList);
