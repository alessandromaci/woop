import * as React from "react";
import Layout from "../components/Layout";
import Payment from "../components/Payment/Payment";
import SEO from "../components/Seo";

export default function Home() {
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
