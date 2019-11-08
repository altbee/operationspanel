import React, { Component } from "react";
import PropTypes from "prop-types";
import { Input } from "reactstrap";
import { withInlineForm } from "./InlineForm";

class InlineField extends Component {
  constructor(props) {
    super(props);

    this.handleInputChange = event => {
      const { inlineForm } = this.props;
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

      inlineForm.updateField(name, value);
    };
  }

  render() {
    const {
      render,
      type,
      placeholder,
      property,
      inlineForm: { isEditing, resource, originalResource }
    } = this.props;

    if (isEditing) {
      switch (type) {
        case "text":
        case "email":
        case "number":
        default:
          return (
            <Input
              type={["email", "number"].includes(type) ? type : "text"}
              name={property}
              placeholder={placeholder}
              value={resource[property]}
              onChange={this.handleInputChange}
            />
          );
      }
    }

    if (render) {
      return render(originalResource);
    }

    return <span>{originalResource[property]}</span>;
  }
}

InlineField.propTypes = {
  property: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  render: PropTypes.func
};

InlineField.defaultProps = {
  placeholder: "",
  type: "text",
  render: null
};

export default withInlineForm(InlineField);
