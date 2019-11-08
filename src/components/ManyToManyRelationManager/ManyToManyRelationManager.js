import React, { Component } from "react";
import { Table, Button } from "reactstrap";
import PropTypes from "prop-types";
import SweetAlert from "sweetalert2-react";
import Select from "react-select";
import T from "i18n-react";
import get from "get-value";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import API from "../API/API";
import Loader from "../Loader/Loader";

export default class ManyToManyRelationManager extends Component {
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
      const { resourceEndPoint, resourceId, relationEndPoint } = this.props;
      const response = await this.API.get(
        `/${resourceEndPoint}/${resourceId}/${relationEndPoint}`,
        {
          params: {
            filter: {
              fields: ["id"].concat(this.extractFieldsFromItemText()),
              order: "id",
              include: this.extractIncludesFromItemText()
            }
          }
        }
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
      const { resourceEndPoint, resourceId, relationEndPoint } = this.props;
      await this.API.delete(
        `/${resourceEndPoint}/${resourceId}/${relationEndPoint}/rel/${id}`
      );
      this.updateList();
    };

    this.addOptionToRelationList = async selectedOption => {
      if (!selectedOption.value) return;
      const id = selectedOption.value;
      const { resourceEndPoint, resourceId, relationEndPoint } = this.props;
      this.setState({ isLoading: true });
      try {
        await this.API.put(
          `/${resourceEndPoint}/${resourceId}/${relationEndPoint}/rel/${id}`
        );
        this.updateList();
        this.setState({
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
      const { resourceEndPoint, nameProperty } = this.props;
      let { relationEndPoint } = this.props;

      if (resourceEndPoint === "agents" && relationEndPoint === "tags") {
        relationEndPoint = "agentTags";
      }

      if (
        resourceEndPoint === "routes" &&
        relationEndPoint === "requiredAgentTags"
      ) {
        relationEndPoint = "agentTags";
      }

      const response = await this.API.get(`/${relationEndPoint}`, {
        params: {
          filter: {
            fields: ["id", nameProperty],
            order: "id"
          }
        }
      });
      const availableOptions = [];
      const selectOptions = [];
      response.data.forEach(item => {
        const { translate } = this.props;
        const { listItems } = this.state;

        const option = {
          value: item.id,
          label: translate
            ? T.translate(`${translate}.${item[nameProperty]}`)
            : item[nameProperty]
        };

        availableOptions.push(option);

        let shouldAdd = true;

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

    this.extractFieldsFromItemText = () => {
      const { itemText } = this.props;
      const searchPattern = /{{(.*?)}}/g;
      const searchResult = itemText.match(searchPattern);
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

    this.extractIncludesFromItemText = () => {
      const { itemText } = this.props;
      if (itemText.indexOf(".") === -1) {
        return [];
      }

      const includesList = [];
      const searchPattern = /{{(.*?)}}/g;
      const searchResult = itemText.match(searchPattern);

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

    this.parseItemText = item => {
      const { itemText, translate } = this.props;
      const searchPattern = /{{(.*?)}}/g;
      const searchResult = itemText.match(searchPattern);
      let output = itemText;

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
    this.updateList();
    const { readOnly } = this.props;
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
      readOnly,
      title,
      relationLabel,
      category,
      nameProperty
    } = this.props;

    let itemsList = (
      <Table striped hover className="mb-0">
        <tbody>
          {listItems.map(item => (
            <tr key={item.id}>
              <td>{this.parseItemText(item)}</td>
              {!readOnly && (
                <td className="text-right py-0 align-middle">
                  <div className="btn-group" role="group">
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
      <div className="box" key="many-to-many-relation-manager-box">
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
            ? selectedItemToBeDeleted[nameProperty]
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
            ? selectedItemToBeDeleted[nameProperty]
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

ManyToManyRelationManager.propTypes = {
  resourceEndPoint: PropTypes.string.isRequired,
  resourceId: PropTypes.number.isRequired,
  relationEndPoint: PropTypes.string.isRequired,
  relationLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  itemText: PropTypes.string,
  nameProperty: PropTypes.string,
  translate: PropTypes.string
};

ManyToManyRelationManager.defaultProps = {
  readOnly: false,
  itemText: "{{name}}",
  nameProperty: "name",
  translate: null
};
