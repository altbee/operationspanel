import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import Dropdown from "../Dropdown";

configure({ adapter: new Adapter() });

describe("<Dropdown />", () => {
  const requiredProps = {
    list: ["first", "second", "third"],
    title: "Passed title",
    handleChange: () => "Something happened"
  };

  it("Renders correctly", () => {
    const rendered = shallow(<Dropdown {...requiredProps} />);
    expect(rendered.find(".dropdown-component").exists()).toBe(true);
    expect(rendered.find(".dropdown-label").text()).toEqual(
      requiredProps.title
    );
  });

  it("Renders with default props", () => {
    const trimmedProps = { ...requiredProps };
    delete trimmedProps.title;
    const rendered = shallow(<Dropdown {...trimmedProps} />);
    expect(rendered.find(".dropdown-label").exists()).toBe(false);
  });

  it("Renders the correct amount of items", () => {
    const rendered = shallow(<Dropdown {...requiredProps} />);
    const dropdownMenu = rendered.find(".dropdown-menu");
    expect(dropdownMenu.children().length).toBe(requiredProps.list.length);
  });

  it("Toggles the dropdown visibility on dropdown click", () => {
    const rendered = shallow(<Dropdown {...requiredProps} />);
    expect(rendered.state().opened).toBe(false);
    expect(rendered.find(".dropdown-menu").hasClass("show")).toBe(false);
    rendered.find(".dropdown-toggle").simulate("click");
    expect(rendered.state().opened).toBe(true);
    expect(rendered.find(".dropdown-menu").hasClass("show")).toBe(true);
  });

  it("Updates state and dropdown button text on selection", () => {
    const rendered = shallow(<Dropdown {...requiredProps} />);
    expect(rendered.state().selected).toBe(requiredProps.list[0]);
    rendered.find(".dropdown-toggle").simulate("click");
    rendered
      .find(".dropdown-menu")
      .childAt(2)
      .simulate("click");
    expect(rendered.state().selected).toBe(requiredProps.list[2]);
    expect(rendered.find(".dropdown-toggle").text()).toEqual(
      requiredProps.list[2]
    );
  });

  it("matches the snapshot", () => {
    const tree = shallow(<Dropdown {...requiredProps} />);
    expect(tree).toMatchSnapshot();
  });
});
