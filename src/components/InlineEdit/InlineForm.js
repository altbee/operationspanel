import React, { Component } from "react";
import PropTypes from "prop-types";

const InlineFormContext = React.createContext();

class InlineForm extends Component {
  constructor(props) {
    super(props);

    this.updateField = (property, value) => {
      const { resource } = this.state;
      this.setState({
        resource: {
          ...resource,
          [property]: value
        }
      });
    };

    this.toggleEditing = () => {
      const { isEditing } = this.state;
      this.setState({ isEditing: !isEditing });
    };

    const { resource: originalResource } = this.props;

    this.state = {
      isEditing: false,
      resource: originalResource
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { resource: originalResource } = this.props;
    const { isEditing } = this.state;
    if (isEditing && !prevState.isEditing) {
      this.setState({
        resource: originalResource
      });
    }
  }

  render() {
    const { children, resource: originalResource } = this.props;
    const { isEditing, resource } = this.state;
    return (
      <InlineFormContext.Provider
        value={{
          updateField: this.updateField,
          toggleEditing: this.toggleEditing,
          isEditing,
          originalResource,
          resource
        }}
      >
        {children}
      </InlineFormContext.Provider>
    );
  }
}

InlineForm.propTypes = {
  resource: PropTypes.shape({}).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

const InlineFormConsumer = InlineFormContext.Consumer;

const withInlineForm = ChildComponent => {
  const InlineFormComponent = props => (
    <InlineFormContext.Consumer>
      {value => <ChildComponent {...props} inlineForm={value} />}
    </InlineFormContext.Consumer>
  );
  return InlineFormComponent;
};

export { InlineForm, InlineFormConsumer, withInlineForm };
export default InlineForm;
