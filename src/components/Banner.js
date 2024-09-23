import React from "react";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import {} from "../variants";
const Banner = () => {
  return (
    <section
      className="min-h-[85vh] lg:min-h-[78vh] flex items-center"
      id="home"
    >
      <div className="container mx-auto">
        <div className="flex flex-col gap-y-8 lg:flex-row lg:items-center lg:gap-x-8">
          {/*text*/}
          <div className="flex-1 text-center font-secondary lg:text-left">
            <h1 className="text-[55px] font-bold leading-[0.8] lg:text-[90px]">
              PULKIT <span>SHUBHAM</span>
            </h1>
            <div
              className="mb-6 text-[28px] lg:text-[45px] font-secondary
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
            </div>
            <p className="mb-8 max-w-lg mx-auto lg:mx-0">
              Currently immersed in the exciting world of Computer Science and
              Engineering. My journey is fueled by a genuine love for technology
              and an eagerness to overcome challenges.
            </p>
            <div className="flex max-w-max gap-x-6 items-center mb-12 mx-auto lg:mx-0">
              <button className="btn btn-lg">Contact me</button>
              <a href="#" className="text-gradient btn-link">
                My Portfolio
              </a>
            </div>
            {/*socials*/}
            <div className="flex text-[20px] gap-x-6 max-w-max mx-auto lg:mx-0">
              <a href="#">
                <FaLinkedin />
              </a>
              <a href="#">
                <FaGithub />
              </a>
              <a href="#">
                <FaTwitter />
              </a>
            </div>
          </div>
          {/*text*/}
          <div>
            <img src="../avtar.png" alt="Avatar" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
