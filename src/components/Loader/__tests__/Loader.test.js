import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import Loader from "../Loader";

configure({ adapter: new Adapter() });

describe("<Loader />", () => {
  it("accepts props and renders", () => {
    const rendered = shallow(<Loader visible />);
    expect(rendered.find(".loader-overlay").exists()).toBe(true);
  });

  it("does not show with default props", () => {
    const rendered = shallow(<Loader />);
    expect(rendered.find(".loader-overlay").exists()).toBe(false);
  });

  it("matches the snapshot", () => {
    const tree = shallow(<Loader visible />);
    expect(tree).toMatchSnapshot();
  });
});
