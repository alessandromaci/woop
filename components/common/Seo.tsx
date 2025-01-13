import React from "react";
import Head from "next/head";

function buildMetaTitle(title: string) {
  return !!title ? <title>{title}</title> : null;
}

function buildMetaDescription(description: string) {
  return !!description ? (
    <meta name="description" content={description} />
  ) : null;
}

interface SEO_Props {
  title?: string;
  description?: string;
  rrssImg?: string;
  children?: any;
}

const defaultProps = {};

const SEO: React.FC<SEO_Props> = (props) => {
  let { title, description, rrssImg = "https://www.wooppay.xyz/" } = props;

  let url = "https://www.wooppay.xyz/";

  const twitterHandler = "@woop_pay";

  return (
    <Head>
      {/* <html lang="en" /> */}
      {props.children}
      <link rel="icon" href="../icon.svg" />
      {title && buildMetaTitle(title)}
      {description && buildMetaDescription(description)}
      <link rel="canonical" href={url} />
      {/* FACEBOOK */}

      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={rrssImg} />
      {/*<meta property="og:image:width"              content="pixels" /> CHANGE AMMOUT*/}
      {/*<meta property="og:image:height"              content="pixels" /> CHANGE AMMOUT*/}
      {/*<meta property="og:image:type" content="image/jpeg | image/gif | image/png" /> CHANGE AMMOUT*/}

      {/*TWITTER*/}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={rrssImg} />
      <meta name="twitter:site" content={url} />
      <meta name="twitter:creator" content={twitterHandler} />
    </Head>
  );
};

SEO.defaultProps = defaultProps;

export default SEO;
