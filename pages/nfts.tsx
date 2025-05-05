import * as React from "react";
import Layout from "../components/layout/LayoutPayment";
import SEO from "../components/common/Seo";

export default function NFTs() {
  const [activeModule, setActiveModule] = React.useState<
    "receive" | "invest" | "nfts"
  >("receive");
  const [buttonColor, setButtonColor] = React.useState("#007BFF");
  return (
    <>
      <SEO
        title="Woop | NFT Marketplace"
        description="Explore and trade NFTs with Woop. Coming soon!"
        rrssImg="./RRSS.jpg"
      />
      <Layout
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        buttonColor={buttonColor}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Coming Soon!</h1>
          <p className="text-gray-600">
            {`We're working on bringing you an amazing NFT experience.`}
          </p>
        </div>
      </Layout>
    </>
  );
}
