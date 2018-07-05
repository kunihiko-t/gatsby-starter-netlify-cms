import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";

import Navbar from "../components/Navbar";
import "./all.sass";

const TemplateWrapper = ({ children }) => (
  <div>
    <Helmet title="Home | Gatsby + Netlify CMS">
      <script
        type="text/javascript"
        src="https://b.st-hatena.com/js/bookmark_button.js"
        charset="utf-8"
        async="async"
      />
    </Helmet>
    <Navbar />
    <div>{children()}</div>
  </div>
);

TemplateWrapper.propTypes = {
  children: PropTypes.func
};

export default TemplateWrapper;
