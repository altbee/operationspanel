import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import InlineLoader from "../InlineLoader";

configure({ adapter: new Adapter() });

describe("<InlineLoader />", () => {
  const props = {
    visible: true,
    className: "test-classname"
  };

  it("accepts props and renders", () => {
    const rendered = shallow(<InlineLoader {...props} />);
    expect(rendered.find("span").hasClass("")).toEqual(true);
    expect(
      rendered.find(`span > FontAwesomeIcon.${props.className}`).exists()
    ).toBe(true);
  });

  it("loads with default props", () => {
    const rendered = shallow(<InlineLoader />);
    expect(rendered.find("span").hasClass("d-none")).toEqual(true);
    expect(rendered.find(`span > i.${props.className}`).exists()).toBe(false);
  });

  it("matches the snapshot", () => {
    const tree = shallow(<InlineLoader {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
