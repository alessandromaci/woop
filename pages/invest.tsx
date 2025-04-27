import * as React from "react";
import Layout from "../components/layout/LayoutPayment";
import SEO from "../components/common/Seo";

export default function Invest() {
  const [activeModule, setActiveModule] = React.useState<
    "receive" | "invest" | "nfts"
  >("receive");
  return (
    <>
      <SEO
        title="Woop | Invest in Cryptocurrency"
        description="Invest in cryptocurrency easily with Woop. Coming soon!"
        rrssImg="./RRSS.jpg"
      />
      <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Coming Soon!</h1>
          <p className="text-gray-600">
            {`We're working hard to bring you the best investment experience.`}
          </p>
        </div>
      </Layout>
    </>
  );
}
