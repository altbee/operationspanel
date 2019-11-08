import React, { Component } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { Link } from "react-router-dom";
import SweetAlert from "sweetalert2-react";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AGENT_STATUS } from "common/constants/models/agent-status";
import { AGENT_TYPE } from "common/constants/models/agent-type";
import { ROLE } from "common/constants/models/role";
import { hasRoles } from "../../components/Auth/AuthProvider";
import { Pagination } from "../../components/Pagination/Pagination";
import API from "../../components/API/API";
import Dropdown from "../../components/Dropdown/Dropdown";
import SearchBy from "../../components/Search/SearchBy";
import InitialsAvatar from "../../components/InitialsAvatar/InitialsAvatar";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class AgentList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.typeOptions = ["All"].concat(
      Object.keys(AGENT_TYPE).map(type => AGENT_TYPE[type].name)
    );

    this.statusOptions = ["All"].concat(
      Object.keys(AGENT_STATUS).map(status => AGENT_STATUS[status].name)
    );

    this.searchFields = [
      { name: "Name", field: "name", type: "text" },
      { name: "Friendly ID", field: "friendlyId", type: "text" },
      { name: "Phone", field: "phone", type: "text" }
    ];

    this.sortFields = [
      { name: "name", field: "name" },
      { name: "phone", field: "phone" },
      { name: "type", field: "typeId" },
      { name: "status", field: "statusId" },
      { name: "createdAt", field: "createdAt" }
    ];

    this.getIcon = name => {
      const element = this.sortFields.find(d => d.name === name);
      if (!element) {
        return "";
      }

      const { sortBy } = this.state;
      const { field } = this.sortFields.find(d => d.name === name);
      const icon = field === sortBy.field ? sortBy.icon : "sort";
      return <FontAwesomeIcon className="sort-icon" icon={icon} />;
    };

    this.state = {
      resourceNameOnApi: "agents",
      listItems: [],
      backupList: [],
      sortBy: {
        field: "",
        type: "",
        icon: ""
      },
      order: "name ASC",
      searchKeyword: "",
      selectedFilter: this.searchFields[0],
      statusOption: this.statusOptions[0],
      typeOption: this.typeOptions[0],
      searchParam: {
        filter: {
          where: {},
          include: ["type", "status"]
        }
      }
    };

    this.delete = id => {
      const { resourceNameOnApi } = this.state;
      this.API.delete(`/${resourceNameOnApi}/${id}`).then(() => {
        this.pagination.current.fetchItems();
      });
    };

    this.handleSortChange = name => {
      const element = this.sortFields.find(d => d.name === name);
      if (!element) {
        return;
      }

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
      const { statusOption, typeOption } = this.state;
      let params;
      if (data) {
        const { field } = filter;
        params = {
          filter: { where: { [field]: { ilike: `%${data}%` } } }
        };
        params.filter.include = ["status", "type"];
      } else {
        params = {
          filter: {
            where: {},
            include: ["status", "type"]
          }
        };
      }

      if (statusOption !== this.statusOptions[0]) {
        const statusId = this.getFilterId(AGENT_STATUS, statusOption);
        params.filter.where.statusId = statusId;
      }

      if (typeOption !== this.typeOptions[0]) {
        const typeId = this.getFilterId(AGENT_TYPE, typeOption);
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
      T.translate("agents.list.title"),
      T.translate("agents.list.description")
    );
    header.setActions([
      <Link
        to={{
          pathname: `/${resourceNameOnApi}/create`,
          state: {
            modal: true,
            modalTitle: T.translate("agents.form.title.create")
          }
        }}
        className="btn btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="plus" /> {T.translate("agents.list.add")}
      </Link>
    ]);
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

    return [
      <Container key="agent-list-container" className="pt-3">
        <div className="box">
          <Container className="py-3">
            <Row className="justify-content-center">
              <Col md={3} sm={6}>
                <Dropdown
                  title="Agent Type"
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
                    onClick={() => this.handleSortChange("name")}
                    onKeyPress={() => this.handleSortChange("name")}
                    role="button"
                    tabIndex={-1}
                  >
                    {T.translate("agents.fields.name")}
                    {this.getIcon("name")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    onClick={() => this.handleSortChange("type")}
                    onKeyPress={() => this.handleSortChange("type")}
                    role="button"
                    tabIndex={-1}
                  >
                    {T.translate("agents.fields.type")}
                    {this.getIcon("type")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    onClick={() => this.handleSortChange("status")}
                    onKeyPress={() => this.handleSortChange("status")}
                    role="button"
                    tabIndex={-1}
                  >
                    {T.translate("agents.fields.status")}
                    {this.getIcon("status")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    onClick={() => this.handleSortChange("phone")}
                    onKeyPress={() => this.handleSortChange("phone")}
                    role="button"
                    tabIndex={-1}
                  >
                    {T.translate("agents.fields.phone")}
                    {this.getIcon("phone")}
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
                  <td className="align-middle">
                    <span className="list-left">
                      <InitialsAvatar
                        name={item.name}
                        status={(() => {
                          if (item.status) {
                            switch (item.status.id) {
                              case AGENT_STATUS.AVAILABLE.id:
                                return "green";
                              case AGENT_STATUS.ON_ROUTE.id:
                                return "blue";
                              default:
                                return "red";
                            }
                          }
                          return null;
                        })()}
                      />
                    </span>
                    <div className="list-body">
                      {item.name}
                      <small className="text-muted d-block">
                        {item.friendlyId}
                      </small>
                    </div>
                  </td>
                  <td className="align-middle">
                    {item.type && item.type.name}
                  </td>
                  <td className="align-middle">
                    {item.status && item.status.name}
                  </td>
                  <td className="align-middle">{item.phone}</td>
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
                            from: "agents",
                            modal: true,
                            modalTitle: T.translate("agents.detail.title")
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        title={T.translate("agents.list.viewTooltip")}
                      >
                        <FontAwesomeIcon icon="eye" fixedWidth />
                      </Link>
                      <Link
                        className="btn btn-primary btn-sm"
                        to={{
                          pathname: `/${resourceNameOnApi}/update/${item.id}`,
                          state: {
                            modal: true,
                            modalTitle: T.translate("agents.form.title.update")
                          }
                        }}
                        title={T.translate("agents.list.editTooltip")}
                      >
                        <FontAwesomeIcon icon="pencil-alt" fixedWidth />
                      </Link>
                      {hasRoles(ROLE.ADMIN) && (
                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate("agents.list.deleteTooltip")}
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
        title={T.translate("agents.list.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.name
            : ""
        })}
        text={T.translate("agents.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "agents.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate("agents.list.deleteWarning.cancelButton")}
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

export default withHeader(AgentList);
