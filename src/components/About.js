import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { fadeIn } from "../variants";

// Import React Icons
import {
  FaGraduationCap,
  FaAward,
  FaLaptopCode,
  FaLightbulb,
  FaRocket,
} from "react-icons/fa";

const About = () => {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  return (
    <section className="section mt-16" id="about" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-y-10 lg:flex-row">
          {/* Box wrapper with rounded borders, accent shadow, and transparent background */}
          <div className="w-full p-6 bg-transparent border-2 border-accent rounded-lg shadow-lg shadow-accent">
            {/* text */}
            <div className="flex-1">
              <h2 className="h2 text-accent">About me.</h2>
              <h3 className="h3 mb-4">
                I'm a Driven Technophile looking to secure a challenging job
                role in the IT sector.
              </h3>
              <p className="mb-6">
                <p className="text-xl font-bold">Greetings!</p>
                <br></br>
                <ul>
                  <li className="flex items-center gap-2">
                    <FaLaptopCode /> I'm Pulkit Shubham, currently immersed in
                    the exciting world of Computer Science and Engineering at
                    Lovely Professional University.
                  </li>
                  <li className="flex items-center gap-2">
                    <FaGraduationCap /> I've consistently achieved good results
                    in both 10th and 12th grades, laying a strong foundation for
                    my academic pursuits.
                  </li>
                  <li className="flex items-center gap-2">
                    <FaAward /> In addition to my studies, I've had the honor of
                    being a Gold Medalist in the International Maths Olympiad
                    (IMO) for six years during school.
                  </li>
                  <li className="flex items-center gap-2">
                    <FaLightbulb /> I bring a unique work style to the table,
                    characterized by a passion for intellectual challenges and a
                    fresh, innovative approach to responsibilities.
                  </li>
                  <li className="flex items-center gap-2">
                    <FaRocket /> My aim is to master technical skills and forge
                    a fulfilling career in Computer Science and Engineering.
                  </li>
                </ul>
              </p>
              {/* stats */}
              <div className="flex flex-col sm:flex-row gap-x-6 lg:gap-x-10 mb-12 justify-center lg:justify-between">
                <div className="flex-1 text-center">
                  <div className="text-[40px] font-tertiary text-gradient mb-2">
                    {inView ? <CountUp start={0} end={2} duration={3} /> : null}
                    K+
                  </div>
                  <div className="font-primary text-sm tracking-[2px]">
                    Linkedin
                    <br />
                    Connections
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-[40px] font-tertiary text-gradient mb-2">
                    {inView ? (
                      <CountUp start={325} end={350} duration={3} />
                    ) : null}
                    +
                  </div>
                  <div className="font-primary text-sm tracking-[2px]">
                    DSA
                    <br />
                    Problems Solved
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-[40px] font-tertiary text-gradient mb-2">
                    {inView ? <CountUp start={0} end={8} duration={3} /> : null}
                    +
                  </div>
                  <div className="font-primary text-sm tracking-[2px]">
                    Projects
                    <br />
                    Completed
                  </div>
                </div>
              </div>
              {/* Contact button below stats */}
              {/* <div className="flex justify-center lg:justify-center"> */}
              {/* <button className="btn btn-lg">Contact me</button> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
