import React, { Component } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { Link } from "react-router-dom";
import SweetAlert from "sweetalert2-react";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ROLE } from "common/constants/models/role";
import { hasRoles } from "../../components/Auth/AuthProvider";
import { Pagination } from "../../components/Pagination/Pagination";
import API from "../../components/API/API";
import Dropdown from "../../components/Dropdown/Dropdown";
import SearchBy from "../../components/Search/SearchBy";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class UserList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.dateOptions = [
      "View all",
      "Last 24 hours",
      "Last 3 days",
      "Last week",
      "This month",
      "Last month",
      "This year",
      "Last year"
    ];

    this.roleOptions = ["All"].concat(
      Object.keys(ROLE).map(roleKey => ROLE[roleKey].label)
    );

    this.searchFields = [
      { name: "Username", field: "username", type: "text" },
      { name: "Email", field: "email", type: "text" }
    ];

    this.sortFields = [
      { name: "username", field: "username" },
      { name: "createdAt", field: "createdAt" }
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
      resourceNameOnApi: "users",
      listItems: [],
      backupList: [],
      sortBy: {
        field: "",
        type: "",
        icon: ""
      },
      order: "username ASC",
      searchKeyword: "",
      selectedFilter: this.searchFields[0],
      dateOption: this.dateOptions[0],
      roleOption: this.roleOptions[0],
      searchParam: {
        filter: {
          where: {}
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

    this.getDateLimits = dateOption => {
      const today = new Date();

      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      let startDate;
      let endDate;

      switch (dateOption.toLowerCase()) {
        case "last 24 hours": {
          startDate = `${year}-${month}-${day - 1}`;
          endDate = `${year}-${month}-${day}`;
          break;
        }

        case "last 3 days": {
          startDate = `${year}-${month}-${day - 3}`;
          endDate = `${year}-${month}-${day}`;
          break;
        }

        case "last week": {
          startDate = `${year}-${month}-${day - 7}`;
          endDate = `${year}-${month}-${day}`;
          break;
        }

        case "this month": {
          startDate = `${year}-${month}-01`;
          endDate = `${year}-${month}-${day}`;
          break;
        }

        case "last month": {
          startDate = `${year}-${month - 1}-01`;
          endDate = `${year}-${month - 1}-31`;
          break;
        }

        case "this year": {
          startDate = `${year}-01-01`;
          endDate = `${year}-${month}-${day}`;
          break;
        }

        case "last year": {
          startDate = `${year - 1}-01-01`;
          endDate = `${year}-01-01`;
          break;
        }

        default:
          break;
      }

      return { startDate, endDate };
    };

    this.handleFilterChange = (key, value) => {
      this.setState({ [key]: value }, () => {
        const { searchKeyword, selectedFilter } = this.state;
        this.handleSearch(searchKeyword, selectedFilter);
      });
    };

    this.handleSearch = (data, filter) => {
      const { dateOption, roleOption } = this.state;
      let params;
      if (data) {
        const { field } = filter;
        params = {
          filter: {
            where: {
              [field]: { ilike: `%${data}%` }
            }
          }
        };
      } else {
        params = { filter: { where: {} } };
      }

      if (dateOption !== this.dateOptions[0]) {
        const { startDate, endDate } = this.getDateLimits(dateOption);
        params.filter.where.createdAt = { between: [startDate, endDate] };
      }

      if (roleOption !== this.roleOptions[0]) {
        const roleId = this.getRoleIdByLabel(roleOption);
        if (roleId) params.filter.where.roleId = roleId;
      }

      this.setState(
        {
          searchParam: params,
          searchKeyword: data
        },
        () => {
          this.pagination.current.fetchItemCount();
        }
      );
    };

    this.getRoleIdByLabel = label => {
      const [foundRole] = Object.keys(ROLE).filter(
        roleKey => ROLE[roleKey].label === label
      );
      return ROLE[foundRole] ? ROLE[foundRole].id : null;
    };
  }

  componentDidMount() {
    const { resourceNameOnApi } = this.state;
    const { header } = this.props;
    header.setTitle(
      T.translate("users.list.title"),
      T.translate("users.list.description")
    );
    header.setActions([
      <Link
        to={{
          pathname: `/${resourceNameOnApi}/create`,
          state: {
            modal: true,
            modalSize: "md",
            modalTitle: T.translate("users.form.title.create")
          }
        }}
        className="btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="plus" /> {T.translate("users.list.add")}
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
      <Container key="user-list-container" className="pt-3">
        <div className="box">
          <Container className="py-3">
            <Row className="justify-content-center">
              <Col md={3} sm={6}>
                <Dropdown
                  title="Created At"
                  list={this.dateOptions}
                  handleChange={value =>
                    this.handleFilterChange("dateOption", value)
                  }
                />
              </Col>
              <Col md={3} sm={6}>
                <Dropdown
                  title="Role"
                  list={this.roleOptions}
                  handleChange={value =>
                    this.handleFilterChange("roleOption", value)
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
                    onClick={() => this.handleSortChange("username")}
                  >
                    {T.translate("users.fields.username")}
                    {this.getIcon("username")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    onKeyPress={() => {}}
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("roles")}
                  >
                    {T.translate("users.fields.roles")}
                    {this.getIcon("roles")}
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
                  <td>{item.username}</td>
                  <td>
                    {T.translate(
                      `users.fields.roleList.${
                        item.roles[0] ? item.roles[0].name : "user"
                      }`
                    )}
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
                            modalTitle: T.translate("users.detail.title")
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        title={T.translate("users.list.viewTooltip")}
                      >
                        <FontAwesomeIcon icon="eye" fixedWidth />
                      </Link>
                      <Link
                        className="btn btn-primary btn-sm"
                        to={{
                          pathname: `/${resourceNameOnApi}/update/${item.id}`,
                          state: {
                            modal: true,
                            modalSize: "md",
                            modalTitle: T.translate("users.form.title.update")
                          }
                        }}
                        title={T.translate("users.list.editTooltip")}
                      >
                        <FontAwesomeIcon icon="pencil-alt" fixedWidth />
                      </Link>
                      {hasRoles(ROLE.ADMIN) && (
                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate("users.list.deleteTooltip")}
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
        title={T.translate("users.list.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.username
            : ""
        })}
        text={T.translate("users.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "users.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate("users.list.deleteWarning.cancelButton")}
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

export default withHeader(UserList);
