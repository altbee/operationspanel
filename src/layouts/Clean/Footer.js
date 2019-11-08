import React from "react";
import { Container, Button } from "reactstrap";

const onClickLanguageButton = event => {
  localStorage.setItem("language", event.target.dataset.language);
  window.location.reload();
};

const languageButtons = [
  {
    label: "ENGLISH",
    languageCode: "en-US"
  },
  {
    label: "ARABIC",
    languageCode: "ar-SA"
  }
];

export const Footer = () => (
  <footer className="py-3 bg-purple-transparent">
    <Container
      fluid
      className="d-flex flex-row justify-content-around align-items-center"
    >
      <div>
        {languageButtons.map(button => (
          <Button
            className="border-0 mr-1"
            key={button.languageCode}
            data-language={button.languageCode}
            onClick={onClickLanguageButton}
            color="light"
            outline
          >
            {button.label}
          </Button>
        ))}
      </div>
      <div>
        &copy; {new Date().getFullYear()}{" "}
        <a href="https://jakapp.co">Jak Logistics</a>
      </div>
    </Container>
  </footer>
);

export default Footer;
