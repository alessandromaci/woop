import * as React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Policy() {
  return (
    <>
      <Head>
        <title>Woop - Privacy Policy</title>
        <meta name="description" content="Woop Privacy Policy" />
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
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Effective Date: March 21, 2025</p>

            <div className="text-gray-700">
              <p className="mb-8">
                This Privacy Policy describes how Woop (the
                &ldquo;Platform,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;)
                collects, uses, and manages limited data related to user
                interactions on our platform. We are committed to respecting
                your privacy and ensuring transparency in how we handle data.
              </p>

              <p className="text-center font-semibold mb-5">
                1. Information We Collect
              </p>
              <p className="text-justify mb-5">
                Woop collects only essential data to facilitate platform
                operations. This includes:
              </p>
              <ul className="list-disc ml-8 mb-5">
                <li>Blockchain wallet addresses used for transactions</li>
                <li>Transaction details (amount, token type, network used)</li>
                <li>Device type and operating system</li>
                <li>Approximate country of origin (based on IP)</li>
              </ul>
              <p className="text-justify mb-5">
                We do not collect personally identifiable information (PII),
                such as names, emails, or physical addresses.
              </p>

              <p className="text-center font-semibold mb-5">
                2. How We Use Data
              </p>
              <p className="text-justify mb-5">
                The limited data collected is used for:
              </p>
              <ul className="list-disc ml-8 mb-5">
                <li>Facilitating crypto payment requests and transactions</li>
                <li>Enhancing user experience and platform functionality</li>
                <li>Monitoring platform activity and security</li>
              </ul>

              <p className="text-center font-semibold mb-5">
                3. Analytics and Tracking
              </p>
              <p className="text-justify mb-5">
                Woop uses Mixpanel to gather **anonymized** analytics data,
                including:
              </p>
              <ul className="list-disc ml-8 mb-5">
                <li>General usage patterns (e.g., features accessed)</li>
                <li>Device type and operating system</li>
                <li>
                  Approximate geographic region (based on IP, no precise
                  tracking)
                </li>
              </ul>
              <p className="text-justify mb-5">
                This data helps us improve the platform, but does not allow us
                to personally identify users.
              </p>

              <p className="text-center font-semibold mb-5">4. Data Sharing</p>
              <p className="text-justify mb-5">
                Woop does not sell, rent, or share user data except in the
                following cases:
              </p>
              <ul className="list-disc ml-8 mb-5">
                <li>With analytics providers for platform optimization</li>
                <li>With legal authorities if required by law</li>
                <li>
                  With third-party wallet providers when users approve
                  transactions
                </li>
              </ul>

              <p className="text-center font-semibold mb-5">
                5. Third-Party Services
              </p>
              <p className="text-justify mb-5">
                Our platform integrates with external services, such as wallet
                providers. These services have their own privacy policies, and
                we encourage users to review them.
              </p>

              <p className="text-center font-semibold mb-5">6. User Control</p>
              <p className="text-justify mb-5">Users have the right to:</p>
              <ul className="list-disc ml-8 mb-5">
                <li>Request an overview of the data we collect</li>
                <li>Opt out of analytics tracking (where applicable)</li>
              </ul>

              <p className="text-center font-semibold mb-5">
                7. Changes to This Policy
              </p>
              <p className="text-justify mb-5">
                We may update this Privacy Policy periodically. Any changes will
                be reflected on this page, and continued use of the platform
                constitutes acceptance of the updated policy.
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
