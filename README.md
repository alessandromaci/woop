# Woop Widget

Woop is a plug-and-play widget that lets crypto wallets integrate seamless crypto payment requests, NFTs, and investments user flows.

### Setup

1. Make `.env.local`

```shell
touch .env.local
```

add environment variable

```text
NEXT_PUBLIC_INFURA_PROJECT_ID={project_id}
NEXT_PUBLIC_INFURA_SECRET={secret}
NEXT_PUBLIC_ALCHEMY_ETHEREUM_MAINNET_API_KEY={key-mainnet}
NEXT_PUBLIC_ALCHEMY_ETHEREUM_GOERLI_API_KEY={key-goerli}
NEXT_PUBLIC_ALCHEMY_POLYGON_MAINNET_API_KEY={key-polygon}
NEXT_PUBLIC_ALCHEMY_OPTIMISM_MAINNET_API_KEY={key-optimism}
NEXT_PUBLIC_ALCHEMY_ARBITRUM_MAINNET_API_KEY={key-arbitrum}
```

3. Install dependencies

```bash
npm install
```

4. Start developmment

```bash
npm run dev
```

5. 📱 Open http://localhost:3000 to see the app

## Integrating Woop Widget SDK

The Woop SDK allows you to easily integrate the Woop widget into your application, providing a seamless way to connect with various wallets and manage assets.

Documentation and examples are available hereç https://www.npmjs.com/package/@woopwidget/sdk

In case of questions, please send a message to alessandromaci96@gmail.com

## Production

Live deployment is made via Github / Vercel integration from master branch.

Open [Woop Widget](https://woopwidget.com)
