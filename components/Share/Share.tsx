import * as React from "react";
import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
} from "next-share";
import { baseUrl } from "../../utils/constants";
import { useEffect, useRef, useState } from "react";

import cx from "classnames";
import styles from "./share.module.scss";
import useWindowSize from "../../hooks/useWindowSize/useWindowSize";

export const Share: React.FC<{
  path: string;
  amount: string;
  description: string;
  token: any;
  visibility: any;
}> = (props) => {
  const { amount, description, path, token, visibility } = props;
  const [copySuccess, setCopySuccess] = React.useState(false);

  const qrContainer = useRef<any>();
  const { width, height } = useWindowSize();

  const [qrCode, setqrCode] = useState<any>(null);

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

  return (
    <div className="flex flex-col p-4 max-w-sm mx-auto bg-white rounded">
      {path ? (
        <div>
          {/* QR Code Section */}
          <div className="flex justify-center">
            <div ref={qrContainer}></div>
          </div>

          {/* Payment Request Section */}
          <p className="font-base text-base font-medium text-slate-700 mt-4">
            Send this payment request:
          </p>
          <div className="mt-4 flex gap-4">
            {/* Back Button */}
            <button
              onClick={() => visibility(false)}
              className="w-full h-12 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 font-medium transition flex items-center justify-center"
            >
              Back
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${baseUrl}${path}`);
                setCopySuccess(true);
              }}
              className="w-full h-12 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 font-medium transition flex items-center justify-center"
            >
              {copySuccess ? "Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Share Section */}
          <div className="flex items-center mt-6">
            <p className="font-base text-base font-medium text-slate-700 mr-2">
              Share:
            </p>
            <div className="flex gap-2">
              {/* WhatsApp Share */}
              <WhatsappShareButton
                url={`${baseUrl}${path}`}
                title={`Hey, can you please send me ${
                  amount == "allowPayerSelectAmount" ? "some" : amount
                } ${token.label} ${description ? `for ${description}` : ``} at`}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>

              {/* Telegram Share */}
              <TelegramShareButton
                url={`${baseUrl}${path}`}
                title={`Hey, can you please send me ${
                  amount == "allowPayerSelectAmount" ? "some" : amount
                } ${token.label} ${description ? `for ${description}` : ``} at`}
              >
                <TelegramIcon size={32} round />
              </TelegramShareButton>

              {/* Twitter Share */}
              <TwitterShareButton
                url={`${baseUrl}${path}`}
                title={`Hey, can you please send me ${
                  amount == "allowPayerSelectAmount" ? "some" : amount
                } ${token.label} ${description ? `for ${description}` : ``} at`}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
