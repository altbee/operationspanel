import React, { Component } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import SweetAlert from "sweetalert2-react";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ROLE } from "common/constants/models/role";
import { AGENT_CASH_TYPE } from "common/constants/models/agent-cash-type";
import { hasRoles } from "../../components/Auth/AuthProvider";
import { Pagination } from "../../components/Pagination/Pagination";
import Dropdown from "../../components/Dropdown/Dropdown";
import API from "../../components/API/API";
import SearchBy from "../../components/Search/SearchBy";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class AgentCashInstanceList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.typeOptions = ["All"].concat(
      Object.keys(AGENT_CASH_TYPE).map(type => AGENT_CASH_TYPE[type].name)
    );

    this.settleOptions = ["All", "Yes", "No"];

    this.searchFields = [
      { name: "Agent", field: "agent", type: "text" },
      { name: "Due Date", field: "dueDatetime", type: "date" },
      { name: "Amount", field: "amount", type: "text" }
    ];

    this.sortFields = [
      { name: "agent", field: "agentId" },
      { name: "type", field: "typeId" },
      { name: "dueDatetime", field: "dueDatetime" },
      { name: "isProfitForCompany", field: "isProfitForCompany" },
      { name: "amount", field: "amount" },
      { name: "createdAt", field: "createdAt" }
    ];

    this.getIcon = name => {
      const { sortBy } = this.state;
      const { field } = this.sortFields.find(d => d.name === name);
      const icon = field === sortBy.field ? sortBy.icon : "sort";
      return <FontAwesomeIcon className="sort-icon" icon={icon} />;
    };

    this.state = {
      resourceNameOnApi: "agentCashInstances",
      listItems: [],
      backupList: [],
      sortBy: {
        field: "",
        type: "",
        icon: ""
      },
      order: "agentId ASC",
      searchKeyword: "",
      selectedFilter: this.searchFields[0],
      settleOption: this.settleOptions[0],
      typeOption: this.typeOptions[0],
      searchParam: {
        filter: {
          include: ["agent", "type"]
        }
      }
    };

    this.handleSortChange = name => {
      const { sortBy } = this.state;
      const { type, field: previousField } = sortBy;
      const { field } = this.sortFields.find(d => d.name === name);
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

    this.handleSearch = async (data, filter) => {
      const { settleOption, typeOption } = this.state;
      let makeRequest = true;
      let params;
      if (data) {
        const { field } = filter;
        let val = data;

        switch (field) {
          case "dueDatetime": {
            params = {
              filter: {
                where: {
                  [field]: {
                    between: [val.fromDate, val.toDate]
                  }
                }
              }
            };

            break;
          }

          case "amount": {
            let operation;

            if (val.startsWith(">=") || val.startsWith("=>")) {
              operation = "gte";
            } else if (val.startsWith(">")) {
              operation = "gt";
            } else if (val.startsWith("<=") || val.startsWith("=<")) {
              operation = "lte";
            } else if (val.startsWith("<")) {
              operation = "lt";
            } else if (val.startsWith("=")) {
              operation = "eq";
            }

            // removes mathematical symbols
            val = val.replace(/[A-Za-z]/g, "");
            const strippedValue = val.replace(/>|=|</g, "");

            // not a number
            if (isNaN(parseInt(strippedValue, 10))) {
              clearTimeout(this.searchTimeout);
              makeRequest = false;
            }

            if (operation && operation !== "eq") {
              params = {
                filter: {
                  where: {
                    [field]: {
                      [operation]: strippedValue
                    }
                  }
                }
              };
            } else {
              params = {
                filter: {
                  where: {
                    [field]: strippedValue
                  }
                }
              };
            }

            break;
          }

          case "agent": {
            const agentsRequest = await this.API.get("/agents", {
              params: {
                filter: {
                  fields: ["id"],
                  where: { name: { ilike: `%${val}%` } }
                }
              }
            });

            const agentIds = agentsRequest.data.map(agent => agent.id);

            params = {
              filter: {
                where: {
                  agentId: {
                    inq: agentIds
                  }
                }
              }
            };

            break;
          }

          default:
            break;
        }

        params.filter.include = ["agent", "type"];
      } else {
        params = {
          filter: {
            where: {},
            include: ["agent", "type"]
          }
        };
      }

      if (settleOption !== this.settleOptions[0]) {
        params.filter.where.isSettled = settleOption === this.settleOptions[1];
      }

      if (typeOption !== this.typeOptions[0]) {
        const typeId = this.getFilterId(AGENT_CASH_TYPE, typeOption);
        params.filter.where.typeId = typeId;
      }

      if (makeRequest) {
        this.setState(
          {
            searchKeyword: data,
            searchParam: params
          },
          () => {
            this.pagination.current.fetchItemCount();
          }
        );
      }
    };
  }

  componentDidMount() {
    const { resourceNameOnApi } = this.state;
    const { header } = this.props;
    header.setTitle(
      T.translate("agentCashInstances.list.title"),
      T.translate("agentCashInstances.list.description")
    );
    header.setActions([
      <Link
        to={{
          pathname: `/${resourceNameOnApi}/create`,
          state: {
            modal: true,
            modalTitle: T.translate("agentCashInstances.form.title.create")
          }
        }}
        className="btn btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="plus" />{" "}
        {T.translate("agentCashInstances.list.add")}
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
      searchParam,
      order
    } = this.state;

    const isCredit = typeId => {
      const types = Object.keys(AGENT_CASH_TYPE);
      return (
        types
          .map(key => AGENT_CASH_TYPE[key])
          .filter(item => item.id === typeId && item.isProfitForCompany)
          .length === 1
      );
    };

    return [
      <Container key="agent-cash-instance-list-container" className="pt-3">
        <div className="box">
          <Container className="py-3">
            <Row className="justify-content-center">
              <Col md={3} sm={6}>
                <Dropdown
                  title={T.translate("agentCashInstances.fields.type")}
                  list={this.typeOptions}
                  handleChange={value =>
                    this.handleFilterChange("typeOption", value)
                  }
                />
              </Col>
              <Col md={3} sm={6}>
                <Dropdown
                  title={T.translate("agentCashInstances.fields.isSettled")}
                  list={this.settleOptions}
                  handleChange={value =>
                    this.handleFilterChange("settleOption", value)
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
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("dueDatetime")}
                    onKeyPress={() => this.handleSortChange("dueDatetime")}
                  >
                    {T.translate("agentCashInstances.fields.dueDatetime")}
                    {this.getIcon("dueDatetime")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("isProfitForCompany")}
                    onKeyPress={() =>
                      this.handleSortChange("isProfitForCompany")
                    }
                  >
                    {T.translate("agentCashInstances.fields.direction")}
                    {this.getIcon("isProfitForCompany")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("amount")}
                    onKeyPress={() => this.handleSortChange("amount")}
                  >
                    {T.translate("agentCashInstances.fields.amount")}
                    {this.getIcon("amount")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("agent")}
                    onKeyPress={() => this.handleSortChange("agent")}
                  >
                    {T.translate("agentCashInstances.fields.agent")}
                    {this.getIcon("agent")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("type")}
                    onKeyPress={() => this.handleSortChange("type")}
                  >
                    {T.translate("agentCashInstances.fields.type")}
                    {this.getIcon("type")}
                  </span>
                </th>
                <th colSpan={2}>
                  <span
                    className="table-header"
                    onClick={() => this.handleSortChange("createdAt")}
                    onKeyPress={() => this.handleSortChange("createdAt")}
                    role="button"
                    tabIndex={-1}
                  >
                    {T.translate("agents.fields.createdAt")}
                    {this.getIcon("createdAt")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {listItems.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.dueDatetime ? (
                      <Moment date={item.dueDatetime} />
                    ) : (
                      T.translate("defaults.notSet")
                    )}
                  </td>
                  <td
                    className={
                      (isCredit(item.typeId) ? "text-info" : "text-danger") +
                      " mr-20pct flex-direction-row justify-content-flex-end"
                    }
                  >
                    <small className="padding-top-1px">
                      {T.translate(
                        `agentCashInstances.fields.directions.${
                          isCredit(item.typeId) ? "Credit" : "Debit"
                        }`
                      ).toUpperCase()}
                    </small>
                    <FontAwesomeIcon
                      icon={isCredit(item.typeId) ? "caret-down" : "caret-up"}
                      fixedWidth
                    />
                  </td>
                  <td>{item.amount}</td>
                  <td>
                    {item.agent ? (
                      <Link
                        to={{
                          pathname: `/agents/details/${item.agentId}`,
                          state: { from: "agentCashInstances" }
                        }}
                      >
                        {item.agent.name}
                      </Link>
                    ) : (
                      T.translate("defaults.notSet")
                    )}
                  </td>
                  <td>
                    {item.type
                      ? item.type.name
                      : T.translate("defaults.notSet")}
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
                              "agentCashInstances.detail.title"
                            )
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        title={T.translate(
                          "agentCashInstances.list.viewTooltip"
                        )}
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
                              "agentCashInstances.form.title.update"
                            )
                          }
                        }}
                        title={T.translate(
                          "agentCashInstances.list.editTooltip"
                        )}
                      >
                        <FontAwesomeIcon icon="pencil-alt" fixedWidth />
                      </Link>
                      {hasRoles(ROLE.ADMIN) && (
                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate(
                            "agentCashInstances.list.deleteTooltip"
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
              onItemsReceived={listItemsReceived => {
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
        title={T.translate("agentCashInstances.list.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.name
            : ""
        })}
        text={T.translate("agentCashInstances.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "agentCashInstances.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate(
          "agentCashInstances.list.deleteWarning.cancelButton"
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

export default withHeader(AgentCashInstanceList);
