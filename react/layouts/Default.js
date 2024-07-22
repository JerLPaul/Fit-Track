import Head from 'next/head'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'

export default function NavAndFooter({ children }) {
  return (
    <div>
        <Head>
            <title>Fit-Track</title>
            <link rel="icon" href="/logo.ico" />
        </Head>

        <main>
            <Navbar />
            
            {children}
            
            <Footer />
        </main>
    </div>
  )
}