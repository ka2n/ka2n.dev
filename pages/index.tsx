import { PageConfig } from "next";

export const config: PageConfig = {
  amp: "hybrid",
};

const Home = () => (
  <div className="container">
    <button className="py-2 px-4">Button</button>
  </div>
);

export default Home;
