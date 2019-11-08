import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ForbiddenPage = () => (
  <Card className="box-shadow-z5 text-color m-a rounded">
    <CardBody className="text-center">
      <h1 style={{ fontSize: "50px" }}>
        <FontAwesomeIcon icon="user-lock" className="text-muted" />
      </h1>
      <CardTitle>{T.translate("error.forbidden.title")}</CardTitle>
      <CardSubtitle className="font-weight-normal">
        {T.translate("error.forbidden.message")}
      </CardSubtitle>
      <Link
        to="/"
        className="btn btn-primary btn-rounded btn-block rounded mt-4"
      >
        {T.translate("defaults.goBack")}
      </Link>
    </CardBody>
  </Card>
);

export default ForbiddenPage;
