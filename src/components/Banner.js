import React from "react";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import {} from "../variants";
const Banner = () => {
  return (
    <section className="section" id="home">
      <div className="container mx-auto">
        <div>
          {/*text*/}
          <div>
            <h1>
              PULKIT <span>SHUBHAM</span>
            </h1>
            <div
              className="mb-6 text-[36px] lg:text-[60px] font-secondary
            font-semibold uppercase leading-[1]"
            >
              <span className="text-white mr-4">I am a</span>
              <TypeAnimation
                sequence={[
                  "Android Developer",
                  2000,
                  "C++ Programmer",
                  2000,
                  "Data Science Trailblazer",
                  2000,
                ]}
                speed={50}
                className="text-accent"
                wrapper="span"
                repeat={Infinity}
              />
              <p></p>
            </div>
          </div>
          {/*text*/}
          <div>
            <img src="../avtar.png" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
