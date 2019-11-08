import React from "react";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { CustomButton } from "../CustomButton";

configure({ adapter: new Adapter() });

describe("<CustomButton />", () => {
  const requiredProps = {
    fill: true,
    simple: true,
    pullRight: true,
    round: true,
    block: true
  };

  const rest = {
    disabled: true
  };

  const rendered = mount(<CustomButton {...requiredProps} />);

  it("renders with expected required props", () => {
    expect(rendered.find("button").hasClass("btn-fill")).toEqual(true);
    expect(rendered.find("button").hasClass("btn-simple")).toEqual(true);
    expect(rendered.find("button").hasClass("pull-right")).toEqual(true);
    expect(rendered.find("button").hasClass("btn-block")).toEqual(true);
    expect(rendered.find("button").hasClass("btn-round")).toEqual(true);
  });

  it("does not apply classes to child if props are false", () => {
    rendered.setProps({ simple: false, round: false });
    expect(rendered.find("button").hasClass("btn-simple")).toEqual(false);
    expect(rendered.find("button").hasClass("btn-round")).toEqual(false);
  });

  it("passes down the rest object props to child", () => {
    const wrapper = mount(<CustomButton {...requiredProps} {...rest} />);
    expect(wrapper.find("button[disabled=true]").exists()).toBe(true);
  });

  it("matches the snapshot", () => {
    const tree = mount(<CustomButton {...requiredProps} />);
    expect(tree).toMatchSnapshot();
  });
});
