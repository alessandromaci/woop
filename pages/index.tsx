import * as React from "react";
import Layout from "../components/layout/Layout";
import Payment from "../components/Payment/Payment";
import SEO from "../components/common/Seo";
import { tokensDetails } from "../utils/constants";

export default function Home() {
  const [theme] = React.useState("white");
  const [logo] = React.useState("");
  const [buttonColor] = React.useState("#007BFF");

  const [currencies] = React.useState(
    tokensDetails.map((token) => token.label)
  );

  return (
    <>
      <SEO
        title="Woop | Create Cryptocurrency Payment Requests Easily"
        description="Woop is the easiest way to create, track, and receive cryptocurrency payment requests. Designed for both crypto natives and beginners."
      />
      <Layout>
        <Payment
          logo={logo}
          theme={theme}
          buttonColor={buttonColor}
          currencies={currencies}
        />
      </Layout>
    </>
  );
}
