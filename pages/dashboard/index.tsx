import * as React from "react";
import { retrieveNotifications } from "../../utils/push";
import { useAccount } from "wagmi";
import styles from "./dashboard.module.scss";
import cx from "classnames";
import Box from "@mui/material/Box";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import SEO from "../../components/common/Seo";
import Notification from "../../components/Notification/Notification";
import Layout from "../../components/layout/Layout";

const icons = ["🍕", "🎁", "🍹", "🎉"];

const Dashboard = () => {
  const [currentModal, setCurrentModal] = React.useState<any>(null);
  const [currentWoopId, setCurrentWoopId] = React.useState<string>("");
  const [currentDescription, setCurrentDescription] =
    React.useState<string>("");
  const [currentAmount, setCurrentAmount] = React.useState<string>("");
  const [currentToken, setCurrentToken] = React.useState<string>("");
  const { address } = useAccount();
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
        <article className={cx(styles.baseArticle, "w-full overflow-y-auto")}>
          <section
            className={cx(
              styles.containerBase,
              "h-screen w-full absolute top-0"
            )}
          ></section>

          <div
            className={cx(
              styles.containerDisplay,
              "flex-col items-center mr-3 ml-3"
            )}
          >
            {filteredNotifications.length === 0 ? (
              <p className="m-2">😞 No woops found</p>
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
                        "rounded-3xl shadow-md relative z-20 p-4 mt-3 w-full md:w-2/5 flex items-center"
                      )}
                    >
                      <div className="flex items-center mr-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                          {icons[index % icons.length]}
                        </div>
                      </div>
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
                            }}
                          >
                            {amount} {tokenName} on {networkName}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm text-slate-500">{date}</p>
                      </div>

                      {currentModal === index && (
                        <Notification
                          woopId={currentWoopId}
                          description={currentDescription}
                          amount={currentAmount}
                          tokenName={currentToken}
                          setShowModal={setCurrentModal}
                        />
                      )}
                    </Box>
                  );
                })
            )}
          </div>
        </article>
      </Layout>
    </>
  );
};

export default Dashboard;
