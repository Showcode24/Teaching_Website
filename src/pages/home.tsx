import About from "../component/About";
import AwardSection from "../component/AwardSection";
import Banner from "../component/Banner";
import BlogSection from "../component/Blog";
import ChooseUs from "../component/ChooseUs";
import FAQSection from "../component/Faq";
import Features from "../component/Features";
import Layout from "../component/Layouts/Layout";
import NewsletterSection from "../component/News";
import Services from "../component/Services";
import TeamSection from "../component/TeamSection";
import TestimonialSection from "../component/Testimonial";



const Home = () => {
  return (
    <>
      <Layout>
        <Banner />
        <Features />
        <About />
        <Services />
        <ChooseUs />
        <TeamSection />
        <AwardSection />
        <FAQSection />
        <TestimonialSection />
        <BlogSection />
        <NewsletterSection />
      </Layout>

    </>
  )
}
export default Home;