import React from "react";
import { FormGroup, ControlLabel, FormControl, Row } from "react-bootstrap";

function FieldGroup({ label, ...props }) {
  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
    </FormGroup>
  );
}

export const FormInputs = props => {
  const row = [];
  for (let i = 0; i < props.ncols.length; i += 1) {
    const fieldGroup = (
      <div key={i} className={props.ncols[i]}>
        <FieldGroup {...props.proprieties[i]} />
      </div>
    );
    row.push(fieldGroup);
  }
  return <Row>{row}</Row>;
};

export default FormInputs;
