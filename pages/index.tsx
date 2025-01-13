import * as React from "react";
import Layout from "../components/layout/Layout";
import Payment from "../components/Payment/Payment";
import ConfigMenu from "../components/ConfigMenu";
import SEO from "../components/common/Seo";

export default function Home() {
  const [theme, setTheme] = React.useState("white");
  const [logo, setLogo] = React.useState("/default_logo.png");

  return (
    <>
      <SEO
        title="Woop | Create Cryptocurrency Payment Requests Easily"
        description="Woop is the easiest way to create, track, and receive cryptocurrency payment requests. Designed for both crypto natives and beginners."
      />
      <Layout>
        <Payment />
      </Layout>
    </>
  );
}
