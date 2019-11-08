import React from "react";
import { HashRouter, Route } from "react-router-dom";
import T from "i18n-react";
import DirectionProvider, {
  DIRECTIONS
} from "react-with-direction/dist/DirectionProvider";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import MapLoader from "./components/Maps/MapLoader";
import { AuthProvider } from "./components/Auth/AuthProvider";
import ModalSwitch from "./components/ModalSwitch/ModalSwitch";
import emitter from "./components/EventEmitter/EventEmitter";
import i18nAr from "./i18n/ar.json";
import i18nEn from "./i18n/en.json";

import "animate.css/animate.min.css";
import "./assets/sass/theme.scss";

library.add(fas);

let language =
  localStorage.getItem("language") ||
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  navigator.userLanguage;

localStorage.setItem("language", language);

if (language.length > 2) {
  language = language.substr(0, 2);
}

let textDirection;

switch (language) {
  case "ar":
    T.setTexts(i18nAr);
    textDirection = DIRECTIONS.RTL;
    break;
  case "en":
  default:
    T.setTexts(i18nEn);
    textDirection = DIRECTIONS.LTR;
    break;
}

const App = () => (
  <MapLoader
    libraries={["geometry", "drawing", "places"]}
    apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
  >
    <AuthProvider>
      <DirectionProvider direction={textDirection}>
        <HashRouter>
          <Route
            render={props => <ModalSwitch emitter={emitter} {...props} />}
          />
        </HashRouter>
      </DirectionProvider>
    </AuthProvider>
  </MapLoader>
);

export default App;
