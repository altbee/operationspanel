import React from "react";
import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import SimpleLabel from "../SimpleLabel";

configure({ adapter: new Adapter() });

describe("<SimpleLabel />", () => {
  const colorList = ["red", "pink"];
  const textList = ["Hello World", "Hi there"];
  const defProps = {
    width: 100,
    title: ""
  };

  const props = {
    color: colorList[0],
    text: textList[0],
    width: 50,
    title: "title text"
  };

  it("renders when props are defined", () => {
    const rendered = shallow(<SimpleLabel {...props} />);

    expect(
      rendered.find(`div.simple-label-component.bg-${colorList[0]}`).exists()
    ).toBe(true);
    expect(rendered.find(`div[title='${props.title}']`).exists()).toBe(true);
    expect(rendered.find(`div.bg-${colorList[0]}`).text()).toEqual(textList[0]);
    expect(rendered.find(`div.bg-${colorList[0]}`).prop("style")).toEqual({
      width: "50px"
    });
  });

  it("renders default props when title and width are not supplied", () => {
    const rendered = shallow(
      <SimpleLabel color={colorList[1]} text={textList[1]} />
    );
    expect(
      rendered.find(`div.simple-label-component.bg-${colorList[1]}`).exists()
    ).toBe(true);
    expect(rendered.find(`div[title='${defProps.title}']`).exists()).toBe(true);
    expect(rendered.find(`div.bg-${colorList[1]}`).text()).toEqual(textList[1]);
    expect(rendered.find(`div.bg-${colorList[1]}`).prop("style")).toEqual({
      width: `${defProps.width}px`
    });
  });

  it("matches the snapshot", () => {
    const tree = shallow(<SimpleLabel {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
