import { PageConfig } from "next";
import { Layout } from "components/Layout";

export const config: PageConfig = {
  amp: "hybrid",
};

const Home = () => (
  <Layout>
    <div className="container">
      <button className="py-2 px-4">Button</button>
    </div>
  </Layout>
);

export default Home;
