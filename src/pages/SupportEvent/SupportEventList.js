import React, { Component } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { Link } from "react-router-dom";
import SweetAlert from "sweetalert2-react";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import getValue from "get-value";
import { SUPPORT_EVENT_STATUS } from "common/constants/models/support-event-status";
import { SUPPORT_EVENT_TYPE } from "common/constants/models/support-event-type";
import { AGENT_TYPE } from "common/constants/models/agent-type";
import { ROLE } from "common/constants/models/role";
import { hasRoles } from "../../components/Auth/AuthProvider";
import { Pagination } from "../../components/Pagination/Pagination";
import API from "../../components/API/API";
import Dropdown from "../../components/Dropdown/Dropdown";
import SearchBy from "../../components/Search/SearchBy";
import InitialsAvatar from "../../components/InitialsAvatar/InitialsAvatar";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class SupportEventList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.typeOptions = ["All"].concat(
      Object.keys(SUPPORT_EVENT_TYPE).map(type => SUPPORT_EVENT_TYPE[type].name)
    );

    this.statusOptions = ["All"].concat(
      Object.keys(SUPPORT_EVENT_STATUS).map(
        status => SUPPORT_EVENT_STATUS[status].name
      )
    );

    this.agentTypes = Object.keys(AGENT_TYPE)
      .map(type => AGENT_TYPE[type])
      .reduce((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {});

    this.sortFields = [
      { name: "agentId", field: "agentId" },
      { name: "shipmentId", field: "shipmentId" },
      { name: "type", field: "typeId" },
      { name: "status", field: "statusId" },
      { name: "createdAt", field: "createdAt" }
    ];

    this.searchFields = [
      { name: "Agent", field: "agentId", type: "text" },
      { name: "Tracking Id", field: "shipmentId", type: "text" },
      { name: "Creation Date", field: "createdAt", type: "date" },
      { name: "Read Date", field: "readAt", type: "date" },
      { name: "Resolved Date", field: "resolvedAt", type: "date" }
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
      resourceNameOnApi: "supportEvents",
      listItems: [],
      sortBy: {
        field: "",
        type: "",
        icon: ""
      },
      order: "createdAt ASC",
      backupList: [],
      searchKeyword: "",
      selectedFilter: this.searchFields[0],
      statusOption: this.statusOptions[0],
      typeOption: this.typeOptions[0],
      searchParam: {
        filter: {
          include: ["agent", "shipment", "type", "status"]
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
          case "resolvedAt":
          case "readAt": {
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
          case "agentId": {
            const response = await this.API.get("/agents", {
              params: {
                filter: {
                  fields: ["id"],
                  where: { name: { ilike: `%${data}%` } }
                }
              }
            });
            const ids = response.data.map(item => item.id);
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
          case "shipmentId": {
            const response = await this.API.get("/shipments", {
              params: {
                filter: {
                  fields: ["id"],
                  where: { trackingId: { ilike: `%${data}%` } }
                }
              }
            });
            const ids = response.data.map(item => item.id);
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
        params.filter.include = ["agent", "shipment", "type", "status"];
      } else {
        params = {
          filter: {
            where: {},
            include: ["agent", "shipment", "type", "status"]
          }
        };
      }

      if (statusOption !== this.statusOptions[0]) {
        const statusId = this.getFilterId(SUPPORT_EVENT_STATUS, statusOption);
        params.filter.where.statusId = statusId;
      }

      if (typeOption !== this.typeOptions[0]) {
        const typeId = this.getFilterId(SUPPORT_EVENT_TYPE, typeOption);
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
    const { header } = this.props;
    header.setTitle(
      T.translate("supportEvents.list.title"),
      T.translate("supportEvents.list.description")
    );

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
                  title={T.translate("supportEvents.list.filters.type")}
                  list={this.typeOptions}
                  handleChange={value =>
                    this.handleFilterChange("typeOption", value)
                  }
                />
              </Col>
              <Col md={3} sm={6}>
                <Dropdown
                  title={T.translate("supportEvents.list.filters.status")}
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
                    onClick={() => this.handleSortChange("agentId")}
                  >
                    {T.translate("supportEvents.fields.agent")}
                    {this.getIcon("agentId")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    onKeyPress={() => {}}
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("shipmentId")}
                  >
                    {T.translate("supportEvents.fields.shipment")}
                    {this.getIcon("shipmentId")}
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
                    {T.translate("supportEvents.fields.type")}
                    {this.getIcon("type")}
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
                    {T.translate("supportEvents.fields.status")}
                    {this.getIcon("status")}
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
                    {T.translate("supportEvents.fields.createdAt")}
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
                              case SUPPORT_EVENT_STATUS.CREATED.id:
                                return "#e74c3c"; // Red
                              case SUPPORT_EVENT_STATUS.READ.id:
                                return "#f2ca27"; // Yellow
                              case SUPPORT_EVENT_STATUS.RESOLVED.id:
                                return "#2ecc71"; // Green
                              default:
                                return "#ccc"; // Gray
                            }
                          }
                          return null;
                        })()}
                      />
                    </span>
                    <div className="list-body">
                      {item.agent ? (
                        <span>
                          <Link
                            to={{
                              pathname: `/agents/details/${item.agentId}`,
                              state: { from: "supportEvents" }
                            }}
                          >
                            {item.agent.name}
                          </Link>
                          <small className="text-muted d-block">
                            {item.agent.typeId
                              ? T.translate(
                                  `agents.fields.types.${
                                    this.agentTypes[item.agent.typeId]
                                  }`
                                )
                              : "--"}
                          </small>
                        </span>
                      ) : (
                        "--"
                      )}
                    </div>
                  </td>
                  <td className="align-middle">
                    {item.shipment ? (
                      <Link
                        to={{
                          pathname: `/shipments/details/${item.shipmentId}`,
                          state: { from: "supportEvents" }
                        }}
                      >
                        {item.shipment.trackingId}
                      </Link>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="align-middle">
                    {item.type
                      ? T.translate(
                          `supportEvents.fields.types.${item.type.name}`
                        )
                      : "--"}
                  </td>
                  <td className="align-middle">
                    {item.status
                      ? T.translate(
                          `supportEvents.fields.statuses.${item.status.name}`
                        )
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
                            modalTitle: T.translate(
                              "supportEvents.detail.title"
                            )
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        title={T.translate("supportEvents.list.viewTooltip")}
                      >
                        <FontAwesomeIcon icon="eye" fixedWidth />
                      </Link>
                      {hasRoles(ROLE.ADMIN) && (
                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate(
                            "supportEvents.list.deleteTooltip"
                          )}
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
        title={T.translate("supportEvents.list.deleteWarning.title", {
          itemToBeDeleted:
            selectedItemToBeDeleted && selectedItemToBeDeleted.agent
              ? selectedItemToBeDeleted.agent.name
              : T.translate("supportEvents.list.deleteWarning.unknownAgent")
        })}
        text={T.translate("supportEvents.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "supportEvents.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate(
          "supportEvents.list.deleteWarning.cancelButton"
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

export default withHeader(SupportEventList);
