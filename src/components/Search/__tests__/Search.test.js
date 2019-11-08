import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { Search } from "../Search";

configure({ adapter: new Adapter() });

describe("<Search />", () => {
  const handleChange = value => value;
  const hWord = "Hello World";
  const props = { handleChange, placeholder: hWord };

  it("renders with all props defined", () => {
    const rendered = shallow(<Search {...props} />);
    expect(rendered.find("input").props().placeholder).toBe(hWord);
  });

  it("renders with default props", () => {
    const rendered = shallow(<Search handleChange={handleChange} />);
    expect(rendered.find("input").props().placeholder).toBe("Search Term");
  });

  it("calls the defined handleChange function", () => {
    const onChangeMocked = jest.fn();
    const e = {
      preventDefault() {},
      target: { value: "called" }
    };

    const rendered = shallow(<Search handleChange={onChangeMocked} />);
    rendered.find("input").simulate("change", e);
    expect(onChangeMocked).toBeCalledWith(e.target.value);
  });

  it("matches the snapshot", () => {
    const tree = shallow(<Search {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
