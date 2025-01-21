import * as React from "react";
import { retrieveNotifications } from "../../utils/push";
import { useAccount } from "wagmi";
import styles from "./dashboard.module.scss";
import cx from "classnames";
import Box from "@mui/material/Box";
import SEO from "../../components/common/Seo";
import Layout from "../../components/layout/LayoutReceive";
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
  const { address } = useAccount();

  const [isShareActive, setIsShareActive] = React.useState<boolean>(false);
  const [notifications, setNotifications] = React.useState<any>([]);

  const retrieveData = async () => {
    const data = await retrieveNotifications(address);
    setNotifications(data);
  };

  const filteredNotifications = notifications.filter(
    (notification: any) => notification?.title === "Woop Payment Requested"
  );

  React.useEffect(() => {
    retrieveData();
  }, []);

  React.useEffect(() => {
    if (address) {
      retrieveData();
    }
  }, [address]);

  const formatDate = (dateString: string) => {
    const [day, month] = dateString.split(" ");
    return `${day} ${month}`;
  };

  return (
    <>
      <SEO
        title={"Woop | My Woops"}
        description={"View your payments requested and manage them."}
      />
      <Layout>
        {/* Header Section */}
        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="flex justify-center items-center mt-4 mb-4">
            <Image alt="Logo" src={"/woop_logo.png"} width={70} height={50} />
          </div>

          {/* Menu Selection */}
          <div className="flex items-center justify-center mb-4">
            {/* Receive Button */}
            <Link
              href="/"
              className="flex justify-center items-center font-sans text-sm leading-snug font-medium w-52 h-7 text-black border border-gray-600 rounded-l-md hover:bg-gray-300"
            >
              Receive
            </Link>
            {/* Track Button */}
            <div className="flex justify-center items-center font-sans text-sm leading-snug font-medium w-52 h-7 text-white bg-[#007BFF] border border-gray-600 rounded-r-md">
              Track
            </div>
          </div>

          {/* Title */}
          <div className="text-center text-xl font-bold mb-2">Recent Woops</div>
        </div>

        {/* Main Dashboard Section */}
        <div
          className="overflow-y-scroll px-3"
          style={{
            height: `calc(100vh - 280px)`,
          }}
        >
          {filteredNotifications.length === 0 ? (
            <p className="m-2 text-center font-sans font-base">
              😞 No recent woops
            </p>
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
                      <p className="font-bold text-lg mb-1">{description}</p>
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
                          {amount} {tokenName} on {networkName}
                        </button>
                      </div>
                    </div>
                    {/* Date */}
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-slate-500">{date}</p>
                    </div>

                    {currentModal === index && isShareActive && (
                      <section className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen z-40">
                        <div
                          onClick={() => setIsShareActive(!isShareActive)}
                          className="fixed top-0 left-0 w-screen h-screen bg-slate-900 opacity-30"
                        ></div>
                        <div
                          className={cx(
                            styles.shareBackground,
                            "z-20 py-5 px-5 w-full max-w-md m-5 flex flex-col items-center"
                          )}
                        >
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
                      </section>
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
