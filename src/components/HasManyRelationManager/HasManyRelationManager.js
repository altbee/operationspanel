import React, { Component } from "react";
import { Table, Button } from "reactstrap";
import PropTypes from "prop-types";
import SweetAlert from "sweetalert2-react";
import Select from "react-select";
import T from "i18n-react";
import { Link } from "react-router-dom";
import get from "get-value";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import API from "../API/API";
import Loader from "../Loader/Loader";

export default class HasManyRelationManager extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      listItems: [],
      showDeletionConfirmation: false,
      showRelationDeletedAlert: false,
      showRelationAddedAlert: false,
      showRelationCouldNotBeSavedAlert: false,
      reasonWhyItCouldNotBeSaved: "",
      availableOptions: [],
      selectOptions: [],
      selectedOption: null,
      isLoading: false
    };

    this.updateList = async () => {
      const {
        resourceEndPoint,
        resourceId,
        relationEndPoint,
        itemText,
        include,
        fields
      } = this.props;
      const params = {
        filter: {}
      };
      if (typeof itemText === "function") {
        params.filter = {
          fields: ["id", ...fields],
          order: "id",
          include
        };
      } else {
        params.filter = {
          fields: ["id"].concat(this.extractFieldsFromItemText(itemText)),
          order: "id",
          include: this.extractIncludesFromItemText(itemText)
        };
      }
      const response = await this.API.get(
        `/${resourceEndPoint}/${resourceId}/${relationEndPoint}`,
        { params }
      );
      this.setState({ listItems: response.data }, () => {
        this.removeSelectOptionsAlreadyOnList();
      });
    };

    this.removeSelectOptionsAlreadyOnList = () => {
      const selectOptions = [];
      const { availableOptions } = this.state;
      availableOptions.forEach(item => {
        let shouldAdd = true;

        const { listItems } = this.state;

        if (listItems && listItems.find(x => x.id === item.value)) {
          shouldAdd = false;
        }

        if (shouldAdd) {
          selectOptions.push(item);
        }
      });
      this.setState({ selectOptions });
    };

    this.delete = async id => {
      const { relationEndPoint, relationAttribute } = this.props;
      await this.API.patch(`/${relationEndPoint}/${id}`, {
        [relationAttribute]: null
      });
      this.updateList();
      this.fetchOptions();
    };

    this.addOptionToRelationList = async selectedOption => {
      if (!selectedOption.value) return;
      const id = selectedOption.value;
      const data = {};
      const { relationAttribute, resourceId, relationEndPoint } = this.props;
      data[relationAttribute] = resourceId;
      this.setState({ isLoading: true });
      try {
        await this.API.patch(`/${relationEndPoint}/${id}`, data);
        this.updateList();
        this.setState({
          isLoading: false,
          showRelationAddedAlert: true
        });
      } catch (error) {
        this.setState({
          showRelationCouldNotBeSavedAlert: true,
          reasonWhyItCouldNotBeSaved: get(
            error,
            "response.data.error.message",
            ""
          )
        });
      }
      this.setState({
        isLoading: false
      });
    };

    this.fetchOptions = async () => {
      const {
        relationEndPoint,
        optionText,
        include,
        fields,
        optionFilter
      } = this.props;
      const params = {
        filter: {}
      };
      if (typeof optionText === "function") {
        params.filter = {
          fields: ["id", ...fields],
          order: "id",
          include,
          ...optionFilter
        };
      } else {
        params.filter = {
          fields: ["id"].concat(this.extractFieldsFromItemText(optionText)),
          order: "id",
          include: this.extractIncludesFromItemText(optionText),
          ...optionFilter
        };
      }
      const response = await this.API.get(`/${relationEndPoint}`, { params });
      const availableOptions = [];
      const selectOptions = [];
      response.data.forEach(item => {
        const option = {
          value: item.id,
          label: this.parseText(item, optionText)
        };

        availableOptions.push(option);

        let shouldAdd = true;

        const { listItems } = this.state;

        if (listItems && listItems.find(x => x.id === option.value)) {
          shouldAdd = false;
        }

        if (shouldAdd) {
          selectOptions.push(option);
        }
      });
      this.setState({ selectOptions, availableOptions });
    };

    this.onDeleteConfirmation = async () => {
      const { selectedItemToBeDeleted } = this.state;
      await this.delete(selectedItemToBeDeleted.id);
      this.setState({
        showDeletionConfirmation: false,
        showRelationDeletedAlert: true
      });
    };

    this.onCloseRelationDeletedAlert = () => {
      this.setState({
        showRelationDeletedAlert: false,
        selectedItemToBeDeleted: null
      });
    };

    this.onCloseRelationAddedAlert = () => {
      this.setState({
        showRelationAddedAlert: false
      });
    };

    this.onCloseRelationCouldNotBeSavedAlert = () => {
      this.setState({
        showRelationCouldNotBeSavedAlert: false,
        reasonWhyItCouldNotBeSaved: ""
      });
    };

    this.extractFieldsFromItemText = text => {
      const searchPattern = /{{(.*?)}}/g;
      const searchResult = text.match(searchPattern);
      const fields = [];

      if (searchResult) {
        searchResult.forEach(result => {
          const resultWithoutCurlyBraces = result
            .replace("{{", "")
            .replace("}}", "");
          const resultHasDotCharacter =
            resultWithoutCurlyBraces.indexOf(".") > -1;

          if (resultHasDotCharacter) {
            fields.push(`${resultWithoutCurlyBraces.split(".")[0]}Id`);
          } else {
            fields.push(resultWithoutCurlyBraces);
          }
        });
      }

      return fields;
    };

    this.extractIncludesFromItemText = text => {
      if (text.indexOf(".") === -1) return [];

      const includesList = [];
      const searchPattern = /{{(.*?)}}/g;
      const searchResult = text.match(searchPattern);

      if (searchResult) {
        searchResult.forEach(result => {
          const resultWithoutCurlyBraces = result
            .replace("{{", "")
            .replace("}}", "");
          const resultHasDotCharacter =
            resultWithoutCurlyBraces.indexOf(".") > -1;

          if (resultHasDotCharacter) {
            includesList.push(resultWithoutCurlyBraces.split(".")[0]);
          }
        });
      }

      return includesList;
    };

    this.parseText = (item, text) => {
      if (typeof text === "function") {
        return text(item);
      }

      const searchPattern = /{{(.*?)}}/g;
      const searchResult = text.match(searchPattern);
      let output = text;

      if (searchResult) {
        searchResult.forEach(result => {
          const resultWithoutCurlyBraces = result
            .replace("{{", "")
            .replace("}}", "");
          const resultHasDotCharacter =
            resultWithoutCurlyBraces.indexOf(".") > -1;
          let itemValue = item[resultWithoutCurlyBraces];

          if (resultHasDotCharacter) {
            const resultParts = resultWithoutCurlyBraces.split(".");
            itemValue = item[resultParts[0]][resultParts[1]];
          }

          const { translate } = this.props;

          if (translate) {
            itemValue = T.translate(`${translate}.${itemValue}`);
          }

          output = output.replace(result, itemValue);
        });
      }

      return output;
    };
  }

  componentDidMount() {
    const { readOnly } = this.props;
    this.updateList();
    if (!readOnly) this.fetchOptions();
  }

  render() {
    const {
      listItems,
      selectedOption,
      showDeletionConfirmation,
      selectOptions,
      showRelationDeletedAlert,
      showRelationAddedAlert,
      selectedItemToBeDeleted,
      isLoading,
      showRelationCouldNotBeSavedAlert,
      reasonWhyItCouldNotBeSaved
    } = this.state;

    const {
      relationDetailRoute,
      readOnly,
      title,
      relationLabel,
      category,
      itemText,
      defaultProperty
    } = this.props;

    let itemsList = (
      <Table striped hover className="mb-0">
        <tbody>
          {listItems.map(item => (
            <tr key={item.id}>
              <td>{this.parseText(item, itemText)}</td>
              {(relationDetailRoute || !readOnly) && (
                <td className="text-right py-0 align-middle">
                  <div className="btn-group" role="group">
                    {relationDetailRoute && (
                      <Link
                        id={`details-${item.id}`}
                        className="btn btn-sm btn-primary"
                        to={`${relationDetailRoute}/${item.id}`}
                        title={T.translate(
                          "components.relationManager.detailRelation"
                        )}
                      >
                        <FontAwesomeIcon icon="eye" fixedWidth />
                      </Link>
                    )}
                    {!readOnly && (
                      <Button
                        size="sm"
                        color="primary"
                        title={T.translate(
                          "components.relationManager.removeRelation"
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
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    );

    let addItem = (
      <div className="border-top p-3">
        <Select
          placeholder={T.translate("components.relationManager.addRelation", {
            relationLabel
          })}
          value={selectedOption}
          onChange={this.addOptionToRelationList}
          options={selectOptions}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    );

    if (listItems.length === 0) {
      itemsList = (
        <div className="p-3">
          <em className="text-muted">
            {T.translate("components.relationManager.empty")}
          </em>
        </div>
      );
    }

    if (readOnly) {
      addItem = null;
    }

    return [
      <div className="box" key="has-many-relation-manager-box">
        <div className="box-header">
          <h2 className="text-secondary">{title}</h2>
          <small>{category}</small>
        </div>
        <div>
          {itemsList}
          {addItem}
        </div>
      </div>,
      <SweetAlert
        key="sweet-alert-deletion-confirmation"
        show={showDeletionConfirmation}
        title={T.translate("components.relationManager.removeWarning.title", {
          relationLabel,
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted[defaultProperty]
            : ""
        })}
        text={T.translate("components.relationManager.removeWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "components.relationManager.removeWarning.confirmButton"
        )}
        cancelButtonText={T.translate(
          "components.relationManager.removeWarning.cancelButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        cancelButtonClass="btn btn-secondary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={this.onDeleteConfirmation}
        onCancel={this.onCancelConfirmation}
      />,
      <SweetAlert
        key="sweet-alert-relation-deleted"
        show={showRelationDeletedAlert}
        title={T.translate("components.relationManager.removedAlert.title", {
          relationLabel,
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted[defaultProperty]
            : ""
        })}
        type="success"
        confirmButtonText={T.translate(
          "components.relationManager.removedAlert.confirmButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={this.onCloseRelationDeletedAlert}
      />,
      <SweetAlert
        key="sweet-alert-relation-added"
        show={showRelationAddedAlert}
        title={T.translate("components.relationManager.addedAlert.title")}
        type="success"
        confirmButtonText={T.translate(
          "components.relationManager.addedAlert.confirmButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={this.onCloseRelationAddedAlert}
      />,
      <SweetAlert
        key="sweet-alert-could-not-be-saved"
        show={showRelationCouldNotBeSavedAlert}
        title={T.translate(
          "components.relationManager.couldNotBeSavedAlert.title"
        )}
        text={reasonWhyItCouldNotBeSaved}
        type="error"
        confirmButtonText={T.translate(
          "components.relationManager.couldNotBeSavedAlert.confirmButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={this.onCloseRelationCouldNotBeSavedAlert}
      />,
      <Loader key="loader-relation" visible={isLoading} />
    ];
  }
}

HasManyRelationManager.propTypes = {
  resourceEndPoint: PropTypes.string.isRequired,
  resourceId: PropTypes.number.isRequired,
  relationEndPoint: PropTypes.string.isRequired,
  relationAttribute: PropTypes.string.isRequired,
  relationLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  itemText: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  optionText: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  fields: PropTypes.array,
  include: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  optionFilter: PropTypes.shape({}),
  defaultProperty: PropTypes.string,
  relationDetailRoute: PropTypes.string,
  translate: PropTypes.string
};

HasManyRelationManager.defaultProps = {
  readOnly: false,
  itemText: "{{name}}",
  optionText: "{{name}}",
  fields: [],
  include: [],
  optionFilter: {},
  defaultProperty: "name",
  relationDetailRoute: null,
  translate: null
};
