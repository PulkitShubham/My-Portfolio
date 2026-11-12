// ---------------------------------------------------------------------------
// Profile & site-wide content
// ---------------------------------------------------------------------------
export const profile = {
  firstName: "Pulkit",
  lastName: "Shubham",
  roles: ["Android Developer", "C++ Programmer", "Data Science Trailblazer", "ML Enthusiast"],
  tagline:
    "Member of Technical Staff at Nielsen and a Computer Science engineer from LPU, specialising in Data Science. I build Android apps, train machine learning models and craft web experiences, driven by a love for technology and a hunger for hard problems.",
  location: "India",
  cv: "/CV.pdf",
  avatar: "/avatar.jpg",
  // Shown in the hero badge.
  current: {
    title: "MTS-1", // short form, used on small screens
    fullTitle: "Member of Technical Staff - 1",
    company: "Nielsen",
    logo: { onDark: "/nielsen-on-dark.svg", onLight: "/nielsen-on-light.svg" },
    url: "https://www.nielsen.com",
  },
};

export const socials = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/pulkit-shubham/", icon: "linkedin" },
  { name: "GitHub", href: "https://github.com/PulkitShubham", icon: "github" },
  { name: "Twitter", href: "https://twitter.com/pulkits990", icon: "twitter" },
  { name: "LeetCode", href: "https://leetcode.com/pulkit_shubham/", icon: "leetcode" },
];

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Journey" },
  { id: "projects", label: "Work" },
  { id: "contact", label: "Contact" },
];

export const stats = [
  { value: 5.2, suffix: "K+", label: "LinkedIn connections" },
  { value: 1000, suffix: "+", label: "DSA problems solved" },
  { value: 12, suffix: "+", label: "Projects shipped" },
  { value: 6, suffix: "x", label: "IMO gold medals" },
];

export const highlights = [
  {
    icon: "code",
    title: "CSE @ LPU",
    text: "Immersed in Computer Science and Engineering at Lovely Professional University.",
  },
  {
    icon: "grad",
    title: "Strong foundation",
    text: "Consistently strong results in both 10th and 12th grades.",
  },
  {
    icon: "award",
    title: "Olympiad gold",
    text: "Gold Medalist in the International Maths Olympiad for six years.",
  },
  {
    icon: "bulb",
    title: "Fresh thinking",
    text: "A passion for intellectual challenges and an innovative approach to responsibilities.",
  },
  {
    icon: "rocket",
    title: "The mission",
    text: "Master technical skills and forge a fulfilling career in tech.",
  },
];

// Work experience, grouped by company. Roles are listed newest first.
// `end: null` means the role is current. Dates are ISO (YYYY-MM-DD).
// Add bullet points to `points` and technologies to `tags`; empty lists are hidden.
export const experience = [
  {
    company: "Nielsen",
    url: "https://www.nielsen.com",
    // Light variant of the 2021 wordmark, recoloured for dark backgrounds.
    logo: { onDark: "/nielsen-on-dark.svg", onLight: "/nielsen-on-light.svg" },
    roles: [
      {
        title: "Member of Technical Staff - 1",
        type: "Full-time",
        start: "2026-09-01",
        end: null,
        points: [],
        tags: [],
      },
      {
        title: "Software Engineer Intern",
        type: "Internship",
        start: "2025-03-03",
        end: "2026-08-30",
        points: [],
        tags: [],
      },
    ],
  },
];

export const projectFilters = [
  { id: "all", label: "All" },
  { id: "web app", label: "Web" },
  { id: "android app", label: "Android" },
  { id: "machine learning", label: "ML & Data" },
];

// EmailJS public identifiers (safe to ship in client code).
export const emailConfig = {
  serviceId: "service_hpeo995",
  templateId: "template_g42lwnv",
  publicKey: "w2S50GEPJwIeoBxXr",
};

// ---------------------------------------------------------------------------
// Skills / education / projects
// ---------------------------------------------------------------------------
// Icons for newer skills come from Devicon, pinned to a release so they can't change underneath us.
const devicon = (path) => `https://cdn.jsdelivr.net/npm/devicon@2.18.0/icons/${path}.svg`;

