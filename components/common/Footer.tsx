import Link from "next/link";

export default function Footer() {
  const ALEX_HANDLE = "alerex_eth";
  const ALEX_LINK = `https://twitter.com/${ALEX_HANDLE}`;
  const D_D_LINK = "https://agency.developerdao.com/";
  return (
    <footer className="flex justify-center md:justify-between p-5 font-base text-sm text-white opacity-70">
      <div className="hidden md:flex">
        <Link href="/policy" className="mr-3" target="_blank" rel="noreferrer">
          <p>Privacy policy</p>
        </Link>
        <Link href="/terms" className="mr-3" target="_blank" rel="noreferrer">
          <p>Terms & conditions</p>
        </Link>
        <Link
          href="https://medium.com/@alessandromaci/woop-pay-simplifying-cryptocurrency-payment-requests-63e3bff2531d"
          className="mr-3"
          target="_blank"
          rel="noreferrer"
        >
          <p>About</p>
        </Link>
      </div>
      <div>
        <Link
          href="https://t.co/wPGRcWjdql"
          className="mr-3 hover:underline underline-offset-4 text-white"
          target="_blank"
          rel="noreferrer"
        >
          Join our Telegram community!
        </Link>
      </div>
      <div className="hidden md:block">
        <p className="text-white">
          Built with 💙 by{" "}
          <a
            className="font-semibold hover:underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
            href={ALEX_LINK}
          >
            @alerex {"  "}
          </a>
          &{" "}
          <a
            className="font-semibold hover:underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
            href={D_D_LINK}
          >
            D_D Agency
          </a>
        </p>
      </div>
    </footer>
  );
}
