import React from "react";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { StatsCard } from "../StatsCard";

library.add(faCircleNotch);

configure({ adapter: new Adapter() });

describe("<StatsCard />", () => {
  const props = {
    statsText: "Hello World",
    icon: "circle-notch",
    statsValue: 5,
    className: "icon-class-name"
  };

  it("accepts props and renders", () => {
    const rendered = mount(<StatsCard {...props} />);
    expect(
      rendered.find(`FontAwesomeIcon[icon='${props.icon}']`).exists()
    ).toBe(true);
    expect(rendered.find(`FontAwesomeIcon.${props.className}`).exists()).toBe(
      true
    );
    expect(rendered.find("CardTitle").text()).toEqual(props.statsText);
    expect(rendered.find("CardSubtitle").text()).toEqual(
      props.statsValue.toString()
    );

    rendered.setProps({ statsValue: props.statsText });
    expect(rendered.find("CardSubtitle").text()).toEqual(props.statsText);
  });

  it("matches the snapshot", () => {
    const tree = mount(<StatsCard {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