// Order matters: it pairs with the bento column spans in Skills.jsx
// (wide cards at positions 1, 6 and 9 hold the longest lists).
export const skills = [
  {
    title: "Programming Languages",
    skills: [
      { name: "C++", image: "https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg" },
      { name: "C", image: "https://upload.wikimedia.org/wikipedia/commons/1/19/C_Logo.png" },
      { name: "Java", image: "https://www.vectorlogo.zone/logos/java/java-icon.svg" },
      { name: "Python", image: "https://www.vectorlogo.zone/logos/python/python-icon.svg" },
      { name: "TypeScript", image: devicon("typescript/typescript-original") },
      { name: "Kotlin", image: "https://www.vectorlogo.zone/logos/kotlinlang/kotlinlang-icon.svg" },
      { name: "Swift", image: devicon("swift/swift-original") },
      { name: "R", image: "https://www.r-project.org/logo/Rlogo.png" },
    ],
  },
  {
    title: "Data Analysis & Visualization",
    skills: [
      { name: "MS Excel", image: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Microsoft_Office_Excel_%282019%E2%80%932025%29.svg" },
      { name: "Tableau", image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Tableau_Logo.png" },
      { name: "Power BI", image: "https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg" },
      { name: "R Studio", image: "/rstudio.svg" },
    ],
  },
  {
    title: "Machine Learning",
    skills: [
      { name: "Google Colab", image: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Colaboratory_SVG_Logo.svg" },
      { name: "Jupyter Notebook", image: "https://www.vectorlogo.zone/logos/jupyter/jupyter-icon.svg" },
      { name: "TensorFlow", image: "https://www.vectorlogo.zone/logos/tensorflow/tensorflow-icon.svg" },
      { name: "Hugging Face", image: "https://cdn.brandfetch.io/idGqKHD5xE/w/800/h/741/theme/dark/symbol.png?k=bfHSJFAPEGy" },
    ],
  },
  {
    title: "Mobile Development",
    skills: [
      { name: "React Native", image: devicon("react/react-original") },
      { name: "Kotlin", image: "https://www.vectorlogo.zone/logos/kotlinlang/kotlinlang-icon.svg" },
      { name: "Swift", image: devicon("swift/swift-original") },
      { name: "XML", image: "/xml.svg" },
      { name: "Android Studio", image: "https://upload.wikimedia.org/wikipedia/commons/9/95/Android_Studio_Icon_3.6.svg" },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "PostgreSQL", image: devicon("postgresql/postgresql-original") },
      { name: "MySQL", image: "https://www.vectorlogo.zone/logos/mysql/mysql-official.svg" },
      { name: "MongoDB", image: "https://www.vectorlogo.zone/logos/mongodb/mongodb-icon.svg" },
      { name: "Firebase", image: "https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" },
    ],
  },
  {
    title: "Frameworks & Libraries",
    skills: [
      { name: "React.js", image: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" },
      { name: "Apollo GraphQL", image: devicon("apollographql/apollographql-original") },
      { name: "Node.js", image: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" },
      { name: "Flask", image: devicon("flask/flask-original") },
      { name: "Django", image: "https://static.djangoproject.com/img/logos/django-logo-negative.svg" },
      { name: "Tailwind CSS", image: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" },
      { name: "Bootstrap", image: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Bootstrap_logo.svg" },
    ],
  },
  {
    title: "Testing",
    skills: [
      { name: "Vitest", image: devicon("vitest/vitest-original") },
      { name: "Cypress", image: devicon("cypressio/cypressio-original") },
    ],
  },
  {
    title: "Cloud & DevOps",
    skills: [
      { name: "AWS", image: devicon("amazonwebservices/amazonwebservices-original") },
      { name: "Docker", image: devicon("docker/docker-original") },
      { name: "GitLab", image: devicon("gitlab/gitlab-original") },
    ],
  },
  {
    title: "Tools",
    skills: [
      { name: "Git", image: devicon("git/git-original") },
      { name: "GitHub", image: devicon("github/github-original") },
      { name: "VS Code", image: devicon("vscode/vscode-original") },
      { name: "Figma", image: devicon("figma/figma-original") },
      { name: "Adobe XD", image: devicon("xd/xd-original") },
    ],
  },
];

export const education = [
  {
    id: 0,
    img: "/lpu.png",
    school: "Lovely Professional University",
    date: "Aug 2022 - July 2026",
    grade: "9.02 CGPA",
    desc: "Pursuing a B.Tech in Computer Science and Engineering at Lovely Professional University, specializing in Data Science. With a strong academic foundation and hands-on experience in programming, machine learning, and software development, I am committed to mastering technical skills and contributing to innovative solutions in the IT industry.",
    degree: "Bachelor of Technology - BTech, Computer Science and Engineering*",
  },
  {
    id: 1,
    img: "/dps.jpg",
    school: "Delhi Public School Kashi",
    date: "Apr 2019 - July 2021",
    grade: "94.4%",
    desc: "Completed Class 12 from Delhi Public School Kashi with a focus on Science (PCM). Consistently achieved strong academic results, laying a solid foundation.",
    degree: "CBSE(XII)",
  },
  {
    id: 2,
    img: "/gvps.jpg",
    school: "Green View Public School",
    date: "Apr 2017 - Apr 2019",
    grade: "98.6%",
    desc: "Completed Class 10 from Green View Public School as the district topper. Excelled in academics with a strong focus on mathematics and science, and consistently performed at the top level, including being a six-time Gold Medalist in the International Maths Olympiad (IMO).",
    degree: "CBSE(X)  ",
  },
];
export const projects = [
  {
    id: 9,
    title: "AI ChatBot",
    date: "Aug 2024 - September 2024",
    description:
      "The AI-Powered Chatbot is an intelligent conversational agent designed to simulate human-like interactions using advanced Natural Language Processing (NLP) techniques. Built using Flask, PyTorch, and the Microsoft DialoGPT model, this chatbot offers dynamic and responsive communication in real-time. The project features a clean, user-friendly interface developed using HTML, CSS, Bootstrap, and jQuery for seamless interaction.",
    image: "/chatbot.png",
    tags: [
      "Python",
      "Flask",
      "DialoGPT",
      "HTML",
      "CSS",
      "AJAX",
      "Bootstrap",
      "Jquery",
    ],
    category: "machine learning",
    github: "https://github.com/PulkitShubham/Chatbot",
  },
  {
    id: 0,
    title: "Road Analytics Dashboard",
    date: "March 2024",
    description:
      "An Excel dashboard for road accident data using macros, pivot tables, and timeline slicers which can be an effective way to analyze and visualize the information.",
    image: "/dashboard.png",
    tags: ["Microsoft Excel", "Kaggle"],
    category: "machine learning",
    github:
      "https://drive.google.com/file/d/1EbSItb2AF5MXXXr7hXPu1qhIqhPARzxT/view",
  },
  {
    id: 1,
    title: "Connect",
    date: "September 2024 - Present",
    description:
      "A Chat Application using Kotlin that enables users to communicate in real-time. The app features a sleek, user-friendly interface with functionalities like sign-up, sign-in, and OTP authentication integrated via Firebase. Users can send and receive messages instantly, with conversations stored securely in a cloud database. The app also supports user profile management and provides a seamless chat experience with notifications for new messages. ",
    image: "/connect.png",
    tags: ["Kotlin", "XML", "Android Studio"],
    category: "android app",
    github: "",
  },
  {
    id: 2,
    title: "Railway Reservation Website",
    date: "Nov 2022 - Dec 2022",
    description:
      "A non-functional, front-end website built using HTML, CSS, and JavaScript. It features a static user interface for booking train tickets, meals, air tickets, and stays. Integrated with videos and forms, the design is fully responsive but lacks back-end functionality. ",
    image: "/railway.png",
    tags: ["HTML", "CSS", "JS", "Bootstrap"],
    category: "web app",
    github:
      "https://github.com/PulkitShubham/Railway-Reservation-System-Website",
  },
  {
    id: 3,
    title: "Dogs V/s Cats Image Classifier",
    date: "Dec 2023 - Jan 2024",
    description:
      "Developed an image classification model to distinguish between cats and dogs using a Kaggle dataset. Implemented a Convolutional Neural Network (CNN) using TensorFlow and Keras, leveraging generators for efficient image loading and preprocessing. The model was built and trained in Python, utilizing tools like NumPy, Pandas, and OpenCV for data handling, and Matplotlib for visualizing performance. This project showcases deep learning expertise and the application of CNNs for real-world image classification.",
    image: "/classifier.png",
    tags: [
      "Tensorflow",
      "Keras",
      "Python",
      "NumPy & Pandas",
      "OpenCV",
      "Google Colab",
      "Scikit-learn",
    ],
    category: "machine learning",
    github: "https://github.com/PulkitShubham/Cat_And_Dog_Image_Classifier",
  },
  {
    id: 10,
    title: "SMS Spam Classifier",
    date: "Dec 2023 - Jan 2024",
    description:
      "Developed an SMS Spam Classifier using Convolutional Neural Networks (CNN) to detect and filter spam messages with high accuracy. The project involved preprocessing text data using tokenization and word embeddings, followed by constructing a CNN model with convolutional and pooling layers to capture key spam-related patterns. ",
    image: "/sms.png",
    tags: [
      "Python",
      "Jupyter Notebook",
      "NLTK",
      "scikit-learn",
      "streamlit",
      "XGBoost",
    ],
    category: "machine learning",
    github: "https://github.com/PulkitShubham/SMS_Spam_Classifier",
  },
  {
    id: 4,
    title: "Rainwater Harvesting System",
    date: "March 2023",
    description:
      "A Rainwater Harvesting website using HTML, CSS, and JavaScript to promote sustainable water conservation practices. The site educates users about the benefits of rainwater harvesting and includes an interactive water conservation calculator. This calculator helps users estimate the total amount of water they can conserve based on factors like roof area and rainfall, encouraging responsible water usage in daily life.",
    image: "/rainwater.png",
    tags: ["HTML", "CSS", "JS", "Bootstrap"],
    category: "web app",
    github: "https://pulkitshubham.github.io/Rainwater-Harvesting/",
  },
];
