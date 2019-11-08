import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import T from "i18n-react";

const languageButtons = [
  {
    label: "English",
    languageCode: "en-US"
  },
  {
    label: "Arabic",
    languageCode: "ar-SA"
  }
];

export class LanguageSelectorNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectorIsOpen: false
    };

    this.toggleSelector = () => {
      const { selectorIsOpen } = this.state;
      this.setState({ selectorIsOpen: !selectorIsOpen });
    };
  }

  changeLanguage = language => {
    localStorage.setItem("language", language);
    window.location.reload();
  };

  render() {
    const { className } = this.props;
    const { selectorIsOpen } = this.state;
    return (
      <li
        className={`no-bg ${className ? className : ""} ${
          selectorIsOpen ? "active" : ""
        }`}
        {...this.props}
      >
        <button type="button" onClick={this.toggleSelector}>
          <span className={`nav-icon ${selectorIsOpen ? "text-primary" : ""}`}>
            <FontAwesomeIcon icon="language" fixedWidth />
          </span>
          <span className="nav-text">
            {T.translate("menu.sidebar.changeLanguage")}
            <small className="block text-muted">
              {languageButtons
                .filter(
                  lang => lang.languageCode === localStorage.getItem("language")
                )
                .map(language => language.label)}
            </small>
          </span>
        </button>
        <ul className="nav-sub">
          {languageButtons.map(language => (
            <li key={language.languageCode}>
              <button
                type="button"
                onClick={() => this.changeLanguage(language.languageCode)}
              >
                {language.languageCode === localStorage.getItem("language") && (
                  <i className="nav-label">
                    <span className="label label-xs no-bg">
                      <FontAwesomeIcon icon="check" />
                    </span>
                  </i>
                )}
                <span className="nav-text">{language.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </li>
    );
  }
}

export default LanguageSelectorNav;
