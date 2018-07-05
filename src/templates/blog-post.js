import React from "react";
import PropTypes from "prop-types";
import { kebabCase } from "lodash";
import {
  FacebookShareButton,
  GooglePlusShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookShareCount,
  GooglePlusShareCount,
  LinkedinShareCount,
  FacebookIcon,
  TwitterIcon,
  GooglePlusIcon,
  LinkedinIcon
} from "react-share";
import Helmet from "react-helmet";
import Link from "gatsby-link";
import Content, { HTMLContent } from "../components/Content";
require("prismjs/themes/prism-okaidia.css");
require(`katex/dist/katex.min.css`);

export const BlogPostTemplate = ({
  content,
  contentComponent,
  description,
  tags,
  title,
  helmet
}) => {
  const PostContent = contentComponent || Content;
  const iconSize = 36;
  const filter = count => (count > 0 ? count : "");
  const url = window.location.href;

  return (
    <section className="section">
      {helmet || ""}
      <div className="container content">
        <div className="columns">
          <div className="column is-10 is-offset-1">
            <h1 className="title is-size-2 has-text-weight-bold is-bold-light">
              {title}
            </h1>
            <p>{description}</p>
            <PostContent content={content} />
            <div style={{ marginTop: "20px" }} className="columns">
              <div className="column is-narrow is-offset-4">
                <TwitterShareButton url={url} title={title}>
                  <TwitterIcon round size={iconSize} />
                </TwitterShareButton>
              </div>
              <div className="column is-narrow">
                <FacebookShareButton
                  url={url}
                  quote={`${title} - ${description}`}
                  aria-label="Facebook share"
                >
                  <FacebookIcon round size={iconSize} />
                  <FacebookShareCount url={url}>
                    {count => (
                      <div className="share-count">{filter(count)}</div>
                    )}
                  </FacebookShareCount>
                </FacebookShareButton>
              </div>
              <div className="column is-narrow">
                <LinkedinShareButton
                  url={url}
                  title={title}
                  description={description}
                >
                  <LinkedinIcon round size={iconSize} />
                  <LinkedinShareCount url={url}>
                    {count => (
                      <div className="share-count">{filter(count)}</div>
                    )}
                  </LinkedinShareCount>
                </LinkedinShareButton>
              </div>
              <div className="column is-narrow">
                <a
                  href="http://b.hatena.ne.jp/entry/"
                  className="hatena-bookmark-button"
                  data-hatena-bookmark-layout="vertical-normal"
                  data-hatena-bookmark-lang="en"
                  title="このエントリーをはてなブックマークに追加"
                >
                  <img
                    src="https://b.st-hatena.com/images/entry-button/button-only@2x.png"
                    alt="このエントリーをはてなブックマークに追加"
                    width="20"
                    height="20"
                    style={{ border: "none" }}
                  />
                </a>
              </div>
            </div>
            {tags && tags.length ? (
              <div style={{ marginTop: `4rem` }}>
                <h4>Tags</h4>
                <ul className="taglist">
                  {tags.map(tag => (
                    <li key={tag + `tag`}>
                      <Link to={`/tags/${kebabCase(tag)}/`}>{tag}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

BlogPostTemplate.propTypes = {
  content: PropTypes.string.isRequired,
  contentComponent: PropTypes.func,
  description: PropTypes.string,
  title: PropTypes.string,
  helmet: PropTypes.instanceOf(Helmet)
};

const BlogPost = ({ data }) => {
  const { markdownRemark: post } = data;

  return (
    <BlogPostTemplate
      content={post.html}
      contentComponent={HTMLContent}
      description={post.frontmatter.description}
      helmet={<Helmet title={`${post.frontmatter.title} | Blog`} />}
      tags={post.frontmatter.tags}
      title={post.frontmatter.title}
    />
  );
};

BlogPost.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.object
  })
};

export default BlogPost;

export const pageQuery = graphql`
  query BlogPostByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        description
        tags
      }
    }
  }
`;
