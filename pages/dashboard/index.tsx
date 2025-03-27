import * as React from "react";
import { retrieveNotifications, optIn } from "../../utils/push";
import { useAccount, useWalletClient } from "wagmi";
import styles from "./dashboard.module.scss";
import cx from "classnames";
import Box from "@mui/material/Box";
import SEO from "../../components/common/Seo";
import Layout from "../../components/layout/LayoutDashboard";
import { Share } from "../../components/Share/Share";
import Link from "next/link";
import Image from "next/image";

const icons = ["🍕", "🎁", "🍹", "🎉"];

const Dashboard = () => {
  const [currentModal, setCurrentModal] = React.useState<any>(null);
  const [currentWoopId, setCurrentWoopId] = React.useState<string>("");
  const [currentDescription, setCurrentDescription] =
    React.useState<string>("");
  const [currentAmount, setCurrentAmount] = React.useState<string>("");
  const [currentToken, setCurrentToken] = React.useState<string>("");
  const { address, chain } = useAccount();
  const { data: signer } = useWalletClient();
  const [chainId, setChainId] = React.useState<string>("");
  const [isSubscribed, setIsSubscribed] = React.useState<boolean>(false);
  const [isShareActive, setIsShareActive] = React.useState<boolean>(false);
  const [notifications, setNotifications] = React.useState<any>([]);

  const retrieveData = async () => {
    const data = await retrieveNotifications(address);
    setNotifications(data);
  };

  const filteredNotifications = notifications.filter(
    (notification: any) => notification?.title === "Woop Payment Requested"
  );

  const activateNotifications = async () => {
    const res: any = await optIn(address, signer);
    if (res) {
      setIsSubscribed(true);
    }
  };

  React.useEffect(() => {
    retrieveData();
  }, []);

  React.useEffect(() => {
    if (address) {
      retrieveData();
    }
  }, [address]);

  React.useEffect(() => {
    if (chain) {
      setChainId(chain.name);
    }
  }, [chain]);

  const formatDate = (dateString: string) => {
    const [day, month] = dateString.split(" ");
    return `${day} ${month.slice(0, 3)}`;
  };

  return (
    <>
      <SEO
        title={"Woop | My Woops"}
        description={"View your payments requested and manage them."}
        rrssImg="./RRSS.jpg"
      />
      <Layout>
        {/* Main Dashboard Section */}
        <div
          className="overflow-y-scroll px-2"
          style={{
            height: `calc(55vh)`,
          }}
        >
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <p className="m-2 font-sans font-base text-gray-600">
                😞 You don’t have any recent Woops yet.
              </p>
              <p className="mb-4 font-sans text-sm text-gray-600">
                Create your first Woop by going to the{" "}
                <Link href="/" className="text-blue-600 underline">
                  home page
                </Link>{" "}
                or enable the dashboard to track your received payments.
              </p>
              {chainId == "Ethereum" ? (
                <button
                  type="button"
                  onClick={activateNotifications}
                  className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-all"
                >
                  📢 Enable Dashboard
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Please switch to the Mainnet network to enable the dashboard.
                </p>
              )}
            </div>
          ) : (
            notifications
              .filter(
                (notification: any) =>
                  notification?.title === "Woop Payment Requested"
              )
              .map((notification: any, index: any) => {
                const bodyParts = notification?.message.split(" ");
                const date = formatDate(bodyParts[0] + " " + bodyParts[1]);
                const networkName = bodyParts[11];
                const tokenName = bodyParts[8];
                const amount = bodyParts[7];
                const description = bodyParts.slice(13).join(" ");

                return (
                  <Box
                    key={index}
                    component="form"
                    className={cx(
                      styles.containerBoxNew,
                      "rounded-3xl shadow-md relative p-4 mt-3 w-full flex items-center mb-3"
                    )}
                  >
                    {/* Icon */}
                    <div className="flex items-center mr-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                        {icons[index % icons.length]}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex flex-col flex-1">
                      <p className="font-bold text-lg mb-1 text-black">
                        {description ? description : "new request"}
                      </p>
                      <div className="flex items-center text-sm text-slate-500">
                        <button
                          type="button"
                          className="bg-gray-200 text-black px-4 py-2 rounded-2xl shadow hover:bg-gray-300 flex items-center"
                          onClick={() => {
                            setCurrentModal(index);
                            setCurrentWoopId(notification?.notification.body);
                            setCurrentAmount(amount);
                            setCurrentDescription(description);
                            setCurrentToken(tokenName);
                            setIsShareActive(true);
                          }}
                        >
                          {amount == "allowPayerSelectAmount" ? "any" : amount}{" "}
                          {tokenName} on {networkName}
                        </button>
                      </div>
                    </div>
                    {/* Date */}
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-slate-500">{date}</p>
                    </div>

                    {currentModal === index && isShareActive && (
                      <div className="fixed inset-x-0 top-0 z-40">
                        <div
                          className="bg-white w-full rounded-3xl"
                          style={{ maxHeight: "85vh", overflowY: "auto" }}
                        >
                          <div className="p-4">
                            <Share
                              visibility={setIsShareActive}
                              path={currentWoopId}
                              amount={currentAmount}
                              description={currentDescription}
                              token={tokenName}
                              network={networkName}
                              address={address as string}
                            />
                          </div>
                        </div>
                        <div
                          className="fixed inset-0 bg-black bg-opacity-50 -z-10"
                          onClick={() => setIsShareActive(false)}
                        />
                      </div>
                    )}
                  </Box>
                );
              })
          )}
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;
