import * as React from "react";
import Link from "next/link";
import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
} from "next-share";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { baseUrl } from "../../utils/constants";
import { useEffect, useRef, useState } from "react";
import useWindowSize from "../../hooks/useWindowSize/useWindowSize";
import { retrieveNotifications } from "../../utils/push";

export const Share: React.FC<{
  path: string;
  amount: string;
  description: string;
  token: any;
  network: any;
  address: string;
  visibility: any;
}> = (props) => {
  const { amount, description, path, token, network, visibility, address } =
    props;
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any>([]);
  const qrContainer = useRef<any>();
  const { width, height } = useWindowSize();
  const [qrCode, setqrCode] = useState<any>(null);

  const retrieveData = async () => {
    const data = await retrieveNotifications(address);
    console.log("Notifications => ", data);
    setNotifications(data);
  };

  useEffect(() => {
    const initQR = async () => {
      const QRCodeStyling = await require("qr-code-styling");
      const qrCodeBuild = new QRCodeStyling({
        image: "woop_logo_64x.svg",
        width: 800,
        height: 600,
        dotsOptions: {
          color: "#000000",
          type: "square",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 15,
        },
        backgroundOptions: {
          color: "#FFFFFF",
          transparent: false,
        },
        cornersSquareOptions: {
          color: "#000000",
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: "#000000",
          type: "dot",
        },
      });

      setqrCode(qrCodeBuild);
    };
    initQR();
  }, []);

  useEffect(() => {
    if (qrCode) {
      qrCode.append(qrContainer.current);
    }
  }, [qrCode]);

  useEffect(() => {
    qrCode &&
      qrCode.update({
        data: `${baseUrl}${path}`,
        width: width < 400 ? 320 : 357,
        height: width < 400 ? 320 : 357,
      });
  }, [qrCode, baseUrl, path, width]);

  React.useEffect(() => {
    if (path) {
      retrieveData();
    }
  }, [path]);

  return (
    <div className="flex flex-col p-4 max-w-lg mx-auto bg-white rounded">
      {path ? (
        <div>
          {/* Payment Details */}
          <div className="mb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Title */}
                <h3
                  className={`text-2xl font-extrabold font-sans tracking-wide text-gray-800 break-words ${
                    description && description.length > 30 ? "w-3/4" : "w-auto"
                  }`}
                >
                  {description || "Request details"}
                </h3>

                {/* Badge */}
                <span
                  className={`${
                    description && description.length > 30 ? "ml-auto" : ""
                  } bg-blue-500 text-white text-sm px-2 py-0.5 rounded-full font-sans font-medium whitespace-nowrap`}
                >
                  {notifications.filter(
                    (notification: any) =>
                      notification?.title === "Woop Payment Received" &&
                      notification?.notification.body === `${path}`
                  ).length > 0
                    ? `paid ${
                        notifications.filter(
                          (notification: any) =>
                            notification?.title === "Woop Payment Received" &&
                            notification?.notification.body === `${path}`
                        ).length
                      }x`
                    : "not paid"}
                </span>
              </div>

              {/* Back Button */}
              <button
                className="flex items-center text-black mb-3 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-2xl"
                onClick={() => visibility(false)}
              >
                <ArrowBackIcon />
              </button>
            </div>

            {/* Amount */}
            <div className="flex items-center mt-2">
              <span className="text-base font-medium font-sans text-gray-600">
                Amount:{" "}
                <span className="text-lg font-semibold text-gray-800">
                  {amount === "allowPayerSelectAmount"
                    ? "any"
                    : amount || "N/A"}{" "}
                  {token}
                </span>
              </span>
              <span className="ml-4 text-base font-medium font-sans text-gray-600">
                Network:{" "}
                <span className="text-lg font-semibold text-gray-800">
                  {network === "Any_Chain" ? "Any" : network}
                </span>
              </span>
            </div>

            {/* Address */}
            <p className="text-base font-sans font-medium text-gray-600">
              Send to:{" "}
              <span className="text-gray-800 font-semibold">
                {`${address.slice(0, 6)}...${address.slice(-6)}`}
              </span>
            </p>

            {notifications ? (
              notifications
                .filter(
                  (notification: any) =>
                    notification?.title === "Woop Payment Received" &&
                    notification?.notification.body === `${path}`
                )
                .map((notification: any, index: any) => (
                  <Link
                    href={notification?.cta}
                    key={index}
                    className="flex w-full font-base text-sm rounded-lg transition-colors cursor-pointer text-green-700 font-medium font-sans mt-3"
                  >
                    View transaction 🔎
                  </Link>
                ))
            ) : (
              <></>
            )}
          </div>

          {/* QR Code Section */}
          <div className="flex justify-center bg-white mt-3">
            <div ref={qrContainer}></div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
