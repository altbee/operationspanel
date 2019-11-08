import React from "react";
import { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import CustomCheckbox from "../CustomCheckbox";

configure({ adapter: new Adapter() });

describe("<CustomCheckbox /> ", () => {
  const definedProps = {
    isChecked: true,
    number: 150,
    label: "label text",
    inline: true
  };

  const rest = {
    disabled: true
  };

  it("renders properly", () => {
    const rendered = shallow(<CustomCheckbox />);
    expect(rendered.find("div").exists()).toBe(true);
    expect(rendered.find("div").hasClass("checkbox")).toBe(true);
    expect(rendered.find("div").hasClass("checkbox-inline")).toBe(false);
    expect(rendered.find("div").children().length).toEqual(1);
    expect(rendered.find("label").exists()).toBe(true);
    expect(
      rendered
        .find("div")
        .children()
        .children().length
    ).toEqual(1);
    expect(rendered.find("input").exists()).toBe(true);
  });

  it("accepts props and renders", () => {
    const rendered = shallow(<CustomCheckbox {...definedProps} />);
    expect(rendered.find("div").hasClass("checkbox-inline")).toBe(true);
    expect(
      rendered.find(`label[htmlFor=${definedProps.number}]`).exists()
    ).toBe(true);
    expect(rendered.find("label").text()).toEqual(definedProps.label);
    expect(rendered.find(`input[id=${definedProps.number}]`).exists()).toBe(
      true
    );
  });

  it("accepts {rest} object as props", () => {
    const rendered = shallow(<CustomCheckbox {...definedProps} {...rest} />);
    expect(rendered.find("[disabled=true]").exists()).toBe(true);
  });

  it("updates the state onChange", () => {
    const rendered = mount(<CustomCheckbox {...definedProps} />);
    expect(rendered.state().isCheckedFromProps).toBe(true);
    rendered.find('[type="checkbox"]').simulate("change");
    expect(rendered.state().isCheckedFromProps).toBe(false);
  });

  it("matches the snapshot", () => {
    const tree = shallow(<CustomCheckbox {...definedProps} />);
    expect(tree).toMatchSnapshot();
  });
});
