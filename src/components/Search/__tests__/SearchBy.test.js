import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import SearchBy from "../SearchBy";

configure({ adapter: new Adapter() });

const filters = [];
const classes = [];
const onDropdownChange = () => {};
const onSearch = () => {};

it("renders when props are defined", () => {
  const props = { filters, classes, onDropdownChange, onSearch };
  const rendered = shallow(<SearchBy {...props} />);
  expect(rendered.find(".search-component").exists()).toBe(true);
});
