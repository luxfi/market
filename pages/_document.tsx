import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'
import { getCssText } from '../stitches.config'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
        </Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="keywords" content="blockhain, crypto, nft, ethereum, protocol, real world assets, RWAs" />
        <link
          rel="shortcut icon"
          type="image/png"
          href="/logo.png"
        />
        <link rel="icon" type="image/x-icon" href="favicon.ico"/>
        <title>LUX | DeFi credit card, blockchain, bridge, exchange and wallet.</title>
        <meta
          name="description"
          content="LUX is a DeFi credit card, blockchain, bridge, exchange and wallet."
        />
        <meta name="keywords" content="Blockchain, Ethereum, Crypto DeFI, NFT, API, Protocol, Real World Assets, RWAs" />

        {/* Twitter */}
        {/* The optimal size is 1200 x 630 (1.91:1 ratio). */}
        <meta name="twitter:image" content="LUX is a DeFi credit card, blockchain, bridge, exchange and wallet." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="LUX is a DeFi credit card, blockchain, bridge, exchange and wallet."
        />
        <meta
          name="twitter:description"
          content="LUX is a DeFi credit card, blockchain, bridge, exchange and wallet."
        />
        <meta name="twitter:site" content="@luxdefi" />

        {/* OG - https://ogp.me/ */}
        {/* https://www.opengraph.xyz/ */}
        <meta
          name="og:title"
          content="LUX is a DeFi credit card, blockchain, bridge, exchange and wallet."
        />
        <meta property="og:type" content="website" />
        <meta property="og:determiner" content="the" />
        <meta property="og:locale" content="en" />
        <meta
          property="og:description"
          content="LUX is a DeFi credit card, blockchain, bridge, exchange and wallet."
        />
        {/* The optimal size is 1200 x 630 (1.91:1 ratio). */}
        {/* <meta property="og:image" content={OG_IMAGE} /> */}
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="640" />
        <meta property="og:image:alt" content="LUX Banner" />

        {/* LUX Meta Tags: https://docs.reservoir.tools/docs/reservoir-meta-tags */}
        <meta property="reservoir:title" content="LUX" />
        <meta property="reservoir:icon" content="/source-icon.png" />
        <meta
          property="reservoir:token-url-mainnet"
          content="/collection/ethereum/${contract}/${tokenId}"
        />
        <meta
          property="reservoir:token-url-goerli"
          content="/collection/goerli/${contract}/${tokenId}"
        />
        <meta
          property="reservoir:token-url-polygon"
          content="/collection/polygon/${contract}/${tokenId}"
        />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
