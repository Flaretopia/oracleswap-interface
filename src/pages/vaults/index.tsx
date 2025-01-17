import Container from 'app/components/Container'
import Head from 'next/head'

export default function Vaults() {
  return (
    <Container id="settings-page" className="py-4 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Vaults | OwlSwap</title>
        <meta key="description" name="description" content="OwlSwap vaults..." />
        <meta key="twitter:description" name="twitter:description" content="OwlSwap vaults..." />
        <meta key="og:description" property="og:description" content="OwlSwap vaults..." />
      </Head>
    </Container>
  )
}
