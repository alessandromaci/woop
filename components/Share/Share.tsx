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
        width: 357,
        height: 357,
        image: "icon.svg",
        dotsOptions: {
          gradient: {
            type: "linear",
            colorStops: [
              { offset: 0, color: "rgb(6, 34, 92)" },
              { offset: 1, color: "rgba(38, 142, 200, 1)" },
            ],
            rotation: 2.35,
          },
          type: "extra-rounded",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
        },
        backgroundOptions: {
          color: "transparent",
        },
      });
      setqrCode(qrCodeBuild);
      // Add logic with `term`
      // qrCode.append(qrContainer.current);
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
    <div className="flex flex-col p-2">
      {path ? (
        <div className="">
          <div className="flex justify-center">
            <div ref={qrContainer}></div>
          </div>
          <p className="font-base text-base font-medium text-slate-500 mt-2">
            Send this payment request:
          </p>
          <div className="mt-2 flex gap-2 place-content-evenly">
            <div
              onClick={() => visibility(false)}
              className={cx(
                styles.buttons,
                "w-full cursor-pointer font-base h-16 rounded-xl transition-all font-semibold text-slate-500 capitalize flex items-center justify-center"
              )}
            >
              {"Back"}
            </div>
            <div
              onClick={() => {
                navigator.clipboard.writeText(`${baseUrl}${path}`);
                setCopySuccess(true);
              }}
              className={cx(
                styles.buttons,
                "w-full font-base cursor-pointer focus:outline-0 focus:text-slate-700 h-16 rounded-xl transition-all font-semibold text-slate-500 capitalize hover:border-slate-700 hover:bg-slate-200 hover:text-slate-500 flex items-center justify-center"
              )}
            >
              {copySuccess ? "Copied!" : "Copy Link"}
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <section className="flex items-center">
              <p className="font-base text-base font-medium text-slate-500 mr-2 ml-1">
                Share:
              </p>
              <div className="mr-2 flex items-center">
                <WhatsappShareButton
                  url={`${baseUrl}${path}`}
                  title={`Hey, can you please send me ${
                    amount == "allowPayerSelectAmount" ? "some" : amount
                  } ${token.label} ${
                    description ? `for ${description}` : ``
                  } at`}
                >
                  <WhatsappIcon size={30} round />
                </WhatsappShareButton>
              </div>
              <div className="mr-2 flex items-center">
                <TelegramShareButton
                  url={`${baseUrl}${path}`}
                  title={`Hey, can you please send me ${
                    amount == "allowPayerSelectAmount" ? "some" : amount
                  } ${token.label} ${
                    description ? `for ${description}` : ``
                  } at`}
                >
                  <TelegramIcon size={30} round />
                </TelegramShareButton>
              </div>
              <div className="flex items-center">
                <TwitterShareButton
                  url={`${baseUrl}${path}`}
                  title={`Hey, can you please send me ${
                    amount == "allowPayerSelectAmount" ? "some" : amount
                  } ${token.label} ${
                    description ? `for ${description}` : ``
                  } at`}
                >
                  <TwitterIcon size={30} round />
                </TwitterShareButton>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
