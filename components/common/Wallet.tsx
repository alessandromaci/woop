import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Wallet() {
  return (
    <div className="">
      <ConnectButton
        chainStatus="none"
        accountStatus={{
          smallScreen: "full",
          largeScreen: "full",
        }}
        showBalance={{
          smallScreen: true,
          largeScreen: true,
        }}
      />
    </div>
  );
}
