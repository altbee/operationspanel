import React from "react";
import { Container } from "reactstrap";

export const Footer = () => (
  <footer className="app-footer">
    <Container>
      <div className="py-3 text-xs">
        <div className="text-right text-muted">
          &copy; 2018{" "}
          <a
            href="https://jakapp.co"
            className="text-muted"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jak Logistics
          </a>
        </div>
      </div>
    </Container>
  </footer>
);

export default Footer;
