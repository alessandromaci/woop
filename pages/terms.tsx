import * as React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Woop - Terms of Service</title>
        <meta name="description" content="Woop Terms of Service" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <ArrowBackIcon className="text-gray-600" />
              </Link>
              <Image
                alt="Woop Logo"
                src="/woop_logo.png"
                width={90}
                height={70}
                className="h-8 w-auto"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <article className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold mb-8">
              Updated Terms of Service
            </h1>
            <p className="text-gray-600 mb-8">Effective Date: March 21, 2025</p>

            <div className="text-gray-700">
              <p className="mb-8">
                Welcome to Woop, a web-based platform (the
                &ldquo;Platform,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;)
                that facilitates crypto payments by connecting users with
                third-party payment processors and wallet providers. By
                accessing or using the Platform, you agree to comply with and be
                bound by the following Terms of Service (the
                &ldquo;Terms&rdquo;). Please read these Terms carefully before
                using our services.
              </p>

              <p className="text-center font-semibold mb-5">
                1. Ownership and Relationship to Digitcloud Ltd.
              </p>
              <p className="text-justify mb-5">
                Woop is a platform owned and operated by Digitcloud Ltd., a
                Cyprus-registered company. Digitcloud Ltd. is responsible for
                the management, development, and maintenance of Woop, but does
                not handle, process, or store cryptocurrency transactions or
                fiat payments.
              </p>

              <p className="text-center font-semibold mb-5">
                2. Description of Services
              </p>
              <p className="text-justify mb-5">
                Woop is a user interface (UI) that facilitates crypto payment
                requests by connecting users to third-party service providers,
                including wallet providers. Woop itself does not process, hold,
                or transfer any funds—users remain in full control of their
                transactions at all times.
              </p>

              <p className="text-center font-semibold mb-5">
                3. Third-Party Service Providers
              </p>
              <p className="text-justify mb-5">
                To use the platform, users must connect with third-party
                services such as wallet providers. By using these services, you
                acknowledge that:
              </p>
              <ul className="list-disc ml-8 mb-5">
                <li>
                  Woop does not manage, execute, or process transactions—wallet
                  providers facilitate approvals, and third-party services
                  handle conversions and off-ramping.
                </li>
                <li>
                  All transactions occur between you and these third-party
                  providers, subject to their respective terms and conditions.
                </li>
                <li>
                  Woop does not endorse, control, or guarantee the security,
                  reliability, or regulatory compliance of third-party
                  providers.
                </li>
              </ul>

              <p className="text-center font-semibold mb-5">
                4. No Investment or Financial Advice
              </p>
              <p className="text-justify mb-5">
                Woop does not provide investment advice or financial services.
                All decisions related to cryptocurrency transactions are made at
                your sole discretion.
              </p>

              <p className="text-center font-semibold mb-5">
                5. User Responsibilities and Compliance
              </p>
              <p className="text-justify mb-5">
                By using Woop, you are solely responsible for complying with all
                applicable laws and regulations in your jurisdiction regarding
                cryptocurrency transactions.
              </p>

              <p className="text-center font-semibold mb-5">
                6. Analytics and Data Tracking
              </p>
              <p className="text-justify mb-5">
                Woop uses third-party analytics tools, such as Mixpanel, to
                track user interactions within the platform. The data collected
                includes:
              </p>
              <ul className="list-disc ml-8 mb-5">
                <li>
                  Transaction details (e.g., token type, blockchain network,
                  amount).
                </li>
                <li>Wallet addresses used in interactions.</li>
                <li>Generated payment request links.</li>
              </ul>
              <p className="text-justify mb-5">
                No personally identifiable information is collected; however,
                Mixpanel may log approximate location data based on user device
                interactions.
              </p>

              <p className="text-center font-semibold mb-5">
                7. Assumption of Risk
              </p>
              <p className="text-justify mb-5">
                By accessing Woop, you acknowledge that blockchain transactions
                are irreversible and carry financial and security risks. Woop is
                not liable for any loss of assets due to user actions, wallet
                provider errors, or vulnerabilities in third-party services.
              </p>

              <p className="text-center font-semibold mb-5">
                8. Release of Claims
              </p>
              <p className="text-justify mb-5">
                You expressly waive and release Digitcloud Ltd. and Woop from
                any and all claims related to the use of the platform, including
                losses due to failed or unauthorized transactions.
              </p>

              <p className="text-center font-semibold mb-5">
                10. No Warranties and Limitation of Liability
              </p>
              <p className="text-justify mb-5">
                The platform is provided &ldquo;AS IS&rdquo; and &ldquo;AS
                AVAILABLE&rdquo; without any guarantees of uptime, security, or
                uninterrupted service. Under no circumstances shall Woop or
                Digitcloud Ltd. be liable for any direct, indirect, or
                consequential damages, including lost funds or financial losses.
              </p>

              <p className="text-center font-semibold mb-5">
                11. Changes to Terms
              </p>
              <p className="text-justify mb-5">
                We reserve the right to update these Terms at any time.
                Continued use of the platform constitutes acceptance of any
                modifications.
              </p>
            </div>
          </article>
        </main>

        {/* Footer */}
        <footer className="border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center">
            <span className="text-sm text-gray-500">
              © 2025 Woop. All rights reserved.
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
