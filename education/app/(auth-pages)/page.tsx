// import Navbar from "@/components/Navbar";
import SpotlightPreview from "@/components/Spotlight";
import CardHoverEffectDemo from "@/components/Cardhover";
import Navbar from "@/components/Navbar";
import Info from "@/components/Infosection"
import Footerpage from "@/components/Footer";

export default function Home() {
  return (
    <>
        <Navbar/>
        <SpotlightPreview />
        <CardHoverEffectDemo />
        <Info/>
        <Footerpage/>
    </>
  )
}