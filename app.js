// ============================================================
// Salesforce Certified User Experience (UX) Designer Simulator — Core Logic
// Full Simulator with 187 questions mapped to official exam domains
// Dual-Shuffle Engine: Fisher-Yates global + per-question option shuffle
// ============================================================

"use strict";

// ---------- Category Constants ----------
const CATEGORIES = {
  DISCOVERY: "Discovery",
  UX_FUNDAMENTALS: "UX Fundamentals",
  HUMAN_CENTERED_DESIGN: "Human-Centered Design",
  DECLARATIVE_DESIGN: "Declarative Design",
  TESTING: "Testing",
  SLDS: "Salesforce Lightning Design System (SLDS)"
};

// ---------- Category Exam Weights ----------
const CATEGORY_WEIGHTS = {
  [CATEGORIES.DISCOVERY]: "13%",
  [CATEGORIES.UX_FUNDAMENTALS]: "16%",
  [CATEGORIES.HUMAN_CENTERED_DESIGN]: "12%",
  [CATEGORIES.DECLARATIVE_DESIGN]: "27%",
  [CATEGORIES.TESTING]: "11%",
  [CATEGORIES.SLDS]: "21%"
};

// ---------- Category to Tab Mapping ----------
// Tab 0 = Dashboard, Tabs 1-6 = Categories, Tab 7 = Full Simulator
const TAB_CATEGORIES = [
  null,
  CATEGORIES.DISCOVERY,
  CATEGORIES.UX_FUNDAMENTALS,
  CATEGORIES.HUMAN_CENTERED_DESIGN,
  CATEGORIES.DECLARATIVE_DESIGN,
  CATEGORIES.TESTING,
  CATEGORIES.SLDS,
  null
];

// ---------- Global State ----------
const state = {
  questions: [],          // Parsed questions array
  activeTab: 0,
  mode: "study",          // "study" | "exam"
  answers: {},            // { questionId: [selectedChoiceTexts] }
  submitted: {},          // { questionId: true }
  shuffleMap: {},         // { questionId: [shuffledChoiceTexts] }
  timerInterval: null,
  timerSeconds: 105 * 60, // 105 minutes
  examSubmitted: false
};

// ---------- DOM References ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================
// SECTION 1: PASSWORD SECURITY
// ============================================================

const TARGET_PASSWORD_HASH = "79f75d16"; // Hash of "Salesforce2026"

function djb2(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

window.checkPassword = function (e) {
  if (e) e.preventDefault();
  const input = document.getElementById("password-input");
  const errorEl = document.getElementById("password-error");
  if (!input) return;

  const entered = input.value;
  if (djb2(entered) === TARGET_PASSWORD_HASH) {
    unlockApp();
  } else {
    if (errorEl) errorEl.style.display = "block";
    input.value = "";
    input.focus();
  }
};

function unlockApp(instant = false) {
  sessionStorage.setItem("simulator_unlocked", "true");
  const overlay = document.getElementById("password-overlay");
  const header = $(".app-header");
  const main = $("#app-container");

  if (overlay) {
    if (instant) {
      overlay.style.transition = "none";
      overlay.style.display = "none";
    }
    overlay.classList.add("unlocked");
  }
  if (header) header.classList.remove("hidden");
  if (main) main.classList.remove("hidden");
}

// ============================================================
// SECTION 2: HARDCODED QUESTIONS MATRIX
// ============================================================

const QUESTIONS = [
  {
    "id": 1,
    "category": "Testing",
    "question": "Cloud Kicks (CK) is going to launch a new Salesforce process for its Customer Service team. After launch, CK wants to ensure the process is working well for its customer service representatives. Which three Salesforce tools should be used to track and measure the adoption of the new process? (Choose 3 answers)",
    "choices": [
      "User Engagement Dashboard and Report",
      "Custom Permission Sets",
      "Salesforce Surveys for user Satisfaction",
      "Visualforce App",
      "Chatter polls"
    ],
    "correctAnswerText": [
      "User Engagement Dashboard and Report",
      "Salesforce Surveys for user Satisfaction",
      "Chatter polls"
    ],
    "explanation": "To track and measure the adoption of the new process, CK should use User Engagement Dashboard and Report, Salesforce Surveys for user Satisfaction, and Chatter polls."
  },
  {
    "id": 2,
    "category": "Declarative Design",
    "question": "A UX Designer is going to create a custom app for a new team of service agents. Which three parts of the user interface could be customized? (Choose 3 answers)",
    "choices": [
      "Tabs within the app’s navigation bar",
      "Relationship between standard objects",
      "Page layouts of the records",
      "Details to be shown in the records highlights panels",
      "Opportunity lead scoring"
    ],
    "correctAnswerText": [
      "Tabs within the app’s navigation bar",
      "Page layouts of the records",
      "Details to be shown in the records highlights panels"
    ],
    "explanation": "To create a custom app for service agents, a UX Designer can customize tabs in the navigation bar, record page layouts, and details in record highlight panels."
  },
  {
    "id": 3,
    "category": "Declarative Design",
    "question": "A UX Designer at Cloud Kicks (CK) recommends a Salesforce Console application for CK’s service representatives. The service representatives work on multiple support cases per hour, accessing them via queues, calls, or live chat. Which console navigation feature would NOT be relevant to the designer recommendation?",
    "choices": [
      "More than one detail item can be open at a time.",
      "Multiple subtabs can be beneath a single parent record.",
      "A split list of records and individual record detail can be seen on the same screen.",
      "Service representatives with lower resolution monitors will have a better user experience."
    ],
    "correctAnswerText": "Service representatives with lower resolution monitors will have a better user experience.",
    "explanation": "A Salesforce Console application requires a minimum screen resolution of 1024 x 768 pixels to display properly, so reps with lower resolution monitors will not have a better experience."
  },
  {
    "id": 4,
    "category": "Discovery",
    "question": "Cloud kicks wants to hire a deal closer. Which three activities wouldsomeone in this role do each day? Choose 3 answers",
    "choices": [
      "Update existing prospect and customer records.",
      "Log activities such as calls, emails, and notes.",
      "Review and work through their list of leads or opportunities.",
      "Create cases from issues.",
      "Customize and administer Salesforce."
    ],
    "correctAnswerText": [
      "Update existing prospect and customer records.",
      "Log activities such as calls, emails, and notes.",
      "Review and work through their list of leads or opportunities."
    ],
    "explanation": "A deal closer is someone who is responsible for closing sales deals with prospects and customers. They need to update existing prospect and customer records to keep track of their interactions and status. They also need to log activities such as calls, emails, and notes to document their communication and follow-ups. They also need to review and work through their list of leads or opportunities to prioritize their tasks and identify the best prospects to focus on. These activities are essential for a deal closer to manage their pipeline and achieve their sales goals. Creating cases from issues and customizing and administering Salesforce are not activities that a deal closer would do each day. These are more likely to be done by a customer service agent or a Salesforce administrator, respectively. Reference: [Salesforce Certified User Experience Designer Exam Guide], [UX Designer Certification Prep: User Research], [UX Designer Certification Prep: User Roles and Personas]"
  },
  {
    "id": 5,
    "category": "Declarative Design",
    "question": "A sales representative needs to quickly see key fields whenever viewing an opportunity. Which three Salesforce feature would allow fields to be available when they are viewing arecord? Choose 3 answers",
    "choices": [
      "Customer Links",
      "Highlights Panel",
      "Compact Layout",
      "Tabs",
      "List Views"
    ],
    "correctAnswerText": [
      "Highlights Panel",
      "Compact Layout",
      "List Views"
    ],
    "explanation": "These three features allow fields to be available when viewing a record in Salesforce. A highlights panel displays key fields at the top of a record page in Lightning Experience. It can be customized to show the most important information for each object. A compact layout determines which fields appear in the highlights panel, the list view hover, and the Salesforce app. It can be assigned to different record types and profiles. A list view displays a set of records that meet specified filter criteria. It can be sorted and filtered by different fields, and users can select which fields to display in the list view. Reference: [Customize the Highlights Panel] [Create and Assign Compact Layouts] [Create and Customize List Views]"
  },
  {
    "id": 6,
    "category": "Testing",
    "question": "A UX Designer has created two different user interface designs for a new marketing landing expected to haveseveral visitors. The landing page has a contact from on it, and the designer wants to know which design products the most from completions. Which testing method should be used?",
    "choices": [
      "Card Sorting",
      "User Acceptance testing",
      "Diary Studies",
      "A/B testing"
    ],
    "correctAnswerText": "A/B testing",
    "explanation": "A/B testing is a testing method that compares two versions of a user interface design to measure which one performs better in terms of a specific goal, such as form completions. A/B testing can help the UX Designer to evaluate the effectiveness of different design elements, such as layout, color, typography, copy, etc. A/B testing can also help the UX Designer to optimize the conversion rate of the landing page and increase the number of leads generated. Reference: [A/B Testing], [Optimize Your Landing Pages with A/B Testing]"
  },
  {
    "id": 7,
    "category": "Declarative Design",
    "question": "Cloud Kicks marketing development representatives need to process incoming leads. Understanding the typical lead to opportunity is essential to the design. Which three new records would typically be created when they convert a lead? Choose 3 answers",
    "choices": [
      "Contact",
      "Activity",
      "Converted Lead",
      "Account",
      "Opportunity"
    ],
    "correctAnswerText": [
      "Contact",
      "Account",
      "Opportunity"
    ],
    "explanation": "When a lead is converted in Salesforce, three new records are typically created: a contact, an account, and an opportunity. A contact is a person who is associated with an account and has a role in a sales process. An account is a company or organization that is a potential or existing customer. An opportunity is a sales deal that is in progress or has been closed. These records are linked together and use the information from the lead record. The lead record becomes read-only and is marked as converted. Reference: <u>Convertng Leads</u> <u>Lead Conversion in Salesforce</u>"
  },
  {
    "id": 8,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Which two resource of the Salesforce Lightning Design System (SLDS) could be used to make custom application look, act,and sound like Salesforce? Choose 2 answers",
    "choices": [
      "Full functional components",
      "Blueprints and tokens",
      "In-App Guidance",
      "Guidelines for voice and tone"
    ],
    "correctAnswerText": [
      "Blueprints and tokens",
      "Guidelines for voice and tone"
    ],
    "explanation": "The Salesforce Lightning Design System (SLDS) is a collection of resources that help you create user interfaces that are consistent with the Salesforce Lightning principles, design language, and best practices. The SLDS resources that could be used to make custom applications look, act, and sound like Salesforce are: Blueprints and tokens: Blueprints are ready-to-use HTML and CSS UI elements that provide the foundation for Salesforce experience development. Tokens are visual design values and attributes that ensure branding and UI consistency at scale. By using blueprints and tokens, you can create custom components that follow the SLDS design standards and patterns. Guidelines for voice and tone: Voice and tone guidelines help you write clear, concise, and consistent content that reflects the Salesforce brand personality and values. By using voice and tone guidelines, you can create custom applications that communicate effectively and respectfully with your users. The SLDS resources that are not relevant to make custom applications look, act, and sound like Salesforce are: Full functional components: Full functional components are pre-built Lightning components that provide out-of-the-box functionality and interactivity. They are not part of the SLDS, but rather part of the Lightning Component Library. You can use full functional components to speed up your development process, but they are not necessary to make custom applications look, act, and sound like Salesforce. In-App Guidance: In-App Guidance is a feature that allows you to create and deliver contextual help and training to your users within your application. It is not part of the SLDS, but rather part of the Salesforce Platform. You can use In-App Guidance to enhance your user experience and adoption, but it is not essential to make custom applications look, act, and sound like Salesforce. <u>Reference: Lightning Design System, Explore SLDS Resources, Getng Started</u>"
  },
  {
    "id": 9,
    "category": "UX Fundamentals",
    "question": "In which two ways could the usability of accordion elements be improved in a mobile environment? Choose 2 answers",
    "choices": [
      "Include persistent headings.",
      "Nest an accordion inside of another",
      "Use the ‘’back’’ browser button to collapse content",
      "Only allow users to open one selection at a time."
    ],
    "correctAnswerText": [
      "Include persistent headings.",
      "Only allow users to open one selection at a time."
    ],
    "explanation": "Accordion elements are UI components that allow users to expand and collapse sections of content. They are useful for organizing information in a limited space, such as on mobile devices. However, they also have some usability challenges, such as discoverability, accessibility, and navigation. To improve the usability of accordion elements in a mobile environment, two possible ways are: Include persistent headings. Persistent headings are the labels that indicate the content of each section and allow users to tap on them to expand or collapse the content. Persistent headings should be visible at all times, even when the content is expanded, so that users can easily see the context and switch between sections. Persistent headings should also be clear, concise, and descriptive, so that users can understand what each section contains and decide whether to explore it or not. [UX Designer Certification Prep: User Interface Design Principles], [UX Designer Certification Prep: Mobile Design] Only allow users to open one selection at a time. This means that when a user taps on a heading to - A. Tab visibility is dependent on the location of the user.Different menu configurations can be set for different types of users. - B. Navigation items are configure in the Salesforce Navigation Setup mode. - C. Visualforce pages and Lightning pages can be included #### **Answer: B C** Explanation: The Salesforce Navigation Setup mode allows the administrator to customize the navigation menu and navigation bar of the Salesforce mobile app using the Mobile Only app. The administrator can select the Lightning pages, Visualforce pages, Lightning components, and other productivity items that they want to appear in the navigation menu and navigation bar. The administrator can also <u>reorder the navigaton items and create tabs for them. To customize navigaton items, in the Quick Find box, enter Navigaton, and select Salesforce Navigaton 1. Visualforce pages and Lightning pages</u> can be included in the navigation menu and navigation bar of the Salesforce mobile app, as long as <u>they have tabs created for them. To create a tab, from Setup, enter Tabs in the Quick Find box, and select Tabs 1. Reference: [Customize the Mobile Only Navigaton Menu in the Salesforce Mobile App]</u> (https://help.salesforce.com/s/articleView?id=sf.salesforce_app_customize_nav_menu.htm&langua ge=en_US&type=5)"
  },
  {
    "id": 10,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks’ Sales team needs in-App Guidance for key functions and processes so they can maximum their time. In which three ways should a UX Designer customize the Salesforce Help Menu to meet this request/ Choose 3 answers",
    "choices": [
      "Provide the user with asite map of all the content.",
      "Add links to printable tipsheets or training videos.",
      "Create a just-in-time pop-up content based on new feature rollouts.",
      "Provide access to specific Trailhead or MyTrailhead content.",
      "Add links to a company dictionaryor glossary of key terms."
    ],
    "correctAnswerText": [
      "Add links to printable tipsheets or training videos.",
      "Create a just-in-time pop-up content based on new feature rollouts.",
      "Provide access to specific Trailhead or MyTrailhead content."
    ],
    "explanation": "A UX Designer can customize the Salesforce Help Menu to meet the request of providing in-app guidance for key functions and processes for the Cloud Kicks’ Sales team in the following ways: Add links to printable tipsheets or training videos: This can help the Sales team to learn and review <u>the key functons and processes at their own pace and convenience. The tpsheets or videos can be hosted on internal or external websites, and can be added to the custom help menu secton in the Help Menu setngs1. The links can have descriptve labels and icons to make them easy to identfy</u> and access. Create a just-in-time pop-up content based on new feature rollouts: This can help the Sales team to <u>get familiar with the new features and functonalites that are introduced in the app. The pop-up</u> <u>content can be created using the In-App Guidance Builder2, which allows the UX Designer to defne</u> the content type, style, placement, timing, and audience of the pop-up. The pop-up content can include text, images, videos, or links to more resources. Provide access to specific Trailhead or MyTrailhead content: This can help the Sales team to gain skills <u>and knowledge on the key functons and processes in a gamifed and interactve way. The Trailhead or MyTrailhead content can be customized to match the business goals and branding of Cloud Kicks3. The content can be added to the custom help menu secton in the Help Menu setngs1, or embedded in the app using the Trailhead Component4.</u> Reference: <u>Customize the Help Menu in Lightning Experience</u> <u>Create In-App Guidance for Your Users Customize Your Learning Experience with MyTrailhead Add the Trailhead Component to Your App</u>"
  },
  {
    "id": 11,
    "category": "Testing",
    "question": "A UX Designer has recently released a feature on experience Cloud and wants to know if the feature was successful and track usability over time. Which research methodology should be used?",
    "choices": [
      "Qualification",
      "Quantitative",
      "Qualitative",
      "Quantizing"
    ],
    "correctAnswerText": "Quantitative",
    "explanation": "Quantitative research methodology should be used to measure the success and usability of a feature on Experience Cloud. Quantitative research involves collecting and analyzing numerical data that can be measured, compared, or statistically tested. Quantitative research can help answer questions such as: How many users are using the feature? How often are they using it? How long does it take them to complete a task with the feature? How satisfied are they with the feature? How does the feature affect key performance indicators, such as conversion rates, retention rates, or revenue? Quantitative research methods can include surveys, analytics, A/B testing, usability testing, and benchmarking. These methods can provide objective and reliable data that can be used to evaluate the impact and effectiveness of a feature on Experience Cloud. Qualitative research methodology, on the other hand, involves collecting and analyzing nonnumerical data that can reveal users’ at udes, behaviors, motivations, and preferences. Qualitative research can help answer questions such as: Why are users using or not using the feature? What are their pain points, needs, and goals with the feature? How do they feel about the feature? What are their expectations and feedback for the feature? How does the feature fit into their context and workflow? Qualitative research methods can include interviews, focus groups, observations, diary studies, and card sorting. These methods can provide rich and detailed insights that can be used to understand the user experience and identify opportunities for improvement. Both quantitative and qualitative research methods are valuable for UX design, but they serve different purposes and answer different types of questions. In this case, the UX designer wants to know if the feature was successful and track usability over time, which are questions that can be best answered by quantitative research methods. <u>Reference: User Research Methods, Quanttatve vs. Qualitatve Usability Testng, 8 Essental Usability Testng Methods for UX Insights</u>"
  },
  {
    "id": 12,
    "category": "Declarative Design",
    "question": "Cloud Kicks (CK) has an Unlimited Edition Salesforce org. CK’s UX Designer has identified that dynamic dashboards could be a useful tool to improve orgusability and experience. How many different dynamic dashboards could they create?",
    "choices": [
      "Up to 3",
      "Unlimited",
      "Up to 20",
      "Up to 10"
    ],
    "correctAnswerText": "Up to 10",
    "explanation": "According to the Salesforce documentation, the number of dynamic dashboards that an organization can have depends on the edition of Salesforce that they are using. A dynamic dashboard is a dashboard that runs using the security settings of the user viewing the dashboard, so that each user sees the data according to their own access level. Dynamic dashboards are useful for sharing one common set of dashboard components to users with different levels of access, without having to create separate dashboards for each user or role. The documentation states that: Enterprise Edition can use up to 5 dynamic dashboards Unlimited and Performance Edition can use up to 10 dynamic dashboards Developer Edition can use up to 3 dynamic dashboards Additional dynamic dashboards may be available for purchase <u>Therefore, since Cloud Kicks has an Unlimited Editon Salesforce org, they can create up to 10 diferent dynamic dashboards1 Reference: Taking Advantage of Dynamic Dashboards | Salesforce Developers</u>"
  },
  {
    "id": 13,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks wants to modify one of its custom Lightning Web Components so that itsadministrators can change the look and feel depending on what type of Lightning page is used in. Which feature should be recommended?",
    "choices": [
      "Styling hooks",
      "CSS loaded as a static resource",
      "App Builder styling property",
      "SLDS utility classes"
    ],
    "correctAnswerText": "App Builder styling property",
    "explanation": "An App Builder styling property is a feature that allows a Lightning web component to expose CSS properties that can be set by an administrator in the Lightning App Builder. This way, the administrator can customize the look and feel of the component depending on the context and use case. For example, a component can have a styling property for the background color, the font size, or the border radius. The administrator can then change these values in the App Builder without modifying the code of the component. Reference: [Create App Builder Styling Properties]"
  },
  {
    "id": 14,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks wants to create an external facing site where users can: - Manage and submit cases via the web. - Browse and search Knowledge Base articles. - Contact Support via lice chat. Which cloud should be used to design an appropriate solution for CK’s users? #####",
    "choices": [
      "Experience Cloud",
      "Sales Cloud",
      "Marketing Cloud",
      "Service Cloud"
    ],
    "correctAnswerText": "Experience Cloud",
    "explanation": "Experience Cloud is the best cloud to design an appropriate solution for Cloud Kicks’ users. Experience Cloud allows the business to create an external facing site where users can manage and submit cases via the web, browse and search Knowledge Base articles, and contact Support via live chat. Experience Cloud also provides branding options, personalization features, and collaboration tools to enhance the user experience and engagement. Experience Cloud integrates with Service Cloud, which is the cloud that provides the case management, knowledge base, and live chat functionalities. Therefore, Experience Cloud is the cloud that enables the design of the user interface, while Service Cloud is the cloud that enables the backend service processes. Reference: [Experience Cloud Overview] (https://www.getapp.com/operationsmanagement-software/a/salesforce-1-service-cloud/compare/salesforce-community-cloud/), [Service Cloud Overview] (https://titandxp.com/salesforce-experience-cloud-vs-service-cloud/)"
  },
  {
    "id": 15,
    "category": "Declarative Design",
    "question": "Service agents are complaining that the new custom object to track reservation has too many fields and is duttering their layouts. All of the fields are necessary, but they would like to display fields and sections of the record as individual components on the page layout with visibility depending on where they are in the reservation process. Which feature should be recommended?",
    "choices": [
      "AppExchange Apps",
      "Dynamic Forms",
      "Process Builder",
      "In-App Prompts"
    ],
    "correctAnswerText": "Dynamic Forms",
    "explanation": "Dynamic Forms is a feature that allows users to customize the layout of a record detail page by placing fields and sections anywhere on the page, and applying visibility rules to show or hide them based on certain criteria. Dynamic Forms can help service agents to create user-centric, intuitive, and dynamic layouts that display only the relevant fields and sections for the reservation process. Dynamic Forms can also improve page load times and reduce the need for multiple page layouts and <u>record types. Dynamic Forms is currently available for custom objects and some standard objects in Lightning Experience12. Reference:</u> <u>Dynamic Forms Get Started with Dynamic Forms</u>"
  },
  {
    "id": 16,
    "category": "UX Fundamentals",
    "question": "Which visual design elements should be used in corporate style and branding guidelines?",
    "choices": [
      "Typography. Color, Imagery",
      "A/BTesting, Heuristics, Dairy Studies",
      "Sketching, Wireframes, Storyboards",
      "User Stories, Scenario, UX Reviews"
    ],
    "correctAnswerText": "Typography. Color, Imagery",
    "explanation": "Typography, color, and imagery are visual design elements that can be used to create a consistent and recognizable corporate style and branding. Typography refers to the choice and use of fonts, sizes, weights, and spacing to convey meaning and hierarchy. Color refers to the selection and application of hues, shades, tints, and tones to create contrast, harmony, and mood. Imagery refers to the use of photos, illustrations, icons, and graphics to communicate messages, concepts, and emotions. Reference: [Salesforce Certified User Experience Designer Exam Guide], Section 2.3: Demonstrate knowledge of C. Let them know the designer is the expert. D. Hand them a printout of the design #### **Answer: A** Explanation: Inviting developers to user testing is a good way to help them see the value of the design changes and understand the user needs and pain points. User testing is a method of evaluating a product or service by observing how real users interact with it and collecting feedback. By witnessing the user testing sessions, developers can see how the design changes improve the user experience, such as increasing usability, satisfaction, engagement, or conversion. User testing can also help developers empathize with the users and collaborate better with the designer. Reference: [User Testing]"
  },
  {
    "id": 17,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks wants to apply branding to its current Salesforce org, currently using Lightning Experience. The look and feel must follow company design guidelines. Which declarative design properties should be used to achieve this?",
    "choices": [
      "Create a custom Theme in Themes and Branding, selecting logo, brand colors, and images.",
      "Design a custom Branding set in use interface, selecting a logo,colors, and font type.",
      "Develop a custom Layout in user interface, attaching a new stylesheet in static resources.",
      "Choose one of the built-in Salesforce themes that closest matches the design guidelines"
    ],
    "correctAnswerText": "Create a custom Theme in Themes and Branding, selecting logo, brand colors, and images.",
    "explanation": "The best way to apply branding to a Salesforce org using Lightning Experience is to create a custom theme in Themes and Branding. Themes and Branding is a feature that allows the administrator to customize the look and feel of Salesforce to match the branding of the organization. The administrator can add logos, default images, and colors to the theme. The administrator can also choose one of the built-in Salesforce themes, or create their own custom themes with just a few clicks. To create a custom theme, from Setup, enter Themes and Branding in the Quick Find box, then select Themes and Branding. Click New Theme and upload the logo, brand colors, and images that <u>follow the company design guidelines. The administrator can also preview and actvate the theme for the entre org 1. Reference: [Brand Your Org in Lightning Experience]</u> (https://help.salesforce.com/s/articleView?id=sf.brand_your_org_in_lightning_experience.htm&lan guage=en_US&type=5)"
  },
  {
    "id": 18,
    "category": "Testing",
    "question": "A UX Designerhas created a new form for a call center that takes special delivery information from its customers. The designer wants to ensure the call center staff finds the form easy and intuitive to use. Which kind of testing should be conducted to validate this?",
    "choices": [
      "Usability Testing",
      "Survery",
      "Focus Groups",
      "Qualitative"
    ],
    "correctAnswerText": "Usability Testing",
    "explanation": "Usability testing is a type of testing that evaluates how easy and intuitive a product or service is to use by observing real users performing specific tasks. Usability testing can help the UX Designer to measure the effectiveness, efficiency, and satisfaction of the new form for the call center staff. Usability testing can also help to identify any usability issues or areas for improvement in the form <u>design. Usability testng can be conducted in various ways, such as moderated or unmoderated, remote or in-person, qualitatve or quanttatve, or using various tools and methods12. Reference: Usability Testng Usability Testng Methods</u>"
  },
  {
    "id": 19,
    "category": "UX Fundamentals",
    "question": "What would it mean for the user when designing perceivable content?",
    "choices": [
      "The content should only be visible.",
      "The content should not be visible to all senses.",
      "The content should not be visible to all senses.",
      "The content should only be audible."
    ],
    "correctAnswerText": "The content should only be visible.",
    "explanation": "According to the Web Content Accessibility Guidelines (WCAG), which are the leading international standards for accessible web design, perceivable content is content that can be presented to users in <u>ways they can perceive. This means that the content should be available to the senses (vision, touch, and hearing) either through the browser or through assistve technologies like screen readers, screen enlargers, and others1. Therefore, the content should only be visible is the correct answer, as it</u> implies that the content can be seen by users who rely on vision to access the web. The other options are incorrect, as they suggest that the content is not perceivable to all users. Reference: <u>Web Accessibility For Beginners | DigitalOcean, Perceivable: Content on the web should be</u> perceivable."
  },
  {
    "id": 20,
    "category": "Testing",
    "question": "A UX Designer is in the process of designing a new page layout for a custom object in Salesforce. How should the designer ensure thebest end-user experience?",
    "choices": [
      "Include all potentially useful fields.",
      "Make field labels and API names identical.",
      "Mark all fields as required.",
      "Group similar fields using sections."
    ],
    "correctAnswerText": "Group similar fields using sections.",
    "explanation": "The best way to ensure the end-user experience when designing a new page layout for a custom object in Salesforce is to group similar fields using sections. Sections are UI components that allow you to organize fields into logical groups and provide headings and descriptions for each group. Sections help to improve the readability, scannability, and usability of the page layout by reducing the visual clutter and providing a clear structure and hierarchy for the information. Sections also help to align the page layout with the user’s mental model and expectations, as well as the business processes and workflows. [UX Designer Certification Prep: User Interface Design Principles], [UX Designer Certification Prep: Salesforce Design System] Including all potentially useful fields is not a good way to ensure the end-user experience when designing a new page layout for a custom object in Salesforce, because it can create a crowded and overwhelming interface that is hard to navigate and understand. It can also increase the cognitive load and the scrolling effort for the user, as well as the maintenance cost for the designer. It is better to include only the essential and relevant fields that the user needs to perform their tasks and goals, and use other methods such as related lists, tabs, or modals to display additional information. [UX Designer Certification Prep: User Interface Design Principles], [UX Designer Certification Prep: Salesforce Design System] Making field labels and API names identical is not a good way to ensure the end-user experience when designing a new page layout for a custom object in Salesforce, because it can create confusion and inconsistency for the user and the developer. Field labels are the text that appear on the user interface to identify the fields, while API names are the unique identifiers that are used by the system and the code to reference the fields. Field labels and API names should be different, because they have different purposes and audiences. Field labels should be clear, concise, and descriptive, using natural language and proper capitalization, punctuation, and spacing. API names should be concise, unique, and consistent, using underscores and camel case to separate words. [UX Designer Certification Prep: User Interface Design Principles], [UX Designer Certification Prep: Salesforce Design System] Marking all fields as required is not a good way to ensure the end-user experience when designing a new page layout for a custom object in Salesforce, because it can create frustration and annoyance for the user, as well as increase the error rate and the abandonment rate. Required fields are fields that the user must fill in before they can save or submit the record. Required fields should be used sparingly and only for the fields that are absolutely necessary for the system or the business logic. Marking all fields as required can make the user feel pressured and constrained, and force them to enter irrelevant or inaccurate data. It can also make the user miss the truly important fields, or give up on completing the record altogether. [UX Designer Certification Prep: User Interface Design Principles], [UX Designer Certification Prep: Salesforce Design System] Reference: [UX Designer Certification Prep: User Interface Design Principles], [UX Designer Certification Prep: Salesforce Design System]"
  },
  {
    "id": 21,
    "category": "Declarative Design",
    "question": "A UX Designer wants to ensurenew Salesforce users are given the appropriate onboarding experience. Which two on-App Guidance customizations should be used?",
    "choices": [
      "Specify prompt scheduling",
      "Customize prompt theme",
      "Set prompt permissions",
      "Configure minimum three steps"
    ],
    "correctAnswerText": [
      "Specify prompt scheduling",
      "Set prompt permissions"
    ],
    "explanation": "To ensure new Salesforce users are given the appropriate onboarding experience, a UX Designer should use the following two on-App Guidance customizations: Specify prompt scheduling: This allows the designer to control when and how often the prompts appear to the users, based on criteria such as start and end dates, frequency, and snooze duration. This way, the designer can tailor the onboarding experience to the users’ needs and preferences, and avoid overwhelming or annoying them with too many or irrelevant prompts. Set prompt permissions: This allows the designer to target the prompts to specific user groups, based on profiles and permissions. This way, the designer can ensure that the prompts are relevant and useful to the users, and avoid showing them information that they do not need or have access to. Reference: <u>Salesforce In-App Guidance: Enhance Your User Experience</u> Create and Manage In-App Guidance Prompts"
  },
  {
    "id": 22,
    "category": "Discovery",
    "question": "Cloud Kicks wants to drive engagement on its website. Which two Salesforce features should boost engagement? Choose 2 answers",
    "choices": [
      "Einstain Bots",
      "Automated Invitations",
      "MyTrailhead",
      "Salesforce Connect"
    ],
    "correctAnswerText": [
      "Einstain Bots",
      "Automated Invitations"
    ],
    "explanation": "Einstein Bots and Automated Invitations are two Salesforce features that can boost engagement on Cloud Kicks’ website. Einstein Bots are chatbots that can provide automated and personalized responses to customers’ questions and requests on the website. They can also escalate complex <u>cases to human agents, collect feedback, and provide recommendatons. Einstein Bots can help Cloud Kicks to improve customer satsfacton, reduce wait tmes, and increase conversions 1.</u> Automated Invitations are pop-up messages that invite website visitors to start a chat or video call with a service agent. They can be triggered by various criteria, such as time spent on the website, <u>page visited, or customer profle. Automated Invitatons can help Cloud Kicks to proactvely engage with potental customers, ofer assistance, and generate leads 2. Reference: [Einstein Bots Basics]</u> (https://ascendix.com/blog/salesforce-sales-engagement/), [Set Up Automated Chat Invitations] (https://bing.com/search?q=Salesforce+features+to+boost+engagement)"
  },
  {
    "id": 23,
    "category": "Discovery",
    "question": "Which two consideration should be made when conducting a Consequence Scanning workshop? Choose 2 answers",
    "choices": [
      "Consider design ramifications to prevent misuse and protect communities.",
      "Prioritize marketing opportunities when designingfeatures of a product.",
      "Bring together a cross-function group with varied experiences.",
      "Examine a product for potential inclusivity after it has been built"
    ],
    "correctAnswerText": [
      "Consider design ramifications to prevent misuse and protect communities.",
      "Bring together a cross-function group with varied experiences."
    ],
    "explanation": "Consequence Scanning is a workshop method that helps teams to identify and mitigate the potential positive and negative impacts of their products or services on users, society, and the environment. When conducting a Consequence Scanning workshop, two important considerations are: Consider design ramifications to prevent misuse and protect communities: This means that teams should think beyond the intended use cases and benefits of their products or services, and also consider the possible unintended or harmful consequences that may arise from their design choices. For example, teams should ask themselves how their products or services could be misused, abused, or exploited by malicious actors, or how they could affect vulnerable or marginalized groups, or how they could contribute to environmental or social issues. By considering these design ramifications, teams can proactively address and mitigate the ethical risks and challenges that may emerge from their products or services, and protect the well-being and interests of their users and communities. Bring together a cross-function group with varied experiences: This means that teams should involve diverse and relevant stakeholders in the Consequence Scanning workshop, such as product managers, designers, developers, researchers, testers, marketers, legal experts, ethicists, users, or representatives from affected communities. By bringing together a cross-function group with varied experiences, perspectives, and backgrounds, teams can gain a more holistic and comprehensive understanding of the potential impacts of their products or services, and avoid blind spots, biases, or assumptions that may limit their vision or judgment. A cross-function group can also foster more creative and collaborative problem-solving, and generate more inclusive and responsible solutions. Reference: <u>How To Run a Consequence Scanning Workshop Consequence scanning: How to mitgate risks in your service Incorporate Ethics by Design Concepts</u>"
  },
  {
    "id": 24,
    "category": "Discovery",
    "question": "Financial advisor should be able to access a customer’s record in Sales Cloud and see all potential business opportunities related to each individual customer. The bank does not have any corporate or business customers at this time. How should a UX Designer suggest the bank represent its customers within its Salesforce instance? #####",
    "choices": [
      "Standard Person Account Object",
      "Standard Lead Object",
      "Standard Opportunity object.",
      "Standard Account object."
    ],
    "correctAnswerText": "Standard Person Account Object",
    "explanation": "A standard person account object is the best option for representing the bank’s customers within its Salesforce instance. A person account is a type of account that represents an individual rather than a company. Person accounts are a hybrid of the account and contact objects, combining their characteristics into one. They allow the bank to store information that applies to humans, such as first and last names, email, phone, address, etc. When a person account is created, a contact is automatically created and associated with the account. Person accounts are the Salesforce official model for representing an individual and can be used alongside business accounts for B2B and B2C <u>actvites. In Financial Services Cloud, person accounts can be used for a simplifed, customizable user experience1. A person account can also have related opportunites, which are potental sales or revenue-generatng events. This way, the fnancial advisor can access a customer’s record and see all potental business opportunites related to each individual customer2.</u> The other options are not suitable for the bank’s scenario. A standard lead object is a prospect or potential customer who has expressed interest in the bank’s products or services, but has not yet <u>qualifed as a sales opportunity. A lead can be converted into an account, a contact, and an opportunity when it is ready to be pursued3. However, the bank does not need to use leads to track</u> its customers, as they are already existing customers who have accounts with the bank. A standard opportunity object is a sales or revenue-generating event that is related to an account. An <u>opportunity can have multple stages, products, amounts, and probabilites of closing. An opportunity can also be linked to a campaign, which is a marketng initatve to generate leads or contacts4. However, the bank cannot use opportunites alone to represent its customers, as they are</u> not standalone objects, but rather depend on accounts. A standard account object is a company or organization that the bank does business with. An account can have multiple contacts, which are the <u>people who work at the account and interact with the bank. An account can also have related opportunites, cases, actvites, and other records5. However, the bank does not have any corporate</u> or business customers at this time, so using standard accounts would not reflect the nature of its individual customers. Reference: <u>Convert Salesforce Business Accounts to Person Accounts, In Financial Services Cloud, Person</u> Accounts can be used for a simplified, customizable user experience. <u>Person Accounts - Salesforce, Person Accounts Sales Cloud Basics Content Close Select Filters Product</u> Area Feature Impact Edition Developer Edition Enterprise Edition Essentials Edition Professional Edition Unlimited Edition Experience Salesforce Classic Mobile Lightning Experience Done 632 Results Configure Access to Thanks Badges Set Up WDC Configure Thanks in the Chatter Publisher and Salesforce Mobile App… Build a Culture of Recognition with WDC Manage WDC Enable or Disable WDC Settings WDC Editions and Permissions Skills Limitations Skills Customization Recommended WDC Profiles Recommended WDC Permission Sets Enable WDC Features Configure WDC Assign WDC Only User Licenses Assign WDC Licenses Configure WDC Features Assign a WDC Administrator Create a Support Case Considerations for Setting Up WDC Thanks and Skills Features Assign Publisher Layout to Profiles Assign WDC User Feature Licenses Assign WDC Profiles Assign WDC Permission Sets Endorse a Skill Via Record Detail Pages Add a Skill Via Record Detail Pages Remove a Skill Via Record Detail Pages Schedule Reminders to Update Opportunities View a List of the Accounts or Opportunities in Your Territories Things to Know About Enterprise Territory Management Territory Type Priority Optimizing Your Territory Model Continuously Designing Territory Models Territory Model Managing Territories Enterprise Territory Management Concepts Planning and Managing Territories Territory Model State Territory Type Territory Hierarchy Bird’s-Eye View of Planning and Managing Territories Report on Territories with Assigned Users Report on Territories Without Assigned Accounts Run Assignment Rules for a Territory Reporting on Territories Report on Users Not Assigned to Territories Report on Summarizable Account Fields by Territory Enterprise Territory Management Identify Territory Users by Territory Role Territory Run the Opportunity Territory Assignment Filter Preview Territory Assignments for Accounts Report on Accounts Assigned to Territories Manage Territories with Enterprise Territory Management View and Manage Assignment Rules at the Territory Model Level Enterprise Territory Management: What’s Different or Not Available… Show Your Reps Other Users Assigned to Their Leads’ Territories Enable Features for Enterprise Territory Management Maintain Enterprise Territory Management Find Out Which Territories an Assignment Rule Applies To Enable Enterprise Territory Management Report on the Accounts and Opportunities in Your Territories Explore Your Company’s Territory Model Identify Users in Territories Assigned to Accounts Enable Filter-Based Opportunity Territory Assignment Identify an Account’s Sales Territories Disable Enterprise Territory Management How Account Assignment Rules Work How Do Permissions for Territories Affect Feature and Data Access? Requirements for Assigning Opportunities to Territories Manually Assigning Opportunities to Territories Manually Delete a Territory Model Create a Territory Model Record Preparing Sales Management for Territory Reporting Setting Up and Managing Territory Assignments Define Default User Access for Territory Records <u>Account | Object Reference for the Salesforce Platorm | Salesforce …, Account | Object Reference</u> for the Salesforce Platform | Salesforce Developers Object Reference for the Salesforce Platform English Pages Winter '24 (API version 59.0) Summer '23 (API version 58.0) Spring '23 (API version 57.0) Winter '23 (API version 56.0) Summer '22 (API version 55.0) Spring '22 (API version 54.0) Winter '22 (API version 53.0) Summer '21 (API version 52.0) Spring '21 (API version 51.0) Winter '21 (API version 50.0) Summer '20 (API version 49.0) Spring '20 (API version 48.0) Winter '20 (API version 47.0) Summer '19 (API version 46.0) Spring '19 (API version 45.0) Winter '19 (API version 44.0) Summer '18 (API version 43.0) Spring '18 (API version 42.0) Winter '18 (API version 41.0) Summer '17 (API version 40.0) Spring '17 (API version 39.0) Winter '17 (API version 38.0) Summer '16 (API version 37.0) Spring '16 (API version 36.0) Winter '16 (API version 35.0) Summer '15 (API version 34.0) Spring '15 (API version 33.0) Winter '15 (API version 32.0) Summer '14 (API version 31.0) Spring '14 (API version 30.0) j Overview of Salesforce Objects and Fields Reference Associated Objects (Feed, History, OwnerSharingRule, Share, and ChangeEvent Objects) Custom Objects Object Interfaces Standard Objects AcceptedEventRelation Account AccountBrand AccountContactRelation AccountCleanInfo AccountContactRole AccountInsight AccountOwnerSharingRule AccountPartner AccountRelationship AccountRelationshipShareRule AccountShare AccountTag AccountTeamMember AccountTerritoryAssignmentRule AccountTerritoryAssignmentRuleItem AccountTerritorySharingRule AccountUserTerritory2View ActionCadence ActionCadenceRule ActionCadenceRuleCondition ActionCadenceStep ActionCadenceStepTracker ActionCadenceStepVariant ActionCadenceTracker ActionCdncStpMonthlyMetric ActionLinkGroupTemplate ActionLinkTemplate ActionPlan ActionPlanItem ActionPlanTemplate ActionPlanTemplateItem ActionPlanTemplateItemValue ActionPlanTemplateVersion ActiveFeatureLicenseMetric ActivePermSetLicenseMetric ActiveProfileMetric ActiveScratchOrg ActivityHistory ActivityMetric ActivityUsrConnectionStatus AdAvailabilityDimensions AdAvailabilityJob AdAvailabilityViewConfig AdBuyServerAccount AdCreativeSizeType AdDigitalAvailability AdditionalNumber Address AdLinearAvailability AdOpportunity AdOrderItem AdOrderItemCreativeSizeType AdOrderLineAdTarget AdPageLayoutType AdProductTargetCategory AdQuote AdQuoteLine AdQuoteLineCreativeSizeType AdQuoteLineAdTarget AdServer AdServerAccount AdServerUser AdSpaceCreativeSizeType AdSpaceGroupMember AdSpaceSpecification AdSpecMediaPrintIssue AdTargetCategory AdTargetCategorySegment AgentWork AgentWorkSkill AIApplication AIApplicationConfig AIInsightAction AIInsightFeedback AIInsightReason AIInsightValue AiModelLanguage AIRecordInsight AllowedEmailDomain AlternativePaymentMethod AnalyticsLicensedAsset Announcement ApexClass ApexComponent ApexLog ApexPage ApexPageInfo ApexTestQueueItem ApexTestResult ApexTestResultLimits ApexTestRunResult ApexTestSuite ApexTrigger ApexTypeImplementor AppAnalyticsQueryRequest AppDefinition AppExtension ApplicationFormTemplate AppMenuItem AppointmentAssignmentPolicy AppointmentScheduleAggr <u>Lead | Object Reference for the Salesforce Platorm | Salesforce …, Lead | Object Reference for the</u> Salesforce Platform | Salesforce Developers Object Reference for the Salesforce Platform English Pages Winter '24 (API version 59.0) Summer '23 (API version 58.0) Spring '23 (API version 57.0) Winter '23 (API version 56.0) Summer '22 (API version 55.0) Spring '22 (API version 54.0) Winter '22 (API version 53.0) Summer '21 (API version 52.0) Spring '21 (API version 51.0) Winter '21 (API version 50.0) Summer '20 (API version 49.0) Spring '20 (API version 48.0) Winter '20 (API version 47.0) Summer '19 (API version 46.0) Spring '19 (API version 45.0) Winter '19 (API version 44.0) Summer '18 (API version 43.0) Spring '18 (API version 42.0) Winter '18 (API version 41.0) Summer '17 (API version 40.0) Spring '17 (API version 39.0) Winter '17 (API version 38.0) Summer '16 (API version 37.0) Spring '16 (API version"
  },
  {
    "id": 25,
    "category": "Discovery",
    "question": "Which criteria should the designer consider when selecting users for testing?",
    "choices": [
      "Traits dissimilar to customer personas",
      "Traits similar to friends and family",
      "Traits similar to customer personas",
      "traits of the most common demographic and ability"
    ],
    "correctAnswerText": "Traits similar to customer personas",
    "explanation": "The designer should consider the traits similar to customer personas when selecting users for testing. Customer personas are fictional representations of the target users of a product or service, based on user research and data. Customer personas help the designer to understand the needs, goals, behaviors, and preferences of the users, as well as their pain points and challenges. Customer personas also help the designer to empathize with the users and design solutions that meet their expectations and requirements. [UX Designer Certification Prep: User Research], [UX Designer Certification Prep: User Roles and Personas] When selecting users for testing, the designer should aim to recruit users who match the traits of the customer personas as closely as possible. This ensures that the users who participate in the testing are representative of the actual or potential users of the product or service, and that the feedback and insights gathered from the testing are valid and reliable. Selecting users who have traits similar to customer personas also helps the designer to evaluate the usability and user experience of the product or service from the user’s perspective, and to identify and prioritize the areas for improvement. [UX Designer Certification Prep: User Research], [UX Designer Certification Prep: User Testing and Evaluation] Traits dissimilar to customer personas, traits similar to friends and family, and traits of the most common demographic and ability are not criteria that the designer should consider when selecting users for testing. These criteria can lead to biased or inaccurate results, as they do not reflect the diversity and complexity of the user population. Users who have traits dissimilar to customer personas may not have the same needs, goals, or expectations as the target users, and may provide feedback that is irrelevant or misleading. Users who have traits similar to friends and family may not be objective or honest in their feedback, and may have a different level of familiarity or expertise with the product or service than the target users. Users who have traits of the most common demographic and ability may not account for the variations and differences among the target users, and may exclude or marginalize the users who have special needs or preferences. [UX Designer Certification Prep: User Research], [UX Designer Certification Prep: User Testing and Evaluation] Reference: [UX Designer Certification Prep: User Research], [UX Designer Certification Prep: User Roles and Personas], [UX Designer Certification Prep: User Testing and Evaluation]"
  },
  {
    "id": 26,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks needs functional components thatwill be used on many pages. The components need to be consistent with the look and feel of Lightning Experience. What does the Salesforce Lightning Design System (SLDS) provide that will ensure consistency?",
    "choices": [
      "Experience Lightning Components",
      "ComponentBlueprints",
      "JavaScript Frameworks",
      "Custom Lightning components"
    ],
    "correctAnswerText": "ComponentBlueprints",
    "explanation": "The Salesforce Lightning Design System (SLDS) provides component blueprints that will ensure consistency for Cloud Kicks’ functional components. Component blueprints are ready-to-use HTML and CSS UI elements that provide the foundation for Salesforce experience development. They follow the design guidelines, accessibility standards, and best practices of Lightning Experience. They also include variants, states, and modifiers to handle different use cases and scenarios. By using component blueprints, Cloud Kicks can create functional components that are consistent with the look and feel of Lightning Experience without writing custom code or CSS. Reference: <u>Component Blueprints Introducton to the Salesforce Lightning Design System</u>"
  },
  {
    "id": 27,
    "category": "Testing",
    "question": "A Development team is not valuing the results of a usability testing session. How should acceptance of the results be increased?",
    "choices": [
      "Include links tobest practice artides for each finding.",
      "Invite team members to observe usability sessions.",
      "The Development team can perform script testing.",
      "Create a new prototype to demonstrate improvement."
    ],
    "correctAnswerText": "Invite team members to observe usability sessions.",
    "explanation": "One of the best ways to increase the acceptance of the results of a usability testing session is to invite the development team members to observe the usability sessions. By observing the sessions, the developers can see how the users interact with the product, what difficulties they face, what feedback they provide, and how they react emotionally. This can help the developers to empathize with the users, understand their needs and expectations, and appreciate the value of usability testing. Observing the sessions can also help the developers to identify and prioritize the issues that need to be fixed, and to collaborate with the UX designer on finding the best solutions. Reference: [How to Get Stakeholders to Buy into User Research] (https://ux.stackexchange.com/questions/31222/what-is-the-difference-between-usability-testingand-user-acceptance-testing), [How to Involve Developers in User Research] (https://bing.com/search?q=usability+testing+acceptance)"
  },
  {
    "id": 28,
    "category": "Declarative Design",
    "question": "A company provides away for customers to shop for homes and contact real estate agents online. The company’s brokers use some of the Salesforce standard functionality to track home buyers. Which three standard Salesforce objects should be used in this experience? Choose 3 answers",
    "choices": [
      "Property",
      "Lead",
      "Contact",
      "Opportunity",
      "Address"
    ],
    "correctAnswerText": [
      "Lead",
      "Contact",
      "Opportunity"
    ],
    "explanation": "The three standard Salesforce objects that should be used in this experience are: Lead: A lead is a person who has shown interest in the company’s products or services, but has not yet been qualified as a potential customer. Leads can be captured from various sources, such as web forms, referrals, events, or marketing campaigns. Leads can store information such as name, email, phone, company, and status. Leads can be converted into accounts, contacts, and opportunities when they are ready to buy. Contact: A contact is a person who is associated with an account and has a role in a sales process. Contacts can store information such as name, email, phone, title, and address. Contacts can be related to multiple accounts, opportunities, cases, activities, and other objects. Contacts can be used to track the communication and interaction history with the customers. Opportunity: An opportunity is a sales deal that is in progress or has been closed. Opportunities can store information such as name, amount, stage, probability, close date, and owner. Opportunities can be linked to accounts, contacts, products, price books, quotes, contracts, and other objects. Opportunities can be used to forecast revenue, manage sales pipeline, and track sales performance. Reference: <u>Standard Objects Leads and Opportunites Contacts</u>"
  },
  {
    "id": 29,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "What should a UX Designer use to design responsively within the Salesforce Lightning Design System (SLDS)?",
    "choices": [
      "JavaScript",
      "Material Design",
      "Lattice System",
      "Grid System"
    ],
    "correctAnswerText": "Grid System",
    "explanation": "A grid system is a set of columns and rows that help to organize and align the layout and content of a web page. The Salesforce Lightning Design System (SLDS) provides a responsive grid system that adapts to different screen sizes and devices. The SLDS grid system is based on the CSS Flexbox layout <u>module, which allows for fexible and dynamic positoning of elements. The SLDS grid system consists of the following components1:</u> Containers: These are the outermost elements that wrap the grid. They have a fixed width that changes according to the breakpoints defined by the SLDS. Breakpoints are the points at which the - <u>layout changes based on the screen size. The SLDS has four breakpoints: small, medium, large, and x large2.</u> Grids: These are the direct children of the containers. They are the main elements that define the <u>grid structure. They have a display property of fex, which enables the fexbox layout. They can also have modifers that control the alignment, directon, and wrapping of the grid items3.</u> Grid items: These are the direct children of the grids. They are the elements that contain the actual content of the page. They have a flex property that determines how much space they take up in the <u>grid. They can also have modifers that control the order, ofset, and visibility of the grid items4.</u> A UX Designer should use the SLDS grid system to design responsively within the SLDS, as it provides a consistent and flexible way to create layouts that work across different devices and screen <u>sizes. The SLDS grid system also follows the SLDS design principles and best practces, such as clarity, efciency, consistency, and beauty5.</u> ##### Reference: <u>Grid - Lightning Design System, Grid - Lightning Design System Grid HTML/CSS: Dev Ready</u> Responsive Terms of Service Privacy Responsible Disclosure Trust Cookies Settings Your Privacy Choices © Copyright 2015-present Salesforce, Inc. All rights reserved. Various trademarks held by their respective owners. - - <u>Breakpoints Lightning Design System, Breakpoints Lightning Design System Breakpoints</u> HTML/CSS: Dev Ready Responsive Terms of Service Privacy Responsible Disclosure Trust Cookies Settings Your Privacy Choices © Copyright 2015-present Salesforce, Inc. All rights reserved. Various trademarks held by their respective owners. <u>Grid - Lightning Design System, Grid - Lightning Design System Grid HTML/CSS: Dev Ready</u> Responsive Terms of Service Privacy Responsible Disclosure Trust Cookies Settings Your Privacy Choices © Copyright 2015-present Salesforce, Inc. All rights reserved. Various trademarks held by their respective owners. <u>Grid - Lightning Design System, Grid - Lightning Design System Grid HTML/CSS: Dev Ready</u> Responsive Terms of Service Privacy Responsible Disclosure Trust Cookies Settings Your Privacy Choices © Copyright 2015-present Salesforce, Inc. All rights reserved. Various trademarks held by their respective owners. - - <u>Design Principles Lightning Design System, Design Principles Lightning Design System Design</u> Principles HTML/CSS: Dev Ready Responsive Terms of Service Privacy Responsible Disclosure Trust Cookies Settings Your Privacy Choices © Copyright 2015-present Salesforce, Inc. All rights reserved. Various trademarks held by their respective owners."
  },
  {
    "id": 30,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer wants to explore sample code for Lightning components and see how changing to code affects the visual appearance in real time, without deploying any code to a Salesforce org. Whichtwo resources should help accomplish this? Choose 2 answers",
    "choices": [
      "Lightning Design System Website",
      "Local Development Server",
      "Lightning Web Component Recipes App",
      "Develop Center’s Lightning Component Library"
    ],
    "correctAnswerText": [
      "Lightning Design System Website",
      "Local Development Server"
    ],
    "explanation": "Two resources that can help a UX Designer to explore sample code for Lightning components and see how changing the code affects the visual appearance in real time, without deploying any code to a Salesforce org, are: Lightning Design System Website. The Lightning Design System website is a resource that provides design guidelines, UI components, and code samples for building Lightning applications. The website also features a live code editor that allows the designer to edit and preview the code for Lightning web components and Aura components, and see the changes reflected in the browser instantly. The live code editor also provides syntax highlighting, auto-completion, and error checking features. The designer can use the Lightning Design System website to experiment with different code snippets <u>and learn how to apply the design principles and best practces for Lightning components. Lightning</u> <u>Design System Website, [UX Designer Certfcaton Prep: Salesforce Design System]</u> Local Development Server. The Local Development Server is a resource that allows the designer to build, run, and test Lightning web components without deploying them to a Salesforce org. The Local Development Server is a CLI plug-in that creates a local web server that serves the Lightning web components from the local file system. The designer can use the Local Development Server to edit the code for Lightning web components in their preferred code editor, such as Visual Studio Code, and see the changes updated in the browser automatically. The Local Development Server also supports hot reloading, which preserves the component state and the browser session during code changes. The designer can use the Local Development Server to speed up the development and <u>testng process and to debug the code for Lightning web components. Local Development Server,</u> [UX Designer Certification Prep: User Testing and Evaluation] The Lightning Web Component Recipes App and the Developer Center’s Lightning Component Library are not resources that can help a UX Designer to explore sample code for Lightning components and see how changing the code affects the visual appearance in real time, without deploying any code to a Salesforce org. The Lightning Web Component Recipes App is a sample application that showcases the functionality and best practices for Lightning web components. The Developer Center’s Lightning Component Library is a reference guide that provides documentation and examples for Lightning web components and Aura components. However, neither of these resources allow the designer to edit and preview the code in real time, as they require the code to be <u>deployed to a Salesforce org or a scratch org frst. Lightning Web Component Recipes App, Developer Center’s Lightning Component Library, [UX Designer Certfcaton Prep: User Testng and Evaluaton] Reference: Lightning Design System Website, Local Development Server, Lightning Web</u> ’ <u>Component Recipes App, Developer Center s Lightning Component Library, [UX Designer</u> Certification Prep: Salesforce Design System], [UX Designer Certification Prep: User Testing and Evaluation]"
  },
  {
    "id": 31,
    "category": "Discovery",
    "question": "A UX Designer needs to create a visual representation of a user’s series of steps to achieve a meaningful goal. Which UX design method should be used?",
    "choices": [
      "User Persona",
      "Site Map",
      "Lightning Flow",
      "User Flow"
    ],
    "correctAnswerText": "User Flow",
    "explanation": "A user flow is a UX design method that creates a visual representation of a user’s series of steps to achieve a meaningful goal. A user flow shows the path that a user takes from their entry point to their final action, such as signing up, purchasing, or completing a task. A user flow helps designers understand and optimize the user experience, as well as identify pain points, gaps, and opportunities for improvement. A user flow can take various forms, such as diagrams, wireframes, or prototypes, depending on the level of detail and fidelity required. Reference: ’ - <u>What Are User Flows In UX Design? [Full Beginner s Guide] CareerFoundry</u> — <u>What is a User Flow in UX Design? updated 2023 | IxDF User Flows in UX Design: Defniton, Benefts, and Best Practces</u>"
  },
  {
    "id": 32,
    "category": "Discovery",
    "question": "Cloud Kicks(CK) is incorporating Relationship Design principle into its business model and customer offerings wherever possible. Choose 3 answers",
    "choices": [
      "Prioritizing Innovation over copying the competition",
      "Releasing Salesforce updates in managed packages over unmanaged packages",
      "Reframing products in terms of user value over features and functions",
      "Prioritize engagement number of impressions",
      "Uncovering customer needs over broadcasting product benefits"
    ],
    "correctAnswerText": [
      "Prioritizing Innovation over copying the competition",
      "Reframing products in terms of user value over features and functions",
      "Uncovering customer needs over broadcasting product benefits"
    ],
    "explanation": "Relationship Design is a creative practice that drives social and business value by building strong relationships. It is based on four mindsets: compassion, intention, courage, and reciprocity. Cloud Kicks can incorporate Relationship Design principles into its business model and customer offerings by adopting these mindsets and applying them to its products, services, and interactions. Some examples of how Cloud Kicks can do this are: Prioritizing innovation over copying the competition. This shows that Cloud Kicks is courageous and intentional in creating unique and valuable solutions that meet the needs and expectations of its <u>customers and communites. Cloud Kicks can use design thinking methods, such as empathy mapping, ideaton, and prototyping, to generate and test new ideas that solve real problems and create positve impact 1.</u> Reframing products in terms of user value over features and functions. This shows that Cloud Kicks is compassionate and reciprocal in understanding and communicating the benefits and outcomes that <u>its products and services can deliver to its customers and stakeholders. Cloud Kicks can use value propositon design tools, such as the value propositon canvas, to identfy and artculate the jobs, pains, and gains of its customers, and how its products and services can address them 2.</u> Uncovering customer needs over broadcasting product benefits. This shows that Cloud Kicks is intentional and reciprocal in listening and learning from its customers and co-creating solutions with <u>them. Cloud Kicks can use user research methods, such as interviews, surveys, and observatons, to discover and validate the needs, preferences, and behaviors of its customers, and to involve them in the design process 3.</u> Reference: [Design Thinking] (https://www.salesforce.com/design/relationship-design/), [Value Proposition Design] (https://www.salesforce.com/blog/how-relationship-design-works/), [User Research] (https://trailhead.salesforce.com/content/learn/trails/get-to-know-relationship-design)"
  },
  {
    "id": 33,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks wantsto represent stages for opportunities within the sales process. Which Salesforce Lightning Designing System (SLDS) component should be recommended?",
    "choices": [
      "Scoped Tabs",
      "Activity Timeline",
      "Progress indicator",
      "Path"
    ],
    "correctAnswerText": "Path",
    "explanation": "The Path component is a Salesforce Lightning Design System (SLDS) component that can be used to represent stages for opportunities within the sales process. The Path component displays the stages as a horizontal bar with icons and labels, and highlights the current stage with a blue background. The Path component also allows users to move opportunities to different stages, view and edit key <u>felds for each stage, and access guidance and tps for each stage. The Path component can be added to any object that has a picklist feld with values that represent stages, such as the Stage feld on the Opportunity object12. Reference: Path Component Set Up a Path for Your Sales Team</u>"
  },
  {
    "id": 34,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UXDesigner is asked to design a new application built on Salesforce. What should be their first step?",
    "choices": [
      "Create branding sets for each audience using Experience Builder.",
      "Find and review relevant AppExchange packages.",
      "Become familiar with theSalesforce Lightning Design System (SLDS) component blueprints.",
      "Design a series of custom web component for the app."
    ],
    "correctAnswerText": "Become familiar with theSalesforce Lightning Design System (SLDS) component blueprints.",
    "explanation": "<u>The Salesforce Lightning Design System (SLDS) is a collecton of design guidelines, resources, and tools that help create consistent, beautful, and accessible user experiences across the Salesforce platorm1. Component blueprints are one of the key resources that the SLDS provides. They are framework-agnostc, accessible HTML and CSS code snippets that can be used to create UI elements such as butons, cards, menus, and more2. A UX Designer who is asked to design a new applicaton built on Salesforce should become familiar with the SLDS component blueprints as their frst step, because they can help them to3:</u> Understand the structure, behavior, and appearance of the standard Salesforce components and how they can be customized or extended. Follow the SLDS design principles and best practices, such as clarity, efficiency, consistency, and beauty. Ensure that the application is responsive, adaptive, and compatible with different devices and screen sizes. Leverage the SLDS design tokens, icons, and utilities to create a coherent and scalable visual ##### language. Reduce the development time and effort by reusing the existing code and avoiding duplication. The other options are not the best first steps for a UX Designer who is asked to design a new <u>applicaton built on Salesforce. Creatng branding sets for each audience using Experience Builder is a later step that involves applying the visual identty and style of the applicaton to diferent user segments and channels4. Finding and reviewing relevant AppExchange packages is a research step that can help to identfy existng solutons or features that can be integrated or adapted to the applicaton5. Designing a series of custom web components for the app is a development step that</u> can be done after defining the requirements, wireframes, and prototypes of the application. Reference: <u>Lightning Design System, Lightning Design System Create the World’s Best Enterprise App</u> Experiences Design System Fundamentals Component Blueprints Ready-to-use HTML and CSS UI elements provide the foundation for Salesforce experience development Go to Blueprints Tokens Visual design values and attributes that ensure branding and UI consistency at scale View Tokens Design Guidelines Design principles and best practices that guide beautiful, consistent, user-friendly product experiences Read Guidelines Tools New! Easy-to-use tools help all Trailblazers optimize workflows and bring Salesforce ideas to life Get Tools <u>Blueprint Overview - Lightning Design System, Blueprint Overview - Lightning Design System What’s</u> New Getting Started Platforms Design Guidelines Kinetics Accessibility Component Blueprints Overview Accordion Activity Timeline Alert App Launcher Avatar Avatar Group Badges Brand Band Breadcrumbs Builder Header Button Icons Cards Chat Docked Utility Bar Dueling Picklist Dynamic Icons Dynamic Menu Expandable Section Feeds File Selector Files Form Element Global Header Global Navigation Icons Illustration Input List Builder Lookups Map Menus Notifications Page Headers Panels Path Picklist Pills Progress Indicator Prompt Radio Button Group Rich Text Editor Scoped Notifications Scoped Tabs Select Spinners Tabs Textarea Tiles Timepicker Toast Tooltips Tree Grid Trees Trial Bar Vertical Navigation Vertical Tabs Visual Picker Welcome Mat Utilities Design Tokens Icons Tools Resources Blueprint Overview Component blueprints are framework agnostic, accessible HTML and CSS used to create components in conjunction with our implementation guidelines. For more details, check out the glossary on the FAQ page. Show Filters Showing 85 blueprints, 183 variants. Accordion Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\nCheckmark \\nActivity Timeline Responsive Adaptive Styling Hooks Prototype Base \\n \\n Alert Responsive Adaptive Styling Hooks Prototype Base Checkmark \\nCheckmark \\nApp Launcher Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nAvatar Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\nCheckmark \\nInitials Checkmark \\nCheckmark \\nAvatar Group Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nGrouped Checkmark \\n \\nBadges Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\nCheckmark \\nBrand Band Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nBreadcrumbs Lightning Component Responsive Adaptive Styling Hooks Prototype Base \\n Checkmark \\nBuilder Header Responsive Adaptive Styling Hooks Prototype Base \\n \\n Toolbar \\n \\n Button Groups Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nList Checkmark \\n \\nRow Checkmark \\n \\nButton Icons Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nBordered Filled Container Checkmark \\n \\nBordered Inverse Checkmark \\n \\nBordered Transparent Container Checkmark \\n \\nBrand Checkmark \\n \\nInverse Checkmark \\n \\nStateful Checkmark \\n \\nTransparent Container Checkmark \\n \\nButtons Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\nCheckmark \\nDual Stateful Checkmark \\nCheckmark \\nStateful Checkmark \\nCheckmark \\nWith Icon Checkmark \\nCheckmark \\nCards Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\nCheckmark \\nEinstein Checkmark \\nCheckmark \\nWrapper Checkmark \\nCheckmark \\nCarousel Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nChat Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nPast Checkmark \\n \\nCheckbox Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\nCheckmark \\nForm Element Checkmark \\nCheckmark \\nCheckbox Button Lightning Component Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nCheckbox Button Group Responsive Adaptive Styling Hooks Prototype Base Checkmark \\n \\nCheckbox Toggle <u>UX Designer Certfcaton Prep: Design System Fundamentals, UX Designer Certfcaton Prep: Design</u> System Fundamentals Learn how to use the Salesforce Lightning Design System (SLDS) to create consistent, beautiful, and accessible user experiences across the Salesforce platform. Add to Favorites Add to Trailmix tags ~1 hr 30 mins +500 points Module Design System Fundamentals Learn about the Salesforce Lightning Design System (SLDS) and how it can help you create consistent, beautiful, and accessible user experiences across the Salesforce platform. 4 hrs 15 mins +800 points Project Build a Bear-Tracking App with Lightning Web Components Use Lightning Web Components and the Salesforce Lightning Design System to build a bear-tracking app. 2 hrs 15 mins +500 points Project Build a Conference Management App with Aura Components Use Aura Components and the Salesforce Lightning Design System to build a conference management app. 2 hrs 15 mins +500 points Project Build a Discount Calculator with Visualforce Use Visualforce and the Salesforce Lightning Design System to build a discount calculator. 2 hrs 15 mins +500 points Project Build a Survey App with Experience Builder Use Experience Builder and the Salesforce Lightning Design System to build a survey app. 2 hrs 15 mins +500 points Project Build a Travel Approval App with Lightning Flow Use Lightning Flow and the Salesforce Lightning Design System to build a travel approval app. 2 hrs 15 mins +500 points Project Build a Volunteer Management App with Lightning App Builder Use Lightning App Builder and the Salesforce Lightning Design System to build a volunteer management app. 2 hrs 15 mins +500 points Project Build an Expense Tracker App with Lightning Web Components Use Lightning Web Components and the Salesforce Lightning Design System to build an expense tracker app. 2 hrs 15 mins +500 points Project Build an Inventory Management App with Aura Components Use Aura Components and the Salesforce Lightning Design System to build an inventory management app. 2 hrs 15 mins +500 points Project Build an Order Management App with Visualforce Use Visualforce and the Salesforce Lightning Design System to build an order management app. 2 hrs 15 mins +500 points Project Build an RSVP Management App with Experience Builder Use Experience Builder and the Salesforce Lightning Design System to build an RSVP management app. 2 hrs 15 mins +500 points Project Build an SMS Notification App with Lightning Flow Use Lightning Flow and the Salesforce Lightning Design System to build an SMS notification app. 2 hrs 15 mins +500 points Project Build an <u>Branding Sets Unit | Salesforce Trailhead, Branding Sets Unit | Salesforce Trailhead Branding Sets</u> Learn how to use branding sets to apply different styles to your digital experiences. Add to Favorites Add to Trailmix tags ~20 mins Incomplete Branding Sets Customize the look and feel of your digital experiences with branding sets. 15 mins +200 points Quiz +200 points Get Started with Branding Sets Learn how to create and apply branding sets to your digital experiences. 5 mins +200 points Quiz +200 points <u>AppExchange Basics Unit | Salesforce Trailhead, AppExchange Basics Unit | Salesforce Trailhead</u> AppExchange Basics Learn how to find, try, buy, and install AppExchange solutions. Add to Favorites Add to Trailmix tags ~25 mins Incomplete AppExchange Basics Learn how to find, try, buy, and install AppExchange solutions. 20 mins +200 points Quiz +200 points Get Started with AppExchange Learn what AppExchange is and how it can help you extend Salesforce functionality. 5 mins +200 points Quiz +200 points"
  },
  {
    "id": 35,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "The UX Designer at Cloud Kicks is considering using a custom Lightning component to fulfill a specific business requirement. Which two best practices should be considered? Choose 2 answers",
    "choices": [
      "Prioritize Aura markup even if there is a Lightning Web Component (LWC) available.",
      "Find the dosest Salesforce Lightning Design System (SLDS) Blueprint to help inform the custom Lightning component.",
      "Create HTML markup and link the SLDS stylesheet via static Resource.",
      "Exhaust the list of available base Lightning component in the component Library."
    ],
    "correctAnswerText": [
      "Find the dosest Salesforce Lightning Design System (SLDS) Blueprint to help inform the custom Lightning component.",
      "Exhaust the list of available base Lightning component in the component Library."
    ],
    "explanation": "Two best practices that should be considered when using a custom Lightning component to fulfill a specific business requirement are: Find the closest Salesforce Lightning Design System (SLDS) Blueprint to help inform the custom Lightning component. The SLDS is a collection of design guidelines, UI components, and code samples that help you create consistent and beautiful user interfaces for Lightning applications. The SLDS Blueprints are examples of common UI patterns and components that are built with the SLDS and follow the design principles and best practices. The Blueprints can help you inform the custom Lightning component by providing inspiration, guidance, and code snippets that you can modify and reuse. The Blueprints can also help you ensure that the custom Lightning component is compatible and consistent with the rest of the Lightning application and the Salesforce platform. [UX Designer <u>Certfcaton Prep: Salesforce Design System], Lightning Design System Website</u> Exhaust the list of available base Lightning components in the Component Library. The base Lightning components are a set of pre-built UI components that you can use to create custom Lightning components. The base Lightning components are built with the SLDS and provide the functionality and interactivity that you need for common UI elements, such as buttons, icons, forms, tables, charts, and more. The base Lightning components also handle the accessibility, security, and performance aspects for you, so you don’t have to worry about them. The Component Library is a reference guide that provides documentation and examples for the base Lightning components, as well as other Lightning web components and Aura components. The Component Library can help you explore the list of available base Lightning components and see how they work and how to use them. The Component Library can also help you avoid reinventing the wheel and save time and effort by using the base Lightning components as much as possible, and only creating custom Lightning components when there is no suitable base Lightning component for your requirement. [UX Designer <u>Certfcaton Prep: User Testng and Evaluaton], Developer Center’s Lightning Component Library</u> Prioritizing Aura markup even if there is a Lightning Web Component (LWC) available, and creating HTML markup and linking the SLDS stylesheet via static resource are not best practices that should be considered when using a custom Lightning component to fulfill a specific business requirement. These practices can lead to suboptimal performance, maintainability, and compatibility issues for the custom Lightning component. Aura markup is the older syntax for creating Aura components, which are the predecessor of Lightning web components. Lightning web components are the newer and faster way of creating custom UI components for Lightning applications, using modern web standards and best practices. Lightning web components also have better interoperability and compatibility with Aura components and other web components, as well as with the base Lightning components and the SLDS. Therefore, it is recommended to use Lightning web components over Aura components whenever possible, and to use LWC markup instead of Aura markup for creating custom <u>Lightning components. [UX Designer Certfcaton Prep: User Testng and Evaluaton], Lightning Web Components Developer Guide</u> Creating HTML markup and linking the SLDS stylesheet via static resource is also not a recommended practice for creating custom Lightning components, because it can create unnecessary complexity and duplication for the custom Lightning component. A static resource is a file or a collection of files that can be referenced by a Lightning component, such as images, style sheets, JavaScript libraries, or fonts. However, linking the SLDS stylesheet via static resource means that you have to manually download and upload the SLDS files to your org, and update them whenever there is a new version of the SLDS. This can create maintenance and compatibility issues for the custom Lightning component, as"
  },
  {
    "id": 36,
    "category": "Declarative Design",
    "question": "A sales representativewants to personalize their own user experience. Which two recommendations should be made to provide more intuitive access regularly used content? Choose 2 answers",
    "choices": [
      "Personalize the Navigation bar.",
      "Set up Quick Links in the Utility bar.",
      "Customizethe Home page experience.",
      "Create shortcuts Favorites."
    ],
    "correctAnswerText": [
      "Personalize the Navigation bar.",
      "Create shortcuts Favorites."
    ],
    "explanation": "To provide more intuitive access to regularly used content, a sales representative can use the following two recommendations: Personalize the Navigation bar: The Navigation bar is the horizontal menu at the top of the Lightning Experience page that allows users to switch between different items, such as apps, objects, or utilities. Users can personalize the Navigation bar by adding, removing, or rearranging items according to their preferences and needs. For example, a sales representative can add the Accounts, Opportunities, and Reports items to the Navigation bar for quick access. To personalize the Navigation bar, users can click on the pencil icon next to the app name and use the Edit option. Create shortcuts Favorites: Favorites are bookmarks that users can create to save links to frequently accessed pages, records, reports, dashboards, or groups in Salesforce. Users can create favorites by clicking on the star icon in the header of any page. Users can also organize their favorites into folders and access them from any device. To view or manage favorites, users can click on the Favorites icon in the header. Favorites can help users save time and navigate Salesforce more efficiently."
  },
  {
    "id": 37,
    "category": "Discovery",
    "question": "Following a human-centered design process approach, Cloud Kicks is preparing a user feedback session for an app that is not performance as anticipated. Inwhich two ways could confirmation bias be avoided? Choose 2 answers",
    "choices": [
      "Interview users about the intended use of the product to support the questionnaire creation.",
      "Obtain user feedback to reinforce known assumptions and support design decisions.",
      "Diversity feedback by ensuring it features as many unique perspective as possible.",
      "Review questions to remove assumptions about issues or problem not supported by quantitative data."
    ],
    "correctAnswerText": [
      "Interview users about the intended use of the product to support the questionnaire creation.",
      "Diversity feedback by ensuring it features as many unique perspective as possible."
    ],
    "explanation": "Confirmation bias is the tendency to seek out and prefer information that supports our preexisting beliefs, while ignoring or rejecting information that contradicts them. Confirmation bias can affect the validity and reliability of user feedback, as it can lead to biased questions, selective interpretation, and skewed results. To avoid confirmation bias in user feedback, Cloud Kicks can follow these two strategies: Interview users about the intended use of the product to support the questionnaire creation. This can help Cloud Kicks to understand the user needs, expectations, and goals, and to design questions <u>that are relevant, clear, and unbiased. By interviewing users, Cloud Kicks can also avoid making assumptons about the user behavior, preferences, and pain points, and instead base their questons on real user data and insights 1.</u> Diversify feedback by ensuring it features as many unique perspectives as possible. This can help Cloud Kicks to reduce the risk of sampling bias, which occurs when the feedback is collected from a <u>group of users that is not representatve of the target populaton. By diversifying feedback, Cloud Kicks can capture a wider range of user opinions, experiences, and feedback, and avoid overlooking or dismissing important user segments or viewpoints 2.</u> Reference: [How to Avoid Confirmation Bias in UX Research] (https://www.smashingmagazine.com/2017/10/avoid-bias-ux-feedback/), [How to Avoid Sampling Bias in User Research] (https://bing.com/search?q=confirmation+bias+in+user+feedback)"
  },
  {
    "id": 38,
    "category": "Discovery",
    "question": "Cloud Kicks wants its Discovery team to help explain the relationships between process steps and business teams. Which types of process map should they produce?",
    "choices": [
      "SIPOC Map",
      "High-Level Process Map",
      "Cross-Functional Flowchart",
      "Value Stream Map"
    ],
    "correctAnswerText": "Cross-Functional Flowchart",
    "explanation": ": A cross-functional flowchart is a type of process map that shows the relationships between process steps and business teams. A cross-functional flowchart uses horizontal or vertical swimlanes to group the process steps by the roles or departments that are responsible for them. A cross-functional flowchart can help Cloud Kicks’ Discovery team to explain how different teams collaborate and <u>communicate in the process, as well as identfy any gaps, overlaps, or inefciencies in the process. A cross-functonal fowchart can also show the inputs, outputs, and decisions at each step, and the fow of informaton and materials across the swimlanes12. Reference: Cross-Functonal Flowchart</u> <u>Create a Cross-Functonal Flowchart</u>"
  },
  {
    "id": 39,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "What are Salesforce core design principles when making design decisions?",
    "choices": [
      "Emphasis, Alignment. Consistency, Beauty",
      "Clarity, Efficiency, Consistency, Beauty",
      "Emphasis, Efficiency, Repetition, Proportion",
      "Clarity, Efficiency, Balance, Proportion"
    ],
    "correctAnswerText": "Clarity, Efficiency, Consistency, Beauty",
    "explanation": "The Salesforce Lightning Design System (SLDS) reflects the patterns and components that underpin the Salesforce product. These patterns and components provide a unified language and consistent look and feel when designing apps and products within the Salesforce ecosystem. The Lightning Experience UI, which SLDS represents, was crafted using four core design principles. We encourage <u>you to keep them in mind as you develop your applicatons. They are1:</u> Clarity — Eliminate ambiguity. Enable people to see, understand, and act with confidence. Efficiency — Streamline and optimize workflows. Intelligently anticipate needs to help people work better, smarter, and faster. Consistency — Create familiarity and strengthen intuition by applying the same solution to the same problem. Beauty — Demonstrate respect for people’s time and attention through thoughtful and elegant <u>crafsmanship. Reference: Introducton to the Salesforce Lightning Design System</u>"
  },
  {
    "id": 40,
    "category": "Discovery",
    "question": "A UX Designer at Cloud Kicks has the requirements and some user scenarios but wants to test how a new feature will be received by the user. What should the designer create and show to the user to test the content and structure of the new feature?",
    "choices": [
      "Wireframe Prototype",
      "Heuristic Review",
      "Dairy Study",
      "Task Analysis"
    ],
    "correctAnswerText": "Wireframe Prototype",
    "explanation": "A wireframe prototype is a low-fidelity representation of the content and structure of a new feature, without any visual design or branding elements. It is used to test the usability and functionality of the feature with the user, and to gather feedback and iterate on the design. A wireframe prototype can be created using tools like Sketch, Figma, or Adobe XD, and can be interactive or static. Reference: [Salesforce Certified User Experience Designer Exam Guide], Section 2.2: Design and test prototypes [UX Designer Certification Prep: Prototyping], Unit 2: Wireframes and Prototypes [Prepare for Your UX Designer Credential], Trailmix: Prototyping"
  },
  {
    "id": 41,
    "category": "Discovery",
    "question": "A UX Designer is creating a site for delivery within Builder for a customer who has strict requirements is stay focusedon out-of-the-box styling and components only. Which three methods would deliver a branded experience? Choose 3 answers",
    "choices": [
      "Select a footer and configure which social media links to display.",
      "Display custom variations of pages based on user behavior.",
      "Select a theme and customize content including copy and imagery.",
      "Use the theme editor to adjust fonts, text case, colors, and site logo.",
      "Create flexible layouts for pages with unique background images."
    ],
    "correctAnswerText": [
      "Select a footer and configure which social media links to display.",
      "Select a theme and customize content including copy and imagery.",
      "Use the theme editor to adjust fonts, text case, colors, and site logo."
    ],
    "explanation": "These three methods would deliver a branded experience for a customer who has strict requirements to stay focused on out-of-the-box styling and components only. They are all features of the Builder tool, which is a drag-and-drop interface that allows users to create and customize websites without coding. By using these methods, a UX Designer can create a consistent and appealing visual identity for the customer’s site, as well as showcase their brand values and personality. Select a footer and configure which social media links to display: The footer is the bottom section of a web page that usually contains information such as contact details, terms and conditions, privacy policy, and social media links. By selecting a footer component from the Builder library, a UX Designer can easily add and configure the social media links that the customer wants to display on their site. This can help the customer connect with their audience, increase their brand awareness, and drive traffic to their social media platforms. Select a theme and customize content including copy and imagery: A theme is a predefined set of design elements, such as colors, fonts, and layouts, that can be applied to a website to give it a consistent and professional look. By selecting a theme from the Builder library, a UX Designer can quickly create a site that matches the customer’s brand identity and preferences. A UX Designer can also customize the content of the site, such as the copy and imagery, to make it more relevant and engaging for the customer’s target audience. Use the theme editor to adjust fonts, text case, colors, and site logo: The theme editor is a feature of the Builder tool that allows users to fine-tune the appearance of their site by adjusting various design elements, such as fonts, text case, colors, and site logo. By using the theme editor, a UX Designer can create a site that reflects the customer’s brand personality and style, as well as enhance the readability and usability of the site. A UX Designer can also upload the customer’s site logo, which is a graphical representation of their brand name or symbol, to increase their brand recognition and credibility. Reference: <u>Builder Overview Create a Site with Builder Customize Your Site with the Theme Editor</u>"
  },
  {
    "id": 42,
    "category": "Discovery",
    "question": "During our interview, a UX designer discovers that the most common daily task for the user is to view and commonly view reports using the global search bar for:",
    "choices": [
      "Make the global search bar bigger on every page",
      "Update the homepage with access to commonly used reports",
      "Add the daily task component to the homepage",
      "Create the mind board to communicate the visual style of the UI"
    ],
    "correctAnswerText": "Update the homepage with access to commonly used reports",
    "explanation": "Updating the homepage with access to commonly used reports is the best way to make sure the user can quickly accessthe reports they need. This could include making the global search bar bigger on every page, adding the daily task component to the homepage, or creating a mind board to communicate the visual style of the UI. Additionally, Salesforce has some great resources on designing for search, such as their Search Design Guide [1] and their Search Best Practices [2]. [1] https://www.salesforce.com/content/dam/web/en_us/www/documents/salesforce-searchdesign-guide.pdf [2] https://developer.salesforce.com/docs/atlas.enus.salesforce_search_best_practices.meta/salesforce_search_best_practices/search_best_practices_ intro.htm"
  },
  {
    "id": 43,
    "category": "Discovery",
    "question": "How should a UX designer differentiate between a voice and a tone?",
    "choices": [
      "Voice reflects the expression and the tone is the way one designs",
      "Voice reflects the character and tone is one's strength",
      "Voice reflects the frequency and tone is one's pitch",
      "Voice reflects the personality and tone is the way ones speaks"
    ],
    "correctAnswerText": "Voice reflects the personality and tone is the way ones speaks",
    "explanation": "Voice is the overall personality of the design, while tone is the way that personality is expressed. Voice represents the core characteristics of a design, such as the values, at ude, and emotions it conveys. Tone is how those characteristics are expressed in the design, suchas the language, visuals, and other elements. For example, a design with a friendly voice might be expressed through warm colors, friendly imagery, and casual language. Salesforce has some great resources on voice and tone such as [1] and [2]. [1] https://www.salesforce.com/blog/2017/11/voice-tone-brandpersonality.html [2] https://www.salesforce.com/blog/2018/10/voice-tone-brand-personalityux.html"
  },
  {
    "id": 44,
    "category": "Discovery",
    "question": "A Ux designer has been asked to improve salesforce adoption among sales representatives at cloud kicks after conducting stakeholder and user interviewsthe designers finds there is no clear consistent sale process What should the designer do next",
    "choices": [
      "Tell the customer they need to improve operations before anywork can be done",
      "lock the findings and move forward with presenting possible solutions",
      "recommend field level validation to ensure users are entering the correct data",
      "conduct a workshop with stakeholders to align on correct state and build consenses"
    ],
    "correctAnswerText": "conduct a workshop with stakeholders to align on correct state and build consenses",
    "explanation": "A UX designer who has been asked to improve Salesforce adoption among sales representatives at Cloud Kicks should conduct a workshop with stakeholders to align on the current state and build consensus as the next step after finding out that there is no clear and consistent sales process. This is because: A clear and consistent sales process is essential for defining the user needs, goals, and pain points, as well as the business requirements, objectives, and metrics. Without a clear and consistent sales process, the UX designer cannot design a user-centric and value-driven solution that meets the expectations and needs of both the users and the stakeholders. A workshop with stakeholders can help the UX designer to understand the existing sales process, identify the gaps, challenges, and opportunities, and facilitate a collaborative and participatory approach to define the desired future state and agree on the best practices and standards for the sales process. A workshop can also help to establish trust, rapport, and buy-in among the stakeholders, and ensure that they are aligned and committed to the project vision and goals. A workshop with stakeholders can also help the UX designer to gather feedback, input, and validation from the key decision-makers and influencers, and incorporate them into the design process. A workshop can also help to communicate the value proposition and benefits of Salesforce adoption, and address any concerns, questions, or resistance that the stakeholders may have. Reference: <u>Salesforce Adopton: Common Issues & 6 Best Practces - Itransiton What is Salesforce Adopton? 15+ Salesforce Adopton Strategies | Salesforce Ben Improving Salesforce User Adopton: Strategies & Best Practces - Cynoteck 17 Best Salesforce Adopton Strategies for Success (2023) - Whatix</u>"
  },
  {
    "id": 45,
    "category": "Testing",
    "question": "A UX designer want to understand the mental model of employees who have requested a new internal community the brief specifies what the employees should be able to do on the site but the designer need to suggest and suitable architecture Which technique should be used",
    "choices": [
      "User test",
      "cognitive walkthrough",
      "treetesting",
      "card sorting"
    ],
    "correctAnswerText": "card sorting",
    "explanation": "Card sorting is a UX research method where participants group ideas or information into different categories, based on what feels natural to them. Card sorting is ideal for the early stages of a website project, when the UX designer needs to understand how users organize and label content. Card sorting can help the UX designer to suggest a suitable architecture for the internal community, based on the employees’ mental model and expectations. Card sorting can also reveal any gaps or overlaps <u>in the content, and provide insights for naming the categories and subcategories. Reference: Card Sortng / Tree Testng | Bentley University, Tree Testng vs. Card Sortng: Which is Right for You? | Maze</u>"
  },
  {
    "id": 46,
    "category": "Discovery",
    "question": "Users from a small group within a sales teams have complained about an object that is often used only by them that has not been a edit to their lighting app due to small volume of users the administrator is not considering a new app for them Which two salesforce features should be suggested to improve the end-user experience ?",
    "choices": [
      "Favorite the often used object",
      "add the objects related list to the home page",
      "personalized the navigation bar",
      "create a custom component on a dashboard"
    ],
    "correctAnswerText": [
      "Favorite the often used object",
      "personalized the navigation bar"
    ],
    "explanation": "The users can improve their end-user experience by favoriting the often used object and personalizing the navigation bar. Favoriting the object allows the users to access it quickly from the Favorites menu in the header. Personalizing the navigation bar allows the users to add, remove, or reorder the items that they use frequently. These features do not require the administrator to create a new app or modify the existing one, and they can be customized by the users themselves according to their preferences and needs. Reference: [Salesforce Certified User Experience Designer Exam Guide], Section 3.1: Design and implement solutions that meet user needs [UX Designer Certification Prep: User-Centered Design], Unit 4: Design for User Needs [Prepare for Your UX Designer Credential], Trailmix: User-Centered Design [Salesforce Help: Favorites in Lightning Experience] [Salesforce Help: Personalize Your Navigation Bar]"
  },
  {
    "id": 47,
    "category": "UX Fundamentals",
    "question": "A UX designer is creating a customer support site in experience builder that will internationalized across the 12 different countries Which two designs considerations should bemade when planning for the site",
    "choices": [
      "Country may read text is a different direction (right to left) vs (left to right) and layouts will need to be adjusted",
      "Country flags used as links to adjust languages provide an ideal way to switch between locals orlanguages for users",
      "colors may have different contrast ratios in some countries and need adjusted contrast for proper visibility by users",
      "colors may have different cultural meanings in different countries, changing the intent of UI elements"
    ],
    "correctAnswerText": [
      "Country may read text is a different direction (right to left) vs (left to right) and layouts will need to be adjusted",
      "colors may have different cultural meanings in different countries, changing the intent of UI elements"
    ],
    "explanation": "These two design considerations should be made when planning for a customer support site in experience builder that will be internationalized across 12 different countries. They are related to the principles of internationalization and localization, which are the processes of designing and adapting a product or service to meet the needs and preferences of users in different cultures, languages, and regions. By taking these considerations into account, a UX designer can create a site that is consistent, usable, and appealing for a global audience. Country may read text in a different direction (right to left) vs (left to right) and layouts will need to be adjusted: This consideration is related to the principle of bidirectionality, which is the ability of a product or service to support both left-to-right (LTR) and right-to-left (RTL) languages, such as Arabic, Hebrew, Persian, and Urdu. These languages have different writing systems, text alignment, and reading order than LTR languages, such as English, French, Spanish, and German. Therefore, a UX designer needs to adjust the layouts of the site to accommodate both LTR and RTL languages, such as by using flexible grids, mirroring elements, and avoiding fixed positions. This way, the site can provide a natural and intuitive reading experience for users in different countries. Colors may have different cultural meanings in different countries, changing the intent of UI elements: This consideration is related to the principle of cultural sensitivity, which is the awareness and respect of the cultural differences and preferences of users in different countries. Colors are one of the most important aspects of visual design, as they can convey emotions, moods, messages, and actions. However, colors can also have different cultural meanings and associations in different countries, which can affect how users perceive and interact with the site. For example, red can mean danger, passion, or luck, depending on the country. Therefore, a UX designer needs to choose colors that are appropriate and consistent with the intended meaning and purpose of the UI elements, such as buttons, icons, labels, and alerts. This way, the site can avoid confusion, misunderstanding, or offense for users in different countries. Reference: <u>Preparing a Global Design: Internatonalizaton (i18n) Guide Internatonalizaton - Globalizaton | Microsof Learn Localizaton vs. Internatonalizaton - World Wide Web Consortum (W3C)</u>"
  },
  {
    "id": 48,
    "category": "Discovery",
    "question": "Cloud kicks wants to incorporates human-centered design across its organization Which two practices should beadopted",
    "choices": [
      "Including innovative ideas to showcase technology",
      "observing user behavior",
      "putting oneself in the situation of the end-user",
      "creating requirements based on business leaders priorities"
    ],
    "correctAnswerText": [
      "observing user behavior",
      "putting oneself in the situation of the end-user"
    ],
    "explanation": "Human-centered design is a process that starts with the people you are designing for and ends with new solutions that are tailor-made to suit their needs. It involves understanding the problem from the perspective of the end-users, empathizing with their needs and preferences, and creating solutions that are desirable, feasible, and viable. To incorporate human-centered design across an organization, two practices that should be adopted are: Observing user behavior: This involves watching how users interact with a product or service, what they do, say, think, and feel. Observing user behavior can help identify pain points, needs, goals, motivations, and emotions that drive user behavior. It can also reveal insights that users may not be able to articulate or may not be aware of themselves. Observing user behavior can be done through methods such as user interviews, contextual inquiry, usability testing, and analytics. Putting oneself in the situation of the end-user: This involves imagining or experiencing what the user goes through when using a product or service, and how they perceive and respond to it. Putting oneself in the situation of the end-user can help build empathy, understand the user’s context and environment, and generate ideas that address the user’s needs and expectations. Putting oneself in the situation of the end-user can be done through methods such as personas, scenarios, journey maps, and empathy maps. Reference: : [What is Human-Centered Design?] - : [Human-Centered Design: The Definitive Guide] - : [UX Research: What is User Behavior?] - : [Observing the User Experience: A Practitioner’s Guide to User Research] - : [UX Research Methods: Observation] - : [Empathy in Design Thinking] - : [UX Research Methods: Empathy]"
  },
  {
    "id": 49,
    "category": "Testing",
    "question": "Cloud kicks is planning its einstein Bot implementation and has identified common issues the Bot can resolve. CK has determined that extensive technical planning is needed for bot effectiveness and customer satisfaction",
    "choices": [
      "Training and support for planning",
      "user interface planning",
      "deboarding planning",
      "voice and tone planning"
    ],
    "correctAnswerText": "user interface planning",
    "explanation": "User interface planning is an essential part of the Einstein Bot implementation process, as it involves designing the bot’s appearance, behavior, and interactions with the customers. User interface planning can affect the bot’s effectiveness and customer satisfaction, as it can influence the clarity, <u>efciency, consistency, and beauty of the bot’s experience. User interface planning includes1:</u> Choosing a bot avatar and name that match the brand and tone of the company Configuring the bot greeting and fallback messages that set the expectations and boundaries of the bot’s capabilities Designing the bot dialogues and menus that guide the customers through the conversation and provide relevant options and information <u>Testng and iteratng the bot user interface based on user feedback and analytcs Reference: Einstein Bots Project Planning | Salesforce Trailhead</u>"
  },
  {
    "id": 50,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX designer wants to quickly mock up salesforce user interface experiences using a collection of prebuilt components. The designers neededsalesforce lighting design systems(SLDS) resources for their designs and prototypes such as base components tokens and designs patterns Which tool or installation should best support their needs?",
    "choices": [
      "Lighting design systems zip",
      "sketch plugin",
      "lightingdesign systems unmanaged package",
      "SLDS validator"
    ],
    "correctAnswerText": "sketch plugin",
    "explanation": "A sketch plugin is a tool that allows the UX designer to quickly mock up Salesforce user interface experiences using the Lightning Design System (SLDS) resources, such as base components, tokens, and design patterns. The sketch plugin is a free plugin for Sketch, a design toolkit that helps create wireframes, mockups, sample screens, and more. With the sketch plugin, the designer can search and drag the prebuilt components from the plugin into the canvas, and export the mockups as pdf, jpeg, or png files. The sketch plugin also supports synonyms and variants for the components, <u>making it easier to fnd and use the desired elements. The sketch plugin can be downloaded from the SLDS website1 or from the AppExchange2. Reference:</u> <u>[Create Quick Salesforce UI Mockups: Lightning Design System Plugin for Sketch]1</u> <u>[Lightning Design System Sketch Plugin]2</u>"
  },
  {
    "id": 51,
    "category": "Testing",
    "question": "Universal Containers (UC) uses a custom lightning component with an Apex class to display shipment information (custom object, private OWD). UC sales managers are complaining about two important points: ●Shipment records that belong to their teams can be seen by other users. ●Shipment amount should be visible only by managers, but sales reps are able to view it.Which two features did the development team miss that is causing the problems? Choose 2 answers.",
    "choices": [
      "Use runAs in test class to enforce user permissions and field-level permissions.",
      "Use With Sharing keyword in Apex classes to enforce sharing rules evaluation.",
      "Use isSharable keyword in Apex classes to assurerecord visibility.",
      "Use isAccessible() method in Apex classes to check field accessibility"
    ],
    "correctAnswerText": [
      "Use With Sharing keyword in Apex classes to enforce sharing rules evaluation.",
      "Use isAccessible() method in Apex classes to check field accessibility"
    ],
    "explanation": "The development team missed two features that are causing the problems: The With Sharing keyword in Apex classes to enforce sharing rules evaluation. This keyword allows the Apex class to run in the context of the current user and respect the organization’s sharing rules. Without this keyword, the Apex class runs in system mode and ignores the sharing rules, which can result in unauthorized access to records that belong to other users . The isAccessible() method in Apex classes to check field accessibility. This method returns true if the current user has read access to the specified field, and false otherwise. Without this method, the Apex class does not check the field-level security settings and can display fields that should be hidden from the user, such as the shipment amount . Reference: : Using the with sharing or without sharing Keywords : Enforcing Sharing Rules in Apex : Schema.DescribeFieldResult Class : Enforcing CRUD and FLS ##### D. Replacing Account records ownerships massively can cause data skew. #### **Answer: B,D** Explanation: Changing the role hierarchy and reassigning account owners can have a significant impact on the data visibility and performance of Salesforce. An architect should consider the following points in this situation: Changing complex role hierarchy can cause a high level of sharing recalculation. Depending on the sharing settings, roles can control the level of visibility that users have into the Salesforce data. Users at any given role level can view, edit, and report on all data owned by or shared with users below them in the role hierarchy, unless the sharing model for an object specifies otherwise. When the role hierarchy is changed, Salesforce must recalculate the sharing rules and group membership for all the affected users and records, which can take a long time and consume a lot of system <u>resources. Therefore, changing a complex role hierarchy should be done carefully and preferably during off-peak hours1.</u> Replacing account records ownerships massively can cause data skew. Data skew occurs when more than 10,000 child records are related to the same parent record, or more than 10,000 records of any object are owned by a single user. This can cause performance issues, such as locking, timeouts, and failures, when updating or sharing those records. When account owners are reassigned massively, it can create or worsen data skew, especially if the accounts have many child records, such as contacts <u>and opportunites. Therefore, replacing account records ownerships massively should be avoided or minimized23.</u> Reference: : [Design Your Data Model Unit | Salesforce Trailhead] : [Data Skew in Salesforce - Why it Matters | Salesforce Ben] : [Ownership Data Skew | Designing Record Access for Enterprise Scale | Salesforce Developers]"
  },
  {
    "id": 52,
    "category": "Declarative Design",
    "question": "Sales managers want their team members to help each other close Opportunities. The Opportunity and Account organization-wide defaults are private. To grant Opportunity access tosales reps on the same team, owner ship-based sharing rules were created for each team. What is the side effect of this approach?",
    "choices": [
      "All sales reps will have Read access to Accounts for all Opportunities.",
      "Sales Reps on the same team will have Edit access to the Accounts for Opportunities owned by then team members.",
      "Sales reps on the same team will have Read access to the Accounts for Opportunities owned by their team members.",
      "All sales reps will have Read access to all Accounts. **"
    ],
    "correctAnswerText": "Sales reps on the same team will have Read access to the Accounts for Opportunities owned by their team members.",
    "explanation": "When the organization-wide default for Accounts is private, users can only access the accounts they <u>own or are explicitly shared with them. However, when the organizaton-wide default for Opportunites is private, users can access the opportunites they own, are explicitly shared with</u> - <u>them, or are associated with accounts they can access1. Therefore, when ownership based sharing</u> rules are created for each team to grant access to opportunities owned by their team members, the <u>sales reps on the same team will also have Read access to the accounts for those opportunites. This is because the sharing rules for opportunites automatcally grant access to the parent accounts2. However, the sales reps will not have Edit access to the accounts, unless the sharing rules specify Full Access for the opportunites3. The sales reps will also not have access to all accounts or</u> all opportunities, only those that are owned by their team members or <u>themselves. Reference: Sharing Records Owned by High-Volume Portal Users | Salesforce Security Guide, Sharing Rules | Salesforce Security Guide, Create Owner-Based Sharing Rules | Salesforce Security Guide</u>"
  },
  {
    "id": 53,
    "category": "Declarative Design",
    "question": "Universal Containers' organization wide-defaults model is private for the Account object. A sales repeats to opportunity records. Which level of access will the sales rep have to the related account record?",
    "choices": [
      "No access",
      "Read/Create/Edit access",
      "Read/Create access",
      "Read-only access"
    ],
    "correctAnswerText": "Read-only access",
    "explanation": "A sales rep who owns an opportunity record will have read-only access to the related account record, if the organization-wide default for the Account object is private. This is because the opportunity owner is automatically granted read-only access to the account that the opportunity is associated with, regardless of who owns the account. This is called implicit sharing, and it is a built-in feature of Salesforce to ensure that users can access the data they need to do their work. However, the opportunity owner will not be able to create, edit, or delete the account record, unless they have other sharing mechanisms that grant them higher access, such as role hierarchy, sharing rules, manual sharing, or View All or Modify All permissions. Reference: [Salesforce Certified User Experience Designer Exam Guide], Section 3.1: Design and implement solutions that meet user needs <u>[Control Access to Records Unit | Salesforce Trailhead]1, Unit 2: Implicit Sharing</u> - <u>[Work with Related Lists on Records in Lightning Experience Salesforce]2, Related List Cards</u>"
  },
  {
    "id": 54,
    "category": "Discovery",
    "question": "Cloud kicks has identified that its users are having difficulty figuring out where to look on a web page due to the number of design elements. Which threeconsiderations should be made to improve the visual hierarchy of the page?",
    "choices": [
      "Tell the customer they need to improve operations before any work can be done.",
      "Log the findings and move forward with presenting possible solutions.",
      "Recommend Field Level Validation to ensure users are entering the correct data.",
      "Conduct a workshop with stakeholders to align on the current state and build consensus."
    ],
    "correctAnswerText": "Conduct a workshop with stakeholders to align on the current state and build consensus.",
    "explanation": "A UX designer’s role is not only to design solutions, but also to facilitate collaboration and communication among stakeholders and users. A clear, consistent sales process is essential for Salesforce adoption, as it defines the steps and actions that sales representatives need to take to close deals. Without a common understanding of the sales process, the UX designer cannot design a Salesforce solution that meets the needs and expectations of the users and the business. Therefore, the designer should conduct a workshop with stakeholders to align on the current state and build consensus on the desired future state. A workshop is an interactive session where the designer can use various techniques, such as journey mapping, persona creation, user stories, and prioritization, <u>to elicit the pain points, goals, and requirements of the stakeholders and users. A workshop can also help the designer to establish trust and rapport with the partcipants, and to gain their buy-in and feedback for the proposed soluton12. Reference: Salesforce Adopton Strategies | Salesforce Trailhead, 6 Guiding Principles to Maximize Your Salesforce Adopton | Salesforce Admins</u>"
  },
  {
    "id": 55,
    "category": "Testing",
    "question": "A UX Designer wants to understand the mental model of employees who have requested a new internal community, The brief specifies what the employees should be able to do on the site, but the designer needs to suggest a suitable architecture. Which technique should be used?",
    "choices": [
      "User Test",
      "Cognitive Walkthrough",
      "Tree Testing",
      "Card Sorting"
    ],
    "correctAnswerText": "Card Sorting",
    "explanation": "Card sorting is a technique that helps UX designers understand the mental model of users and how they organize information into categories. Card sorting involves giving users a set of cards, each with a piece of information or a feature, and asking them to sort them into groups that make sense to them. The designer can then analyze the results and identify patterns, similarities, and differences among the users’ categorizations. Card sorting can help the designer suggest a suitable architecture for the new internal community, based on how the employees think about the site’s content and <u>functonality. Card sortng can be done in person or online, using tools like OptmalSort or UserZoom1. Reference:</u> [Salesforce Certified User Experience Designer Exam Guide], Section 2.1: Conduct user research [UX Designer Certification Prep: User Research], Unit 3: User Research Methods #### **Answer: A,D** Explanation: The two design considerations that should be made when creating a customer support site in Experience Builder that will be internationalized across 12 different countries are: Countries may read text in a different direction (right to left vs. left to right) and layouts will need to be adjusted. This is because some languages, such as Arabic and Hebrew, are written from right to left, while others, such as English and French, are written from left to right. This affects not only the text alignment, but also the placement of UI elements, such as buttons, menus, icons, and images. To accommodate different reading directions, the site should use a flexible layout that can be mirrored <u>or fipped based on the language setng. This also follows the principle of designing for accessibility and inclusion, which is one of the learning objectves for the Salesforce User Experience Designer certfcaton12</u> Colors may have different cultural meanings in different countries, changing the intent of UI elements. This is because colors can convey different emotions, associations, and messages depending on the cultural context. For example, red can mean danger, passion, or luck, depending on the country. Therefore, the site should use colors that are appropriate and respectful for the target <u>audience, and avoid colors that may be ofensive or misleading. This also follows the principle of designing for the user’s context and environment, which is another learning objectve for the Salesforce User Experience Designer certfcaton34</u> Reference: [Design for Accessibility and Inclusion], [Add Languages to Your Aura Sites], [Design for the User’s Context and Environment], [Color Meanings by Culture] : https://trailhead.salesforce.com/en/content/learn/modules/ux-designer-certification-prep/design- <u>for-accessibility-and-inclusion : 1 : htps://trailhead.salesforce.com/en/content/learn/modules/uxdesigner-certfcaton-prep/design-for-the-users-context-and-environment : 2 : htps://www.w3.org/Internatonal/questons/qa-scripts : 3 : htps://www.shuterstock.com/blog/color-symbolism-and-meanings-around-the-world : 4</u>"
  },
  {
    "id": 56,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer is creating a custom To-Do List component to replace the standard Salesforce one.Their developer is using a parent-child Lightning Web Component (LWC) structure to build the component, creating a parent component for the list and a single repeated child component for each To-Do Item within the list. Which two impacts of the LWC’s Shadow DOM should be considered when designing or developing the stylesheets for these components? Choose 2 answers",
    "choices": [
      "Any needed Saleforce Lightning Design System (SLDS) classes and styles must be imported into both the parent list and child items.",
      "The CSS styles defined in the parent list component are not shared with the child items.",
      "Any custom shared between the list and child items should be imported from a shared CSS file.",
      "The CSS style defined in the parent list component are inherited by the child items Explanation: **"
    ],
    "correctAnswerText": [
      "The CSS styles defined in the parent list component are not shared with the child items.",
      "Any custom shared between the list and child items should be imported from a shared CSS file."
    ],
    "explanation": "** Shadow DOM is a web standard that encapsulates the internal document object model (DOM) structure of a web component. It isolates the component’s markup and styles from the rest of the page, and prevents the component from being affected by or affecting the global DOM. When designing or developing the stylesheets for a parent-child LWC structure, the following impacts of the shadow DOM should be considered: The CSS styles defined in the parent list component are not shared with the child items. This is because the shadow DOM creates a boundary between the parent and the child components, and the styles defined in the parent component do not cascade down to the child components. This means that each component needs to define its own styles, or import them from a common <u>source. This also means that the parent component cannot directly style the child components, or vice versa12.</u> Any custom styles shared between the list and child items should be imported from a shared CSS file. This is a recommended practice to avoid duplicating the same styles in multiple components, and to maintain consistency and reusability. A shared CSS file can be created as a static resource, and imported into the components using the loadStyle() method from <u>the platormResourceLoader module. Alternatvely, a shared CSS fle can be created as a LWC component, and imported into the components using the @import directve134.</u> Reference: : [Shadow DOM | Lightning Web Components Developer Guide | Salesforce Developers] : [Light DOM | Lightning Web Components Developer Guide | Salesforce Developers] : [Understanding Shadow DOM and Template in LWC – SFDC Lightning] : [Shadow DOM, CSS and Styling Hooks in LWC what you need to know] : [How to Share CSS Between Lightning Web Components | Salesforce Developers Blog] : [How to Use a Shared CSS File in a Lightning Web Component | Salesforce Developers Blog]"
  },
  {
    "id": 57,
    "category": "Discovery",
    "question": "Cloud kicks wants to incorporate human-centered design across its organization. Which two practices should be adopted?",
    "choices": [
      "Including Innovative ideas to showcase technology",
      "Observing user behavior",
      "Putting oneself in the situation of the end user",
      "Creating requirements based business leaders’ priorities"
    ],
    "correctAnswerText": [
      "Observing user behavior",
      "Putting oneself in the situation of the end user"
    ],
    "explanation": "Human-centered design is a practice where designers focus on people and their context, and seek to <u>understand and solve the right problems for them. Human-centered design involves the following elements1:</u> Empathy. Designers need to genuinely care about the people they design for, and build empathy by immersing themselves in the community that will use their products or services. Creativity. Designers need to find creative ways to solve users’ problems, and generate multiple ideas and prototypes that can be tested and refined. Business needs. Designers need to make their products or services commercially successful, and align them with the goals and values of the organization. To incorporate human-centered design across its organization, Cloud Kicks should adopt the following two practices: Observing user behavior. Designers should conduct user research and communicate with their users regularly, to understand their needs, motivations, challenges, and goals. Observing user behavior can help designers to identify the pain points and opportunities for improvement, and to validate their assumptions and hypotheses. Putting oneself in the situation of the end user. Designers should empathize with their users, and try to see the world from their perspective. Putting oneself in the situation of the end user can help designers to create products or services that are relevant, useful, and desirable for them. The following two practices are not aligned with human-centered design, and should be avoided: Including innovative ideas to showcase technology. Designers should not prioritize technology over people, and should not include features or functions that are not necessary or beneficial for the users. Including innovative ideas to showcase technology can lead to products or services that are complex, confusing, or frustrating for the users. Creating requirements based on business leaders’ priorities. Designers should not ignore the voice of the users, and should not create products or services that only satisfy the business needs. Creating requirements based on business leaders’ priorities can lead to products or services that are irrelevant, useless, or undesirable for the users. <u>Reference: Human-Centered Design: An Introducton, Practces, and Principles - Shopify</u>"
  },
  {
    "id": 58,
    "category": "Declarative Design",
    "question": "Cloud Kicks (CK) is planning its Einstein Bot implementation and has identified common issues the bot canresolve. CK has determined that extensive technical planning is needed for bot effectiveness and customer satisfaction. Which additional element(s) would be essential?",
    "choices": [
      "Training and support planning",
      "User interface planning",
      "Onboarding planning",
      "Voice and tone planning"
    ],
    "correctAnswerText": "User interface planning",
    "explanation": ""
  },
  {
    "id": 59,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer wants to quickly mock up Salesforce user Interface experiences using a collation of prebuilt components. The designer need sales lightning resources for their design and prototypesuch as based components, tokens, design patterns. Which tool to install should need?",
    "choices": [
      "Lightning Design system Zip",
      "Sketch plugin",
      "Lightning Design system Unmagaged Package",
      "SLDS Validator"
    ],
    "correctAnswerText": "Sketch plugin",
    "explanation": "The tool to install that the UX Designer needs is the Sketch plugin. This plugin allows the designer to quickly mock up Salesforce user interface experiences using a collection of prebuilt components, such as base components, tokens, design patterns, and more. The plugin also provides access to the Salesforce Lightning resources for their design and prototype, such as icons, fonts, colors, and images. The plugin is compatible with Sketch, a popular design tool for creating user interfaces. Reference: : Salesforce Lightning Design System : Sketch Plugin"
  },
  {
    "id": 60,
    "category": "UX Fundamentals",
    "question": "The UX Designer at Cloud Kicks is asked to make the website size and content adapt to the screen size, platform and orientation. Which design should the design use?",
    "choices": [
      "Responsive",
      "Refactored",
      "Reactive",
      "Proactive"
    ],
    "correctAnswerText": "Responsive",
    "explanation": "The design that the UX Designer at Cloud Kicks should use to make the website size and content <u>adapt to the screen size, platorm and orientaton is responsive. Responsive web design is a web design approach that uses HTML and CSS to automatcally resize, hide, shrink, or enlarge, a website, to make it look good on all devices (desktops, tablets, and phones) 1. Responsive web design is not a program or a JavaScript, but a set of best practces that include using media queries, fexible grids, fuid images, and breakpoints to create a layout that can respond to any device being used to view the content 2. Responsive web design is one of the learning objectves for the Salesforce User Experience Designer certfcaton 3. Reference: [Responsive Web Design Introducton], [Responsive</u> design - Learn web development], [Salesforce Certified User Experience Designer Exam Guide] <u>htps://www.w3schools.com/html/html_responsive.asp</u> <u>htps://www.w3schools.com/Css/css_rwd_intro.asp</u>"
  },
  {
    "id": 61,
    "category": "Discovery",
    "question": "Cloud Kicks (CK) isgoing to conduct some interviews surveys with users to better understand their Purchasing habits. CK’s UX Designer wants to get the most accurate view of customers’ purchasing behaviors using these research methods. Which two response biases should the designer be aware of when interviewing or surveying users? Choose 2 answers",
    "choices": [
      "Social Desirability Bias",
      "Randimized Bias",
      "Objectivity Bias",
      "Recency Bias"
    ],
    "correctAnswerText": [
      "Social Desirability Bias",
      "Recency Bias"
    ],
    "explanation": "When interviewing or surveying users, the UX designer should be aware of the following response biases that can affect the accuracy of the data collected: Social desirability bias: This is the tendency of respondents to answer questions in a way that they think will make them look good or conform to social norms and expectations. For example, when asked about their purchasing habits, respondents may underreport their spending on luxury items or impulse buys, or overreport their spending on charitable causes or environmentally friendly <u>products. Social desirability bias can be reduced by ensuring anonymity and confdentality, using indirect or less sensitve questons, or using implicit measures12.</u> Recency bias: This is the tendency of respondents to recall and emphasize the most recent events or experiences, rather than the ones that occurred earlier or more frequently. For example, when asked about their purchasing habits, respondents may base their answers on their last purchase or the last <u>month, rather than their average or typical behavior over a longer period of tme. Recency bias can be reduced by using specifc and clear tme frames, using multple sources of data, or using longitudinal methods34.</u> Reference: : [What Is Response Bias? | Definition & Examples] - : [Types of User Research Bias and How to Avoid It in Your UX Design] : [Social Desirability Bias: Definition, Examples, and Solutions] : [Recency Bias: Definition, Examples, and Solutions] : [Recency Bias in User Research] : [Social Desirability Bias in Survey Research]"
  },
  {
    "id": 62,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks’s development team is working on the build of anew custom component using VS Code. They often have new CSS dasses and properties conflicting with the Salesforce Lightning Design System (SLDS). What should simplify working with SLDS in Lightning Components?",
    "choices": [
      "Salesforce Developer Console should beused instead",
      "SLDS Validator extension for VS Code",
      "Install SLDS creator from AppExchange",
      "Keep the SLDS Stylesheet open for reference"
    ],
    "correctAnswerText": "SLDS Validator extension for VS Code",
    "explanation": "The SLDS Validator extension for VS Code is a tool that simplifies working with the Salesforce Lightning Design System (SLDS) in Aura and Lightning components. It provides code completion, syntax highlighting, and validation with recommended tokens and utility classes. It also scans the markup and validates it against a database of guidelines, tips, and best practices extracted from the <u>SLDS documentaton. It ofers suggestons on how to improve the code and avoid conficts with SLDS12. Reference: SLDS Validator - Visual Studio Marketplace, SLDS Validator for VS Code - Lightning Design System</u>"
  },
  {
    "id": 63,
    "category": "Human-Centered Design",
    "question": "A UX Designer wants to communicate the value of diversity, inclusion, and equality in design. Which three business outcomes represent these values? Choose 3 answers",
    "choices": [
      "Less employee turnover",
      "Greater market share",
      "Economic growth",
      "Critical investing",
      "Fewer workplace debates"
    ],
    "correctAnswerText": [
      "Less employee turnover",
      "Greater market share",
      "Economic growth"
    ],
    "explanation": "Diversity, inclusion, and equality in design are values that can lead to positive business outcomes, such as less employee turnover, greater market share, and economic growth. These values can help create a more inclusive and innovative workplace, where employees feel valued, respected, and engaged, and where customers feel understood, represented, and satisfied. Some of the benefits of these values are: Less employee turnover: Diversity, inclusion, and equality in design can reduce employee turnover by fostering a culture of belonging, trust, and collaboration, where employees can thrive and <u>grow. According to a Salesforce report1, employees who feel a sense of belonging at work are 5.3</u> times more likely to feel empowered to perform their best work, and employees who feel their voice is heard at work are 4.6 times more likely to feel empowered to perform their best work. Moreover, employees who feel valued and included are more likely to stay loyal to their employer, reducing the costs and risks of hiring and training new staff. Greater market share: Diversity, inclusion, and equality in design can increase market share by expanding the customer base, enhancing the customer experience, and improving the brand <u>reputaton. According to a McKinsey report2, companies in the top quartle for ethnic and cultural</u> diversity on executive teams were 36% more likely to experience above-average profitability than companies in the fourth quartile. Moreover, companies that design products and services that meet the needs and preferences of diverse customers can gain a competitive edge and increase customer loyalty and retention. Economic growth: Diversity, inclusion, and equality in design can contribute to economic growth by <u>boostng productvity, innovaton, and social impact. According to a World Bank report3, increasing</u> women’s labor force participation and earnings could add $172 trillion to global wealth. Moreover, companies that leverage the diverse perspectives and experiences of their employees can generate more creative and effective solutions, and companies that support social causes and environmental sustainability can create positive change and attract more customers and investors. Reference: ’ - <u>[Our 2023 Annual Equality Update: Where We Are and Where We re Going Salesforce]1 [Diversity wins: How inclusion maters | McKinsey]2</u> <u>[Women, Business and the Law 2020 | World Bank]3</u>"
  },
  {
    "id": 64,
    "category": "UX Fundamentals",
    "question": "A UX Designeris analyzing their Experience Cloud site, enabled for Knowledge articles, and is using the Featured Topic component to display content. Which UI configuration should be used to further individualize each featured topic?",
    "choices": [
      "Add a description displayed onmouse hover further description each topic.",
      "Select and upload SVG Icons that represent each featured topic.",
      "Select and upload images that represent each featured topic.",
      "Add a description under the topic label further describing each topic."
    ],
    "correctAnswerText": "Select and upload images that represent each featured topic.",
    "explanation": "The UI configuration that should be used to further individualize each featured topic is to select and upload images that represent each featured topic. This option allows the UX Designer to customize the appearance of the Featured Topic component and make it more visually appealing and engaging for the users. The images can help to convey the meaning and relevance of each topic and attract the users’ attention. The images can also create a consistent and branded look for the Experience Cloud site. Reference: : Featured Topic Component : Customize the Featured Topic Component This allows users to easily distinguish between different topics and quickly scan for relevant topics. Salesforce documentation on the Featured Topics component states that “You can add a description for each featured topic, which appears in the user interface below the topic label” [1]. [1] https://help.salesforce.com/articleView?id=knowledge_articles_sites_featured_topic.htm&type= 5"
  },
  {
    "id": 65,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer is asked to design a responsive page. When screen resolution changes, the content of the page should expand across columns or wrap and push it self onto new rows. Which Salesforce Lightning Design System (SLDS) utility provides the most flexible system to meet these requirements?",
    "choices": [
      "Spacing",
      "Layout",
      "Alignment",
      "Grid"
    ],
    "correctAnswerText": "Grid",
    "explanation": "The SLDS utility that provides the most flexible system to meet the requirements of designing a responsive page is Grid. Grid is a utility that allows you to create a layout using a series of rows and columns that house your content. Grid uses a 12-column structure that can be adjusted based on breakpoints, which are predefined screen sizes that trigger a change in the layout. Grid also supports <u>nestng, alignment, ordering, and ofsetng of the columns. By using Grid, you can create a responsive page that can adapt to diferent screen resolutons and devices12 Reference: [Grid -</u> Lightning Design System], [Mastering Salesforce Lightning Design System Grids and Lightning Layouts] <u>htps://www.lightningdesignsystem.com/utlites/grid/ htps://developer.salesforce.com/blogs/developer-relatons/2017/04/mastering-salesforce-</u> - - - - - <u>lightning design system grids lightning layouts</u>"
  },
  {
    "id": 66,
    "category": "UX Fundamentals",
    "question": "A group of sales users needs to be guided step by step through a new process using Floating or Decked Prompts. Their administrative teamwants to the ability to see the adoption of this assistance via Reports and Dashboards.",
    "choices": [
      "in-App Guidance Prompts using myTrailhead",
      "Custom build using Salesforce Flow",
      "Basic In-App Guidance Prompts",
      "Use the Walkthrough App from AppExchange"
    ],
    "correctAnswerText": "Use the Walkthrough App from AppExchange",
    "explanation": "The best option for guiding sales users through a new process using floating or docked prompts is to use the Walkthrough App from AppExchange. This app allows admins to create and manage in-app guidance walkthroughs using clicks, not code. Walkthroughs are interactive tutorials that guide users through a series of steps on a Lightning page. Users can see the prompts, click the action buttons, and follow the instructions to complete the process. Admins can also track the engagement and <u>completon of the walkthroughs using reports and dashboards. The Walkthrough App is compatble with the standard in-app guidance feature, and does not require a subscripton to myTrailhead1 .</u> The other options are not suitable for this scenario because: In-App Guidance Prompts using myTrailhead: This option requires a subscription to myTrailhead, which is a customizable learning platform that allows admins to create their own content and branding. In-app guidance prompts are one of the features of myTrailhead, but they are not the same as walkthroughs. Prompts are single-step messages that appear on a Lightning page, while <u>walkthroughs are multi-step tutorials that guide users through a process. Prompts can be used to provide tps, announcements, or links, but they cannot show users how to perform a task234.</u> Custom build using Salesforce Flow: This option requires coding and development skills, which may not be available or feasible for the admin team. Salesforce Flow is a tool that allows admins to automate processes and tasks using clicks or code. Flows can be triggered by various events, such as buttons, actions, schedules, or record changes. Flows can also display screens to users, which can contain fields, text, images, or components. However, screens are not the same as prompts or walkthroughs. Screens are part of a flow logic, and they require user input to proceed to the next <u>step. Screens cannot be customized to appear as foatng or docked prompts, and they cannot guide users through a Lightning page56.</u> Basic In-App Guidance Prompts: This option does not require a subscription to myTrailhead, but it also does not provide the functionality of walkthroughs. Basic in-app guidance prompts are the same as the ones mentioned in the first option, but without the customization and branding of myTrailhead. Basic prompts can be created and managed using clicks, not code, and they can be <u>fltered by profles and permissions. However, basic prompts are stll single-step messages that appear on a Lightning page, and they cannot show users how to perform a task23.</u> Reference: : [In-App Guidance Walkthroughs: Getting Started for Sales Users] : [In-App Guidance Dashboard: Walkthrough Engagement] : [In-App Guidance in Lightning Experience] : [Salesforce Flow | Salesforce Developer Center] : [Salesforce Flow Workflow Automation Tools - Salesforce.com] : [The Complete Guide to Salesforce Flow | Salesforce Ben] : [Trailhead | The fun way to learn] : [Editions & Pricing - myTrailhead- Salesforce] : [Salesforce introduces myTrailhead, a personal learning platform …] : [Trailhead | The fun way to learn Salesforce] : [Getting Started with myTrailhead - Salesforce]"
  },
  {
    "id": 67,
    "category": "Testing",
    "question": "Cloud Kicks (CK) is planning to roll out a refreshed version of its mobile app with some new functionality for customers. What are two reasons why CK’s UX Designer would consider using an interactive prototype in this situation? Choose2 answers.",
    "choices": [
      "To increase the speed of design compared to paper prototyping",
      "To eliminate the need for journey mapping during discovery",
      "To avoid added long-term cost from oversight-driven rework",
      "To enable iterative feedback from the users"
    ],
    "correctAnswerText": [
      "To avoid added long-term cost from oversight-driven rework",
      "To enable iterative feedback from the users"
    ],
    "explanation": "An interactive prototype is a simulation of the final product that allows users to interact with it and test its functionality and usability. An interactive prototype can be created using tools such as Figma or Invision, and can be shared with stakeholders and users for feedback and validation. An interactive prototype can have several benefits for a UX designer, especially when planning to roll out a <u>refreshed version of a mobile app with some new functonality for customers. Two of these benefts are12:</u> To avoid added long-term cost from oversight-driven rework. An interactive prototype can help the UX designer to identify and fix any errors, bugs, or gaps in the design before the development stage. This can save time and money that would otherwise be spent on reworking the product after it is developed. An interactive prototype can also help the UX designer to ensure that the new functionality is aligned with the customer needs and expectations, and that it does not compromise the existing functionality or performance of the app. To enable iterative feedback from the users. An interactive prototype can provide a realistic and engaging user experience, and allow the users to explore the app and provide their opinions and suggestions. The UX designer can use the user feedback to iterate and improve the design, and to validate the assumptions and hypotheses. An interactive prototype can also help the UX designer to measure the user satisfaction and loyalty, and to test the app’s usability and accessibility. The following two reasons are not valid for using an interactive prototype in this situation: To increase the speed of design compared to paper prototyping. An interactive prototype is not necessarily faster than a paper prototype, as it requires more time and effort to create and refine. A paper prototype is a low-fidelity prototype that uses sketches or drawings to represent the app’s <u>layout and functonality. A paper prototype can be useful for generatng and testng ideas quickly and cheaply, and for involving the users in the co-design process3.</u> To eliminate the need for journey mapping during discovery. An interactive prototype is not a substitute for journey mapping, but a complement. Journey mapping is a UX research method that visualizes the user’s journey across the app, and identifies the touchpoints, actions, emotions, and pain points. Journey mapping can help the UX designer to understand the user’s context, goals, and <u>needs, and to discover the opportunites for improvement. An interactve prototype can help the UX designer to test and validate the journey map, and to communicate the design vision to the stakeholders and users4. Reference: Interactve Prototypes Without Coding - Studio by UXPin, What is Interactve Prototypes? — updated 2023 | IxDF, Paper Prototyping as a Usability Testng Technique, Journey Mapping 101 | Nielsen Norman Group</u>"
  },
  {
    "id": 68,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks (CK) has not migrated to Lightning Experience but wants to leverage the Salesforce Lightning Design System (SLDS) in its custom applications. Which three solutions should CK’s designers use to deliver applications with a consistent Lightning Experience Look and feel? Choose 3 answers",
    "choices": [
      "Local Development Server",
      "iOS Static Library",
      "Lightning Stylesheets for Visualforce",
      "Standard Design Tokens",
      "Heroku"
    ],
    "correctAnswerText": [
      "Lightning Stylesheets for Visualforce",
      "Standard Design Tokens",
      "Heroku"
    ],
    "explanation": "Cloud Kicks (CK) can use the following three solutions to leverage the Salesforce Lightning Design System (SLDS) in its custom applications, without migrating to Lightning Experience: Lightning Stylesheets for Visualforce: This solution allows CK to apply the SLDS styles to its existing <u>Visualforce pages, without having to rewrite the markup or use a statc resource. By adding the atribute lightningStylesheets=\"true\" to the <apex:page> tag, CK can automatcally transform the standard Visualforce components into their SLDS equivalents, and give the pages a consistent Lightning Experience look and feel12.</u> Standard Design Tokens: This solution allows CK to use the SLDS design tokens, which are predefined variables that store the visual design attributes of the SLDS, such as colors, fonts, sizes, and spacing. By using the design tokens, CK can ensure that its custom applications follow the SLDS guidelines and <u>remain consistent with the Lightning Experience theme. CK can access the design tokens through the Lightning Design System Scoping tool, or by downloading them as a statc resource3 .</u> Heroku: This solution allows CK to build and deploy its custom applications on Heroku, a cloud platform that supports various languages and frameworks, such as Node.js, Java, or PHP. By using Heroku, CK can leverage the SLDS resources, such as the base components, the tokens, and the design patterns, to create web applications that have a consistent Lightning Experience look and feel. CK can also use the Lightning Out feature to embed Lightning components into its Heroku applications, and use the Lightning Web Components framework to create reusable UI elements . Reference: <u>[Lightning Stylesheets for Visualforce | Salesforce Trailhead]1</u> <u>[Lightning Stylesheets for Visualforce | Salesforce Developers]2</u> <u>[Design Tokens | Lightning Design System]3</u> [Using Design Tokens | Lightning Aura Components Developer Guide | Salesforce Developers] [Build Apps with Lightning Design System | Salesforce Trailhead] [Lightning Web Components | Salesforce Developers]"
  },
  {
    "id": 69,
    "category": "Declarative Design",
    "question": "A UX Designer presents a creativedesign approach to solving end-user problems, beginning with identifying their needs and ending with creating solutions that meet those needs. Which approach is being followed?",
    "choices": [
      "Salesforce Declarative Design",
      "Digital Declarative Design",
      "Human-Centered Design",
      "User Interface Design"
    ],
    "correctAnswerText": "Human-Centered Design",
    "explanation": "The approach that is being followed by the UX Designer is the Human-Centered Design. This is a creative design approach that focuses on understanding the end-user’s needs, problems, and context, and then creating solutions that are desirable, feasible, and viable for them. The HumanCentered Design process typically involves four phases: empathize, define, ideate, and prototype. Reference: : Human-Centered Design : Empathize, Define, Ideate, Prototype"
  },
  {
    "id": 70,
    "category": "Discovery",
    "question": "A UX Designer wants to plan and communicate the intended page layouts of a community portal. Which tool should they use?",
    "choices": [
      "Journey Mapping",
      "Wireframes",
      "Personas",
      "Process Flows"
    ],
    "correctAnswerText": "Wireframes",
    "explanation": "The tool that the UX Designer should use to plan and communicate the intended page layouts of a community portal is wireframes. Wireframes are low-fidelity sketches or diagrams that show the basic structure, content, and functionality of a web page or app screen. Wireframes help the UX Designer to visualize the layout of the portal, arrange the elements according to their importance and relevance, and communicate the design concept to the stakeholders and <u>developers. Wireframes are one of the learning objectves for the Salesforce User Experience Designer certfcaton 1. Reference: [Wireframes - Lightning Design System]</u> <u>htps://careerfoundry.com/en/blog/ux-design/website-app-wireframe-examples/</u>"
  },
  {
    "id": 71,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A developer is creating a Lightning Web Component (LWC) and wants to make sure the visual experience is consistent with Cloud Kicks’ branding. The developer asks their UX Designer about the Salesforce Lightning Design System (SLDS) stylinghooks. How should the designer describe them?",
    "choices": [
      "They use standard CSS properties to directly style HTML elements.",
      "They use standard CSS properties to easily style base and custom components.",
      "They use custom CSS properties to directly style HTML elements.",
      "They use custom CSS properties to easily style base and custom components."
    ],
    "correctAnswerText": "They use custom CSS properties to easily style base and custom components.",
    "explanation": "Styling hooks are CSS custom properties that allow developers to customize the appearance of base and custom components in a consistent and supported way. They work with web components and shadow DOM, which provide encapsulation and modularity for LWC. Styling hooks use the -- slds namespace and follow a naming convention that reflects the component, category, property, attribute, and state of the element being styled. For example, --slds-c-button-brand-colorbackground-hover is a styling hook for the button component, brand category, color background property, and hover state. Styling hooks can be declared in the CSS file of the LWC or in a global CSS file that affects all components on the page. Styling hooks are not standard CSS properties, but custom ones that are defined by SLDS and applied to the components using the var() function. Reference: - <u>Styling Hooks Lightning Design System SLDS Styling Hooks | Lightning Web Components Developer Guide | Salesforce Developers</u> – <u>dxp Styling Hooks | LWR Sites for Experience Cloud | Salesforce Developers</u> The Salesforce Lightning Design System (SLDS) styling hooks use standard CSS properties to easily style base and custom components. Salesforce documentation states that “SLDS styling hooks are CSS classes that give you access to the same styling used in the Salesforce Lightning Design System. They make it easy to style base and custom components with the same look and feel” [1]. [1] https://developer.salesforce.com/docs/componentlibrary/documentation/lwc/lwc.use_slds_styling_hooks"
  },
  {
    "id": 72,
    "category": "Discovery",
    "question": "A UX Designer is considering the design of arecord creation screen for the custom object Appointment. Appointment records have to record types: Virtual and In-Person, Virtual appointments may have different virtual meeting software options, each with fields specific to it. Which two considerations should be made when creating this record using Dynamic Forms? Choose 2 answers",
    "choices": [
      "The use of tabs when creating the record is not allowed.",
      "The form will not be available on mobile devices.",
      "All software option sections of the form will always bevisible.",
      "Fields can be organized into sections."
    ],
    "correctAnswerText": [
      "The use of tabs when creating the record is not allowed.",
      "Fields can be organized into sections."
    ],
    "explanation": "Dynamic Forms is a feature that allows users to customize the form fields and sections displayed to users on a page layout. Dynamic Forms can be used to create user-centric, intuitive, and dynamic <u>record creaton screens for custom objects, such as Appointment. When creatng a record using Dynamic Forms, the UX designer should consider the following two aspects12:</u> The use of tabs when creating the record is not allowed. Dynamic Forms does not support the use of tabs within the form, as tabs are not compatible with the record creation process. Tabs are only available for viewing or editing existing records, not for creating new ones. Therefore, the UX designer cannot use tabs to separate the fields for different record types or software options on the record creation screen. Fields can be organized into sections. Dynamic Forms allows the UX designer to group fields into sections, and place them anywhere on the page layout. Sections can have labels, collapsible headers, and visibility rules. The UX designer can use sections to create a logical and clear structure for the form, and to show or hide fields based on user input, data, or profile. For example, the UX designer can create a section for each software option, and use visibility rules to display only the relevant section based on the user’s selection. The following two aspects are not true when creating a record using Dynamic Forms, and should be disregarded: The form will not be available on mobile devices. Dynamic Forms is compatible with mobile devices, <u>and the UX designer can preview and test the form on diferent device sizes and orientatons. The</u> <u>form will automatcally adjust to the screen size and layout of the mobile device, and provide a responsive and consistent user experience3.</u> All software option sections of the form will always be visible. Dynamic Forms allows the UX designer to use visibility rules to control the visibility of fields and sections on the form. Visibility rules can be based on user input, data, or profile. The UX designer can use visibility rules to show or hide software <u>opton sectons based on the user’s selecton of the record type or the sofware opton. This can reduce the cluter and complexity of the form, and provide a personalized and fexible user experience4. Reference: Get Started with Dynamic Forms Unit | Salesforce Trailhead, Salesforce Dynamic Forms: Overview & Deep Dive Tutorial, Dynamic Forms and Actons FAQ | Salesforce Help, Create Dynamic Forms with Visibility Rules | Salesforce Trailhead</u>"
  },
  {
    "id": 73,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer wants to use the Salesforce Lightning Design System (SLDS) to create consistent user interface across Cloud Kicks' various platforms. On which three platforms could the designer use SLDS resources? Choose 3 answers",
    "choices": [
      "Android",
      "Visualforce",
      "Heroku",
      "MuleSoft",
      "Azure"
    ],
    "correctAnswerText": [
      "Visualforce",
      "Heroku",
      "Azure"
    ],
    "explanation": "The Salesforce Lightning Design System (SLDS) is a collection of design resources that help create consistent and beautiful user interfaces across various platforms. The SLDS includes base components, tokens, design patterns, icons, fonts, and more, that follow the design principles and best practices of Lightning Experience. The SLDS can be used on the following three platforms: Visualforce: Visualforce is a framework that allows developers to create custom user interfaces for web and mobile applications on the Salesforce platform. Visualforce pages can leverage the SLDS <u>styles to match the look and feel of Lightning Experience, without writng any CSS code. By adding the atribute lightningStylesheets=\"true\" to the <apex:page> tag, Visualforce pages can automatcally transform the standard Visualforce components into their SLDS equivalents12.</u> Heroku: Heroku is a cloud platform that supports various languages and frameworks, such as Node.js, Java, or PHP. Heroku applications can leverage the SLDS resources, such as the base components, the tokens, and the design patterns, to create web applications that have a consistent <u>Lightning Experience look and feel. Heroku applicatons can also use the Lightning Out feature to embed Lightning components into their pages, and use the Lightning Web Components framework to create reusable UI elements34.</u> Azure: Azure is a cloud platform that offers various services and tools for building, deploying, and managing applications. Azure applications can leverage the SLDS resources, such as the base components, the tokens, and the design patterns, to create web applications that have a consistent <u>Lightning Experience look and feel. Azure applicatons can also use the Lightning Out feature to embed Lightning components into their pages, and use the Lightning Web Components framework to create reusable UI elements56.</u> ##### Reference: <u>[Lightning Stylesheets for Visualforce | Salesforce Trailhead]1 [Lightning Stylesheets for Visualforce | Salesforce Developers]2 [Build Apps with Lightning Design System | Salesforce Trailhead]3 [Lightning Web Components | Salesforce Developers]4 [Salesforce Lightning Design System for Azure Web Apps | Microsof Azure]5 [Lightning Web Components and Azure | Salesforce Developers]6</u>"
  },
  {
    "id": 74,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "After conducting user interviews, a UX Designer finds an equal amount of users prefer to use the Comply densitysetting as the Compact density setting while viewing records details. Which one token and one utility class should be suggested to the developers to ensure custom component respect these settings? Choose 2 answers",
    "choices": [
      "varSpaceingMedium",
      "specing Small",
      "sIds-p-around_medium",
      "slds –var-m-around_small"
    ],
    "correctAnswerText": [
      "varSpaceingMedium",
      "sIds-p-around_medium"
    ],
    "explanation": "The one token and one utility class that should be suggested to the developers to ensure custom components respect the density settings are: varSpacingMedium. This is a design token that defines the medium spacing value for the vertical and horizontal spacing between elements. This token can be used to adjust the spacing according to the density setting of the user. For example, if the user prefers the Comply density setting, the token value will be 16px, and if the user prefers the Compact density setting, the token value will be 8px. slds-p-around_medium. This is a utility class that applies the medium padding value to all sides of an element. This class can be used to add padding to the custom component according to the density setting of the user. For example, if the user prefers the Comply density setting, the class will apply 16px of padding, and if the user prefers the Compact density setting, the class will apply 8px of padding. Reference: : Design Tokens : Spacing Tokens : Utility Classes : Padding Utility Classes"
  },
  {
    "id": 75,
    "category": "UX Fundamentals",
    "question": "Which two UX design principles are key to creating excellent mobile user experiences? Choose 2 answers",
    "choices": [
      "Removal of all images for faster load times",
      "Increase the need fortyping with the onscreen keyboard",
      "Consistency. across device experiences",
      "Prioritization of content and UI elements on the screen"
    ],
    "correctAnswerText": [
      "Consistency. across device experiences",
      "Prioritization of content and UI elements on the screen"
    ],
    "explanation": "The two UX design principles that are key to creating excellent mobile user experiences are: Consistency across device experiences. This means that the design of a mobile app or website should match the design of the desktop version, as well as other platforms and devices. Consistency helps users to recognize and trust the brand, as well as to navigate and use the product more <u>easily. Consistency also reduces the cognitve load and confusion for users who switch between diferent devices12</u> Prioritization of content and UI elements on the screen. This means that the design of a mobile app or website should focus on the most important and relevant information and actions for the user, and eliminate or minimize the unnecessary or secondary ones. Prioritization helps users to achieve <u>their goals faster and more efciently, as well as to avoid distractons and cluter. Prioritzaton also improves the readability and usability of the product on smaller screens34</u> Reference: [Mobile UX Design: The Comprehensive Guide — updated 2023], [Mobile UX design principles and best practices], [Mobile UX Design: The Ultimate Guide 2023 - Bluespace], [Mobile UX Design: Key Principles. by Nick Babich - UX Planet] <u>htps://uxcam.com/blog/mobile-ux/ htps://uxplanet.org/mobile-ux-design-key-principlesdee1a632f9e6</u>"
  },
  {
    "id": 76,
    "category": "Testing",
    "question": "Cloud Kicks (CK) has finished conducting research and has synthesized the findings. CK nowplans to collaboratively redesign services with stakeholders to address issues uncovered in the study. Which process should be used?",
    "choices": [
      "Service-Blueprinting Workshop",
      "Management Committee Meeting",
      "Pitch Session",
      "Service Usability Testing"
    ],
    "correctAnswerText": "Service-Blueprinting Workshop",
    "explanation": "A service-blueprinting workshop is a process that involves mapping out the flow of a service, identifying the touchpoints, actors, processes, and systems that are involved, and highlighting the pain points and opportunities for improvement. A service-blueprinting workshop is a collaborative and creative way to redesign services with stakeholders, as it allows them to see the big picture, empathize with the users, and co-create solutions. A service-blueprinting workshop is suitable for Cloud Kicks (CK) after they have finished conducting research and synthesizing the findings, as it will help them address the issues uncovered in the study and design better service experiences for their <u>customers. Reference: Service Design Service Blueprints, How to create a service blueprintng facilitaton guide, Workshop exercise: Service Blueprint</u>"
  },
  {
    "id": 77,
    "category": "Discovery",
    "question": "A UX Designer at Cloud Kicks has been asked to gather insights for a newly released feature at scale from a Specific set of users in the flow of their work. Which approach should be used?",
    "choices": [
      "In-App Feedback",
      "User Interviews",
      "A/B Test",
      "Survey"
    ],
    "correctAnswerText": "In-App Feedback",
    "explanation": "In-app feedback is a method of collecting user feedback within the context of the product or service, without interrupting the user’s workflow. It allows the UX designer to gather insights from a specific set of users at scale and measure their satisfaction, preferences, and pain points. In-app feedback can be implemented using various techniques, such as ratings, reviews, comments, suggestions, polls, or pop-ups . Reference: : User Experience Designer Certification Prep: Module 3: Conduct User Research : User Experience Designer Certification Prep: Module 4: Analyze User Research Data"
  },
  {
    "id": 78,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer needs to restyle a Lightning Experience model to meet brand guidelines. Which two steps should the designer take? Choose 2 answers",
    "choices": [
      "Use design tokens.",
      "Configure properties in App Builder.",
      "Find theappropriate component blueprint.",
      "Use a Lightning flow."
    ],
    "correctAnswerText": [
      "Use design tokens.",
      "Find theappropriate component blueprint."
    ],
    "explanation": "To restyle a Lightning Experience model to meet brand guidelines, the designer should use design tokens and find the appropriate component blueprint. Design tokens are variables that store visual design attributes, such as colors, fonts, and spacing. They allow the designer to customize the appearance of Lightning components without writing any code. Component blueprints are design specifications for Lightning components that provide guidance on how to use them, what properties they support, and how they behave in different scenarios. They help the designer to choose the right component for the model and apply the brand guidelines consistently. Reference: : Design Tokens | Salesforce Developer Guide : Component Blueprints | Lightning Design System : UX Designer Certification Prep: Designing with Lightning Components | Trailhead"
  },
  {
    "id": 79,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer is adding an icon without a visible, descriptive level to an interface using a salesforce Lightning Design System (SLDS) component Blueprint. Which attribute should be used to ensure the icon complies with accessibility requirements?",
    "choices": [
      "href",
      "class",
      "title",
      "for"
    ],
    "correctAnswerText": "title",
    "explanation": "According to the SLDS documentation, icons require a containing element with the class sldsicon_container for accessibility support. If the icon is used without a visible, descriptive label, a title attribute is needed on the containing element. The title should describe the icon. For example: <span class=“slds-icon_container slds-icon-utility-announcement” title=“Description of icon when needed”> <svg class=“slds-icon slds-icon-text-default” aria-hidden=“true”> <use xlink:href=“/assets/icons/utility-sprite/svg/symbols.svg#announcement”></use> </svg> </span> The title attribute provides a tooltip for the icon when the user hovers over it, and it also helps screen readers to announce the icon’s meaning. The other attributes (href, class, and for) do not provide this functionality. <u>Reference: Icons - Lightning Design System</u>"
  },
  {
    "id": 80,
    "category": "Declarative Design",
    "question": "Cloud Kicks hired a UX Designer to help create a form for a wide group of users. After receiving that final requirement, the designer realizes there are too many fields. What could improve form readability?",
    "choices": [
      "Improve form security by adding a challenge-response test.",
      "Create a three-column grid to reduce the form length.",
      "Replace field labels with placeholder text.",
      "Add section headers to visually separate fields into groups."
    ],
    "correctAnswerText": "Add section headers to visually separate fields into groups.",
    "explanation": "Adding section headers to a form can improve its readability by breaking it into logical chunks and providing context for the users. Section headers can also help users scan the form and find the information they need faster. Section headers can also reduce the cognitive load and increase the completion rate of the form . Reference: : Salesforce Certified User Experience Designer Exam Guide, Section 3.2: Design for readability and clarity : UX Designer Certification Prep: Design for Readability and Clarity, Unit 2: Design for Readability and Clarity E. Access at any time to a customized set of items specific to an app #### **Answer: B C E** Explanation: The utility bar is a fixed footer that gives users quick access to productivity tools, such as notes, history, and recent items. It can be customized for each Lightning app to enhance the user experience and efficiency. Some of the standard use cases for using the utility bar are: Perform common tasks without navigating away from the page: Users can use the utility bar to perform tasks such as creating notes, logging calls, or sending emails without leaving their current context. This reduces the need for switching tabs or opening new windows, and saves time and clicks. Access to view a list of records favorited for quick access: Users can use the utility bar to access their favorites, which are records, lists, groups, or other items that they have marked with a star icon for easy access. This allows users to quickly navigate to the items they use most frequently, and organize them in a personalized way. Access at any time to a customized set of items specific to an app: Users can use the utility bar to access items that are relevant and useful for the app they are using. For example, in the Sales app, users can access the Lightning Dialer, the Assistant, or the Today’s Events utility. In the Service app, users can access the Omni-Channel, the Macros, or the Case Timer utility. The utility bar can be configured to show different items for different apps, depending on the user’s needs and preferences. Reference: : User Experience Designer Certification Prep: Module 5: Design User Interfaces : Lightning App Builder: Utility Bar"
  },
  {
    "id": 81,
    "category": "UX Fundamentals",
    "question": "A branding and marketing team wants to customize the theme in the externalcustomer support site to match the style guide requirements? What should be the recommended next step?",
    "choices": [
      "Create a custom-scoped CSS style sheet.",
      "Configure the Experience Builder Theme panel.",
      "Override conflicting Salesforce Lightning Design System (SLDS) styles.",
      "Link a company style sheet."
    ],
    "correctAnswerText": "Configure the Experience Builder Theme panel.",
    "explanation": "To customize the theme in the external customer support site to match the style guide requirements, the recommended next step is to configure the Experience Builder Theme panel. The Theme panel allows the designer to customize the look and feel of the site by setting the logo, colors, fonts, and other branding elements. The designer can also create custom themes and assign them to different pages or audiences. The Theme panel is the preferred way to apply consistent branding across the site without writing any code or overriding any styles. Reference: : Theme Panel | Salesforce Help : UX Designer Certification Prep: Designing with Experience Builder | Trailhead"
  },
  {
    "id": 82,
    "category": "Discovery",
    "question": "Cloud Kicks has asked its UX Designer to optimize its Salesforce instance to help the IT help desk team quickly resolve queued Case. The requirements include: * The ability to view their Case queue while working a particular Case. * A persistent place to create Notes. Which two Salesforce configuration features should be recommended? Choose 2 answers",
    "choices": [
      "Docked Utility Bar",
      "List View - Split View",
      "Dynamic Forms",
      "Activity Timeline"
    ],
    "correctAnswerText": [
      "Docked Utility Bar",
      "List View - Split View"
    ],
    "explanation": "<u>A docked utlity bar is a Salesforce confguraton feature that allows users to access common productvity tools, such as notes, history, or macros, from a fxed footer at the botom of the screen1. A list view - split view is a Salesforce confguraton feature that allows users to see a list view</u> - <u>and a record side by side in a split screen layout2. These two features can help the IT help desk team</u> quickly resolve queued cases by providing them with a persistent place to create notes and the ability to view their case queue while working a particular case. Dynamic forms and activity timeline are not relevant for this scenario, as they do not address the requirements of the IT help desk team. <u>Reference: Utlity Bar - Salesforce Help and Split View - Salesforce Help</u>"
  },
  {
    "id": 83,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks (CK) is building a new community portal using Experience Cloud. CK’s Designer is asked to provide examples of out-of-box functionality that will make for great customer enagement. In which three Ways Could CK's customers engage? Choose 3 answers",
    "choices": [
      "Endorsement of skills and expertise",
      "Customize page layouts",
      "Choose personalized branding",
      "Join affinity groups",
      "Recognize peers with badges"
    ],
    "correctAnswerText": [
      "Endorsement of skills and expertise",
      "Join affinity groups",
      "Recognize peers with badges"
    ],
    "explanation": "CK’s customers can engage in the following three ways using the out-of-box functionality of Experience Cloud: Endorsement of skills and expertise: Customers can endorse each other’s skills and expertise on their profiles, which helps to build trust and credibility within the community. Join affinity groups: Customers can join groups based on their interests, preferences, or needs, which allows them to connect with like-minded people and share relevant information. Recognize peers with badges: Customers can recognize each other’s contributions and achievements by awarding badges, which helps to motivate and appreciate the community members. Reference: : Endorse Skills and Expertise : Create and Manage Groups : Award Badges to Recognize Members"
  },
  {
    "id": 84,
    "category": "Testing",
    "question": "A UX Designer at Cloud Kicks (CK) isgoing to conduct discovery phase research to understand more about the customers’ purchasing habits. They are interested in remotely observing customers’ buying patterns over the course of a 2 –month period. Which research methodology should be used?",
    "choices": [
      "Usability Study",
      "Focus Group",
      "Diary Study",
      "Survey"
    ],
    "correctAnswerText": "Diary Study",
    "explanation": "<u>A diary study is a research methodology that involves asking partcipants to record their thoughts, feelings, behaviors, and actvites over a period of tme, usually in response to prompts or questons from the researcher1. A diary study is suitable for Cloud Kicks (CK) to conduct discovery phase</u> research to understand more about the customers’ purchasing habits, as it will allow them to <u>remotely observe customers’ buying paterns over the course of a 2-month period. A diary study will also provide rich and contextual data on the customers’ needs, preferences, motvatons, and pain points, as well as the factors that infuence their purchasing decisions1. Reference: Salesforce User Experience Designer Exam Guide, Diary Studies: How to Conduct from Start-to-Finish</u>"
  },
  {
    "id": 85,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks (CK) wants to determine whether or not the Experience Cloud site it is launching is intuitive. CK’s UX Designer is going to conduct a usability study. What shouldbe one of the first steps when planning this study?",
    "choices": [
      "Define the goals of the study.",
      "Design changes to the site.",
      "Design the information architecture.",
      "Analyze the results of the study."
    ],
    "correctAnswerText": "Define the goals of the study.",
    "explanation": "A usability study is a method of evaluating how easy and intuitive a product or service is to use by #### **Answer: D** Explanation: Accordions are collapsible sections that can be used to separate different content areas. By using accordions, users can quickly navigate through the page and easily find thecontent that they need. The use of accordions also ensures that screen readers can access the content within each section, reducing the need for additional navigation. Additionally, a Lightning Console layout can be used to organize components, but this layout is optimized for customer service agents and not necessarily for screen reader users. Placing components in adjacent tabs or stacking them on the same page can make the page difficult to navigate and can make it difficult for screen readers to understand the page. For more information, see the Salesforce Accessibility Guide (https://help.salesforce.com/articleView?id=accessibility_overview.htm&type=5). According to the Salesforce Lightning Design System, accordions are a good way to organize components on a page for screen reader-assisted accessibility. Accordions allow users to expand and <u>collapse sectons of content, which can help reduce cognitve load and scrolling. Accordions also provide a clear heading structure and keyboard navigaton for each secton1. The other optons are</u> not recommended for screen reader-assisted accessibility, as they can create confusion, clutter, or <u>inefciency for users who rely on auditory feedback. For example, switching to a Lightning Console layout can make it harder for users to navigate between tabs and subtabs2. Placing components in adjacent tabs can also increase the number of keystrokes and commands needed to access the informaton3. Stacking components on the same page can create a long and overwhelming page that requires excessive scrolling and reading4.</u> <u>Reference: Accordions - Lightning Design System, Lightning Console Apps - Salesforce Help, Tabs - Lightning Design System, Accessibility Standards - Salesforce Help</u>"
  },
  {
    "id": 86,
    "category": "Declarative Design",
    "question": "Cloud Kicks (CK) wants to integrate learning in the flow of work and is considering using In-App Learning functionality. CK wants to assign learning content to employees as part of its onboarding process. Which two features could be assignedto learners? Choose 2 answers",
    "choices": [
      "Trailmixes",
      "Trails",
      "Modules/Badges",
      "External LMS Content"
    ],
    "correctAnswerText": [
      "Trailmixes",
      "Modules/Badges"
    ],
    "explanation": "CK can assign learning content to employees using In-App Learning functionality in the following two ways: Trailmixes: Trailmixes are custom learning paths that can include modules, projects, trails, and even external links. CK can create and assign trailmixes to learners based on their roles, goals, or interests. Learners can access trailmixes from the Learning Home or the Guidance Center in Salesforce. Modules/Badges: Modules are units of instruction that cover specific topics and skills. Badges are earned by completing modules or projects. CK can assign modules or badges to learners to help them learn specific features or functionalities in Salesforce. Learners can access modules or badges from the Learning Home or the Guidance Center in Salesforce. Reference: <u>: In-App Guidance in Lightning Experience</u> <u>: Learn MOAR in Spring '21 with In-App Learning</u> <u>: Enable Users to Learn in the Flow of Work</u>"
  },
  {
    "id": 87,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks (CK) wants to display contact information, including avatar, name, and title, for people who are related to a customer on a Record page. However, title space is available. Which standard component's design should be used given CK's constraints?",
    "choices": [
      "Table",
      "Tree Grid",
      "Tiles",
      "Interactive Cards"
    ],
    "correctAnswerText": "Tiles",
    "explanation": "<u>Tiles are standard components that display records or objects as a collecton of boxes that contain a photo and additonal informaton1. Tiles are suitable for Cloud Kicks (CK) to display contact</u> information, including avatar, name, and title, for people who are related to a customer on a Record <u>page, as they provide a compact and visual way to show the relevant data. Tiles also allow users to interact with the records by clicking or tapping on them1. Tiles can be customized to ft the available space and layout of the Record page2. Reference: Components - Salesforce Lightning Component Library, Tiles - Lightning Design System</u> Interactive cards are compact components that can displayinformation such as avatars, names, and titles in an organized way. Additionally, Interactive Cards are designed to be responsive and can be used to display information on smaller screens, such as mobile devices, without taking up too much space. This makes them ideal for CK's use case, as they can display all of the required information within the limited title space. For more information, see the Salesforce Lightning Design System documentation (https://lightningdesignsystem.com/components/cards/#interactive-cards)."
  },
  {
    "id": 88,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Which document should be the source of truth for consistency when implementing a company’s brand on Salesforce?",
    "choices": [
      "Style Guide",
      "DesignPrinciples",
      "Pattern Library",
      "Salesforce Lightning Design System **"
    ],
    "correctAnswerText": "Style Guide",
    "explanation": "A style guide is a document that defines the visual identity and branding of a company, such as the logo, color palette, typography, iconography, imagery, and tone of voice. It helps ensure consistency and coherence across different platforms and channels, and communicates the company’s values and personality. When implementing a company’s brand on Salesforce, the style guide should be the source of truth for consistency, as it provides the guidelines and rules for applying the brand elements to the user interface. A style guide can also include a pattern library, which is a collection of reusable UI components and design patterns that follow the style guide. A design principle is a statement that expresses the core values and goals of a design process, and guides the decision making and evaluation of a design solution. The Salesforce Lightning Design System (SLDS) is a set of design guidelines and resources for creating consistent and beautiful user experiences on the Salesforce platform. It can be used as a reference and a foundation for customizing the UI according to the company’s style guide. Reference: : User Experience Designer Certification Prep: Module 5: Design User Interfaces : User Experience Designer Certification Prep: Module 7: Implement User Interfaces : What is a Style Guide and Why Every UX Designer Needs One : What is a Pattern Library and Why Should You Use One? The Salesforce Lightning Design System (SLDS) is a comprehensive library of design patterns, components, and guidelines that enable developers and designers to create consistentuser interfaces on the Salesforce platform. It includes a comprehensive library of user interface components, guidelines for design consistency and accessibility, and detailed usage instructions. Using the Salesforce Lightning Design System ensures that all design elements and interactions on Salesforce use the same set of standards and patterns, resulting in a consistent and unified user experience. For more information, see the Salesforce Lightning Design System page (https://www.lightningdesignsystem.com/)."
  },
  {
    "id": 89,
    "category": "Declarative Design",
    "question": "A UX Designer is designing a Service Cloud implementation for service representatives who should be able to view the history of cases that a specific customer has submitted. Which hierarchy of information should the representative go through to view that list?",
    "choices": [
      "All Contacts > Contact Detail > Account Detail > Case Related List",
      "All Contacts > Contact Detail > Case Related List > Account Detail",
      "All Cases > Case Detail > Contact Detail > Account Related List",
      "All Accounts > Account Detail > Contact Detail > Case Related List"
    ],
    "correctAnswerText": "All Accounts > Account Detail > Contact Detail > Case Related List",
    "explanation": "To view the history of cases that a specific customer has submitted, the representative should go through the following hierarchy of information: All Accounts > Account Detail > Contact Detail > Case Related List. This is because cases are related to contacts, and contacts are related to accounts. By navigating from the account level to the contact level, the representative can see all the contacts associated with a specific account. Then, by selecting a contact, the representative can see the case related list, which shows all the cases that the contact has submitted or been involved in. This way, the representative can view the history of cases for a specific customer in a logical and efficient manner. Reference: : UX Designer Certification Prep: Designing with Service Cloud | Trailhead : Service Cloud Basics | Salesforce Help"
  },
  {
    "id": 90,
    "category": "Discovery",
    "question": "A UX Designer at Cloud Kicks is planning out the company's website redesign using Experience Cloud and will help guide discovery. Which three outputs of the discovery process should be prepare Choose 3 answers",
    "choices": [
      "User Personas",
      "Journey Maps",
      "interactive Prototypes",
      "High-Level Wireframes",
      "High-Fidelity Mock-ups"
    ],
    "correctAnswerText": [
      "User Personas",
      "Journey Maps",
      "High-Level Wireframes"
    ],
    "explanation": "<u>The discovery process is a crucial phase in any UX design project, as it helps to understand the user needs, business goals, and technical constraints of the problem1. The discovery process typically involves various research methods, such as interviews, surveys, observatons, and analytcs, to gather data and insights about the users and the context of use2. The outputs of the discovery</u> process are artifacts that synthesize and communicate the findings and insights from the research. Some of the common outputs of the discovery process are: <u>User personas: These are fctonal representatons of the target users, based on real data and insights, that describe their goals, motvatons, pain points, behaviors, and preferences3. User</u> personas help to empathize with the users and design solutions that meet their needs and expectations. <u>Journey maps: These are visualizatons of the user’s end-to-end experience with a product or service, from the inital trigger to the fnal outcome4. Journey maps help to identfy the user’s actons,</u> thoughts, emotions, pain points, and opportunities for improvement at each stage of the journey. High-level wireframes: These are low-fidelity sketches or diagrams that show the basic layout, structure, and functionality of the website or app. High-level wireframes help to define the information architecture, navigation, and content hierarchy of the solution, as well as test the usability and feasibility of the design concepts. These three outputs are essential for planning out the website redesign using Experience Cloud, as they help to define the user requirements, the user flow, and the user interface of the solution. The other two options, interactive prototypes and high-fidelity mock-ups, are not outputs of the discovery process, but rather of the design and testing phases. Interactive prototypes are clickable simulations of the website or app that allow users to interact with the functionality and features of the solution. High-fidelity mock-ups are realistic and detailed representations of the website or app that show the final look and feel of the solution, including the colors, fonts, images, and icons. These two outputs are created after the discovery process, based on the feedback and validation from the user testing sessions. <u>Reference: UX Discovery Process: A Complete Guide, UX Research Methods: How to Uncover Valuable Insight about your Users, User Persona: What It Is and How to Create One, Journey</u> <u>Mapping 101, [Wireframes: A Beginner’s Guide], [Prototyping 101: The Diference between Low-</u> Fidelity and High-Fidelity Prototypes and When to Use Each], [What is a Mockup? The Final Layer of UI Design] For the UX Designer at Cloud Kicks, thethree outputs of the discovery process that should be prepared are User Personas, Journey Maps, and High-Level Wireframes. User Personas are fictional characters that represent a target audience for the website, and are used to help guide the website design. Journey Maps are diagrams that illustrate the user's experience as they navigate the website, and provide insights into how the user interacts with the website. High-Level Wireframes are simple sketches of the website layout, and are used to organize the website's content and design elements. Interactive Prototypes and High-Fidelity Mock-ups are not necessary outputs of the discovery process, as they are more detailed representations of the design that come later in the design process. For more information, see the Salesforce Experience Cloud documentation (https://help.salesforce.com/articleView?id=experience_cloud_overview.htm&type=5)."
  },
  {
    "id": 91,
    "category": "Discovery",
    "question": "Cloud Kicks (CK) has already identified its user personas. The UX Designer wants to synthesize what CK knows about the users so that a shared understanding is created with the rest of the organization. Which tool should be used to share this insight?",
    "choices": [
      "A/BTesting",
      "Full Recorded Interviews",
      "Empathy Map",
      "Heuristic Review"
    ],
    "correctAnswerText": "Empathy Map",
    "explanation": "An empathy map is a tool that helps to synthesize what CK knows about the users and share this insight with the rest of the organization. An empathy map is a visual representation of the user’s perspective, based on their thoughts, feelings, actions, and needs. It helps to create a shared understanding of the user’s goals, pain points, motivations, and emotions. An empathy map can also help to identify gaps in the user research and generate new ideas for design solutions. Reference: <u>: Creatng a Customer Empathy Map Using The 5 Senses</u> <u>: Why Empathy Is Crucial to Business Success</u> <u>: Use Empathy Maps to build beter sofware</u>"
  },
  {
    "id": 92,
    "category": "Declarative Design",
    "question": "What are three benefits of asking the user to think aloud during a user task? Choose 3 answers",
    "choices": [
      "No special equipment needed",
      "Natural process",
      "Unblasedbehavior",
      "Flexibility",
      "Raw stream of thought"
    ],
    "correctAnswerText": [
      "No special equipment needed",
      "Flexibility",
      "Raw stream of thought"
    ],
    "explanation": "<u>Asking the user to think aloud during a user task has the following benefts12:</u> A) No special equipment needed. Thinking aloud is a simple and low-cost method that does not require any special equipment or software. The user only needs a microphone or a phone to record their voice, and the tester only needs a way to listen and observe the user’s actions. D) Flexibility. Thinking aloud is a flexible method that can be applied to various types of tasks, products, and platforms. It can also be conducted remotely or in-person, synchronously or asynchronously, moderated or unmoderated, depending on the needs and preferences of the tester and the user. E) Raw stream of thought. Thinking aloud provides a raw and rich stream of data that reveals the user’s thoughts, feelings, expectations, assumptions, motivations, and frustrations as they interact with the product. It can help the tester to understand the user’s mental model, decision-making process, and satisfaction level. <u>Reference: Thinking Aloud: The #1 Usability Tool, Thinking Aloud: What is it and for which digital product is it worthwhile?</u>"
  },
  {
    "id": 93,
    "category": "Discovery",
    "question": "The Client Service team at Cloud Kicks is having issues when editing an order record. The validation rule returns a top-of-page error indicating two other fields must be provided to validate and save the order changes. How should they efficiently find the correct fields?",
    "choices": [
      "Make sure the required field names are added to the top-of-page error message.",
      "Replace the validation rule with help text informing the businessrequirement.",
      "Replace the top-of-page validation with two field validations, assigning the respective fields.",
      "Remove the validation rule completely and provide training about order changes."
    ],
    "correctAnswerText": "Replace the top-of-page validation with two field validations, assigning the respective fields.",
    "explanation": "A top-of-page validation is a type of validation rule that displays an error message at the top of the page when a user tries to save a record that does not meet certain criteria. A field validation is a type of validation rule that displays an error message next to a specific field when a user tries to save a record that does not meet certain criteria. The advantage of using field validations over top-of-page validations is that they provide more clarity and guidance to the user about which fields need to be corrected and why. They also reduce the cognitive load and the scrolling effort for the user, as they can see the error message right next to the field they are editing. Therefore, to help the Client Service team at Cloud Kicks efficiently find the correct fields when editing an order record, the UX designer should replace the top-of-page validation with two field validations, assigning the respective fields that are required to validate and save the order changes. Reference: : User Experience Designer Certification Prep: Module 5: Design User Interfaces : User Experience Designer Certification Prep: Module 7: Implement User Interfaces : Validation Rules"
  },
  {
    "id": 94,
    "category": "Declarative Design",
    "question": "Cloud Kicks wants its users to know when a new feature is enabled or available with a short video explaining the new feature. What should be recommended?",
    "choices": [
      "Lightning Path component",
      "Docked prompt using In-App Guidance",
      "Custom video component",
      "Utility bar with embedded video"
    ],
    "correctAnswerText": "Docked prompt using In-App Guidance",
    "explanation": "To let its users know when a new feature is enabled or available with a short video explaining the new feature, the recommended solution is to use a docked prompt using In-App Guidance. In-App Guidance is a feature that allows the designer to create prompts and walkthroughs that guide users through new or complex tasks in Salesforce. A docked prompt is a type of prompt that appears at the bottom of the screen and can contain text, images, or videos. A docked prompt can be used to announce a new feature and provide a short video tutorial on how to use it. The designer can also set the conditions for when and how often the prompt should appear, and track the user engagement with the prompt. Reference: : In-App Guidance | Salesforce Help : UX Designer Certification Prep: Designing with In-App Guidance | Trailhead"
  },
  {
    "id": 95,
    "category": "UX Fundamentals",
    "question": "Which two would be considered responsive design best practices? Choose 2 answers",
    "choices": [
      "Specify breakpoint sizes.",
      "Use separate URLs per device.",
      "Utilize pop-up windows.",
      "Minimize page weight."
    ],
    "correctAnswerText": [
      "Specify breakpoint sizes.",
      "Minimize page weight."
    ],
    "explanation": "Responsive design is a web design approach that aims to make web pages adapt to different screen sizes and resolutions, ensuring good usability and user experience across all devices. Some of the best practices for responsive design are: Specify breakpoint sizes: Breakpoints are the points at which the layout of a web page changes based on the width of the viewport. For example, a web page may have a two-column layout on a desktop, a single-column layout on a tablet, and a stacked layout on a mobile phone. Specifying breakpoint sizes helps to create a fluid and flexible layout that responds to the device capabilities and user preferences. Breakpoints can be specified using media queries in CSS, which allow applying different styles depending on the media features, such as width, height, orientation, resolution, etc. For ##### example: @media (max-width: 600px) { /* Styles for screens that are 600px or smaller */ } @media (min-width: 601px) and (max-width: 900px) { /* Styles for screens that are between 601px and 900px */ } @media (min-width: 901px) { /* Styles for screens that are 901px or larger */ } Minimize page weight: Page weight is the amount of data that a web page transfers to load on a browser. It includes the size of the HTML, CSS, JavaScript, images, fonts, and other resources that make up the web page. Minimizing page weight helps to improve the performance, speed, and user satisfaction of a web page, especially on mobile devices that may have limited bandwidth, battery, and processing power. Some of the ways to minimize page weight are: Optimize images: Images are often the largest contributors to page weight, so it is important to optimize them for the web. This means choosing the right format, size, resolution, and compression level for each image, as well as using responsive images techniques, such as the srcset and sizes attributes, to deliver the most appropriate image for each device and screen size. Implement caching: Caching is a technique that stores a copy of a web page or its resources on the browser or the server, so that they can be reused without having to be downloaded again. This reduces the amount of data that needs to be transferred and improves the loading time of a web page. Caching can be implemented using HTTP headers, such as Cache-Control and Expires, or using service workers, which are scripts that run in the background and intercept network requests. Minify and concatenate files: Minification is a process that removes unnecessary characters, such as whitespace, comments, and formatting, from the code files, such as HTML, CSS, and JavaScript, to reduce their size. Concatenation is a process that combines multiple code files into one, to reduce the number of HTTP requests that the browser needs to make. Both minification and concatenation can help to reduce the page weight and improve the performance of a web page. Use a content delivery network (CDN): A CDN is a network of servers that are distributed across different locations and regions, and that store and deliver copies of a web page or its resources to the users. A CDN can help to reduce the page weight and improve the speed of a web page by serving the content from the nearest server to the user, reducing the latency and bandwidth consumption. The other two options, using separate URLs per device and utilizing pop-up windows, are not considered responsive design best practices, as they can create usability and accessibility issues for the users. Using separate URLs per device means creating different versions of a web page for different devices, such as example.com for desktop, m.example.com for mobile, and t.example.com for tablet. This approach can lead to inconsistent and fragmented user experiences, as well as duplicate content and SEO problems. Utilizing pop-up windows means creating new browser windows that open on top of the current web page, usually to display advertisements, notifications, or forms. This approach can be annoying and intrusive for the users, as well as difficult to close or navigate on small screens. <u>Reference: Responsive Design: Best Practces and Consideratons | Toptal®, Responsive design - Learn web development | MDN, The Beginner’s Guide to Responsive Web Design in 2023 - Kinsta, Responsive Design Best Practces. by Nick Babich - UX Planet</u>"
  },
  {
    "id": 96,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer is creating an experience to help organize content into collapsible sections. Which Lightning component should be used?",
    "choices": [
      "Einstein Next Best Action",
      "Lightning Toggle",
      "Accordion",
      "Highlights Panel"
    ],
    "correctAnswerText": "Accordion",
    "explanation": "The Lightning component that should be used to organize content into collapsible sections is the Accordion component. The Accordion component displays vertically stacked sections of content that can be expanded and collapsed by clicking on the section headers. Users can control how much content is visible at once, and don’t need to scroll as much to see the content of a page. The Accordion component can also be configured to allow multiple sections to be open at the same time. The Accordion component implements the accordion blueprint in the Salesforce Lightning Design System (SLDS). Reference: <u>: lightning-accordion - documentaton - Salesforce Lightning Component Library</u> <u>: Collapsible Related List in Lightning Experience : How To Create Expand/Collapse Sectons In SFDC Lightning Component</u> The Lightning Accordion component isdesigned to help create an organized, collapsible display of content. It is composed of a header and a body, which can be used to display different sections of content in an organized way. The body of the Accordion is hidden until the header is clicked, allowing the user to quickly and easily access the content they need. Salesforce provides a detailed guide to using the Accordion component, including examples and code snippets, which can be found here: https://developer.salesforce.com/docs/componentlibrary/documentation/lwc/lwc.use_accordion."
  },
  {
    "id": 97,
    "category": "Testing",
    "question": "Which two steps should a UX Designer take to create and deliver responsible andtransparent AI technology? Choose 2 answers",
    "choices": [
      "Collect as much data from the user as possible for a catered experience.",
      "Design AI that is seamless enough so the user does not notice.",
      "Document model cards to clarify intended context and use cases.",
      "Provide clear explanations of AI predictions or recommendations."
    ],
    "correctAnswerText": [
      "Document model cards to clarify intended context and use cases.",
      "Provide clear explanations of AI predictions or recommendations."
    ],
    "explanation": "<u>: A UX Designer should take the following steps to create and deliver responsible and transparent AI technology12:</u> <u>C) Document model cards to clarify intended context and use cases. Model cards are standardized documents that provide essental informaton about a machine learning model, such as its purpose, performance, limitatons, and ethical consideratons3. Model cards can help UX Designers to communicate the design choices and trade-ofs of their AI systems, and to ensure that they are aligned with the user needs and expectatons4. D) Provide clear explanatons of AI predictons or recommendatons. Explanatons are user-facing</u> <u>descriptons of how and why an AI system produces a certain output, such as a predicton, a recommendaton, or a decision5. Explanatons can help UX Designers to increase the transparency and trustworthiness of their AI systems, and to empower users to understand, control, and evaluate the AI outcomes6.</u> <u>Reference: Salesforce Debuts AI Ethics Model: How Ethical Practces Further Responsible Artfcial Intelligence, Generatve AI: 5 Guidelines for Responsible Development - Salesforce, Model Cards for Model Reportng, Model Cards: A Framework for Increasing Trust in AI Systems, Explainable AI: A Guide for Making Black Box Machine Learning Models Explainable, Salesforce Supports AI Regulaton Advancing Digital Trust and Innovaton - Salesforce</u> C) Document model cards to clarify intended context and use cases. Model cards are documents that describe the intended use, performance, and limitations of AI models. They help ensure that the AI technology is being used responsibly and transparently, as they provide clear information about the model's context, data, and assumptions. This can help reduce the risk of unintended consequences and build trust with users. D) Provide clear explanations of AI predictions or recommendations. Clear explanations of AI predictions or recommendations help build trust with users and increase understanding of how the AI technology works. By providing an understandable explanation of how a prediction or recommendation was made, users can gain a better understanding of the technology and how it is intended to be used. This can also help reduce the risk of unintended consequences and improve accountability."
  },
  {
    "id": 98,
    "category": "Discovery",
    "question": "A UX Designer wants tobuild on a human-centered design by focusing on more than just an individual person and is considering engaging, connected, and social value-driven solutions. What is the designer practicing?",
    "choices": [
      "Compassionate Design",
      "Relationship Design",
      "Service Design",
      "User Experience Design"
    ],
    "correctAnswerText": "Service Design",
    "explanation": "Service design is a practice that aims to design and deliver holistic, human-centered, and valuedriven solutions that consider the needs and expectations of not only the individual users, but also the stakeholders, the employees, the partners, and the society involved in the service. Service design focuses on more than just the user interface or the user experience, but also on the processes, systems, interactions, touchpoints, and channels that enable the service to be delivered and consumed. Service design can help create engaging, connected, and social value-driven solutions that improve the quality, efficiency, and sustainability of the service . Reference: : User Experience Designer Certification Prep: Module 1: Understand User Experience Design : What is Service Design? Service Design is a design practice that focuses on providing better experiences to users by understanding the context of their needs and how they interact with systems, services, and products. ##### D. Understand the problem before moving tosolutions. - E. Determine user acceptance criteria. #### **Answer: B C D** Explanation: <u>The discovery phase is a crucial stage in any UX design project, as it helps to understand the user needs, business goals, and technical constraints of the problem1. The discovery phase typically involves various research methods, such as interviews, surveys, observatons, and analytcs, to gather data and insights about the users and the context of use2. The outputs of the discovery phase</u> are artifacts that synthesize and communicate the findings and insights from the research. Some of the practices that should be considered for planning out the strategy for an upcoming discovery phase are: Gather insight from end users: One of the main objectives of the discovery phase is to empathize with the end users and understand their goals, motivations, pain points, behaviors, and <u>preferences. This can be done by conductng user research, such as interviews, surveys, focus groups, or usability tests, to collect qualitatve and quanttatve data from the target audience3. Gathering</u> insight from end users helps to validate the assumptions and hypotheses about the problem and the solution, as well as to identify the user requirements and expectations for the design. Establish the research plan and timeline: Before conducting any user research, it is important to establish a clear and realistic research plan and timeline. The research plan should define the <u>research objectves, questons, methods, partcipants, and deliverables. The research tmeline should specify the duraton, frequency, and sequence of the research actvites, as well as the deadlines and milestones for the deliverables4. Establishing the research plan and tmeline helps to ensure that the</u> discovery phase is well-organized, efficient, and effective, as well as to communicate the expectations and responsibilities to the stakeholders and the team members. Understand the problem before moving to solutions: Another key practice for the discovery phase is to focus on understanding the problem before jumping to solutions. This means defining the problem statement, the scope, and the constraints of the project, as well as identifying the root causes, the symptoms, and the impacts of the problem. Understanding the problem before moving to solutions helps to avoid wasting time and resources on creating solutions that do not address the real needs and pain points of the users, or that are not feasible or viable for the business or the technology. The other two options, considering platform-based before custom solutions and determining user acceptance criteria, are not practices that should be considered for planning out the strategy for an <u>upcoming discovery phase. Considering platorm-based before custom solutons is a practce that belongs to the design phase, not the discovery phase, as it involves choosing the best soluton opton based on the user research fndings and the design principles5. Determining user acceptance criteria is a practce that belongs to the testng phase, not the discovery phase, as it involves defning the criteria that the soluton must meet to be accepted by the users and the stakeholders6. Reference: UX Discovery Process: A Complete Guide, UX Research Methods: How to Uncover Valuable Insight about your Users, User Research: What It Is and Why You Should Do It, How to Create a UX Research Plan, Platorm-Based vs. Custom Solutons: Which One to Choose?, User Acceptance Testng (UAT): A Complete Guide</u> For Cloud Kicks' upcoming discovery phase, the three practices that should be considered are: A) Understand the Problem Before Moving to Solutions: Establishing a clear understanding of theproblem and what the desired outcomes are before beginning the discovery phase is essential for successful project planning. This can be done by gathering data and insights from end users, conducting research, and understanding how the problem is currentlybeing addressed. B) Gather Insight from End Users: Gathering insights from end users is a crucial step in the discovery phase. End users provide valuable feedback and insights into the problem and how a potential solution may work. This feedback can helpshape the overall project plan and help identify potential solutions. C) Establish the Research Plan and Timeline: The research plan and timeline should be established before beginning the discovery phase. This should include a list of tasks to be completed, the resources needed, and a timeline for completion. This plan should be communicated to all stakeholders so everyone is aware of the project goals and timeline."
  },
  {
    "id": 99,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A developer is creating a Lightning Web Component (LWC) and wants to make sure the visual experience is consistent with Cloud Kicks’ branding. The developer asks their UX Designer about the Salesforce Lightning Design System (SLDS) styling hooks. How should the designer describe them?",
    "choices": [
      "They use standard CSS properties to directly style HTML elements.",
      "They use standard CSS properties to easily style base and custom components.",
      "They use custom CSS properties to directly style HTML elements.",
      "The use custom CSS properties to easily style case and custom component."
    ],
    "correctAnswerText": "The use custom CSS properties to easily style case and custom component.",
    "explanation": "The designer should describe SLDS styling hooks as custom CSS properties that can easily style base and custom components. Styling hooks are placeholders in the SLDS style sheet that allow developers to customize the look and feel of their Lightning components by using the corresponding CSS custom properties. For example, the developer can change the background color of a button by setting the value of the --slds-c-button-brand-color-background custom property. Styling hooks are especially useful when working with web components and shadow DOM, as they enable componentlevel customizations without affecting the global styles. Styling hooks also provide consistency and performance benefits, as they leverage the SLDS design tokens and the native browser support for CSS custom properties. Reference: <u>: Styling Hooks - Lightning Design System</u> <u>: SLDS Styling Hooks | Lightning Web Components Developer Guide | Salesforce Developers : SLDS Styling hooks in Lightning web components - Forcetrails</u> The designer should describe the Salesforce Lightning Design System (SLDS) styling hooks as using standard CSS properties to easily style base and custom components. SLDS styling hooks allow developers to quickly and easily apply CSS classes to HTML elements, enabling consistent styling across both base and custom components. This allows developers to quickly and easily apply branding and styling to their Lightning Web Components, without needing to write custom CSS. For more information about SLDS styling hooks, please see the following Salesforce documentation: https://developer.salesforce.com/docs/componentlibrary/documentation/lwc/lwc.use_slds_styles_hooks"
  },
  {
    "id": 100,
    "category": "Testing",
    "question": "Cloud Kicks (CK) wants to adopt a human-centered design process in the redesign of its Salesforce journeys and processes. In which order should CK's UX Designer undertake the steps of this process to achieve maximum impact?",
    "choices": [
      "Ideation > Iteration > Prototyping > Implementation > User Feedback > Observation",
      "Observation > Ideation > Prototyping > User Feedback > Iteration > implementation",
      "Prototyping > Iteration > Observation > Ideation > Implementation >User Feedback",
      "Implementation> Observation > User Feedback > Prototyping > Ideation > Iteration"
    ],
    "correctAnswerText": "Observation > Ideation > Prototyping > User Feedback > Iteration > implementation",
    "explanation": "<u>A human-centered design process is a creatve approach to solving people’s problems that begins with identfying their needs and ends with creatng solutons that meet those needs1. A humancentered design process typically involves the following steps in this order23:</u> Observation: This step involves researching and understanding the users, their context, their goals, their pain points, and their behaviors. Observation methods include interviews, surveys, ethnography, contextual inquiry, and data analysis. Ideation: This step involves generating and exploring a wide range of possible solutions that address the users’ needs and problems. Ideation methods include brainstorming, sketching, mind mapping, affinity diagramming, and storyboarding. Prototyping: This step involves creating and testing low-fidelity or high-fidelity representations of the proposed solutions, such as mockups, wireframes, or interactive models. Prototyping methods include paper prototyping, digital prototyping, and rapid prototyping. User Feedback: This step involves collecting and analyzing feedback from the users on the prototypes, such as their opinions, preferences, satisfaction, and suggestions. User feedback methods include usability testing, user testing, focus groups, and surveys. Iteration: This step involves refining and improving the prototypes based on the user feedback, and repeating the prototyping and user feedback steps until the optimal solution is achieved. Iteration methods include agile development, design sprints, and A/B testing. Implementation: This step involves deploying and launching the final solution to the users, and monitoring and evaluating its performance and impact. Implementation methods include release management, change management, and analytics. <u>Reference: Relatonship Design - Trailhead, Human-Centered Design: Defniton and Stages - Interacton Design Foundaton, Human-Centered Design Process - Salesforce UX</u> The order in which CK's UX Designer should undertake the steps of the human-centered design process to achieve maximum impact is Observation > Ideation > Prototyping > User Feedback > Iteration > Implementation. This allows the designer to take into account the user’s preferences and needs from the very beginning, as well as provide the user with feedback throughout the entire process. The order of steps for a human-centered design process is as follows: Observation: Observing user behaviour and interactions to gain insights into their needs and preferences. Ideation: Coming up with ideas for potential solutions based on the insights from the observation phase. Prototyping: Creating a prototype of the potential solution to test out with users. User Feedback: Gathering feedback from users on the prototype and making changes based on their feedback. Iteration: Iterating on the prototype based on the feedback from users. Implementation: Implementing the final solution. For more information on the human-centered design process, please see the following Salesforce documentation: https://trailhead.salesforce.com/en/content/learn/modules/ux_design_process"
  },
  {
    "id": 101,
    "category": "Discovery",
    "question": "A UX Designer has completed discovery, research analysis, and ideation. How should they prepare for the next phase?",
    "choices": [
      "Build partnerships.",
      "Create business model canvas.",
      "Continue iterating.",
      "Determine what to prototype."
    ],
    "correctAnswerText": "Determine what to prototype.",
    "explanation": "The next phase after discovery, research analysis, and ideation is prototyping, which is the process of creating low-fidelity or high-fidelity representations of the design solution that can be tested and validated with users and stakeholders. To prepare for this phase, the UX designer should determine what to prototype, which means deciding on the scope, the level of detail, the format, and the tools for creating the prototype. The UX designer should consider the following factors when determining what to prototype: The goals and objectives of the prototype: What is the purpose of the prototype? What questions or hypotheses does it aim to answer or test? What feedback or data does it seek to collect? The target users and audience of the prototype: Who are the users and stakeholders that will interact with or evaluate the prototype? What are their needs, expectations, and preferences? How will they access and use the prototype? The features and functionality of the prototype: What are the key features and functionality that the prototype should include or exclude? How will they support the user goals and tasks? How will they demonstrate the value proposition and the design principles of the solution? The fidelity and interactivity of the prototype: How realistic and detailed should the prototype be? How interactive and responsive should the prototype be? How will the prototype convey the look and feel, the content, and the behavior of the solution? The tools and methods of the prototype: What tools and methods will be used to create and present the prototype? How will they affect the time, cost, and quality of the prototype? How will they facilitate the testing and validation of the prototype? Reference: : User Experience Designer Certification Prep: Module 5: Design User Interfaces : User Experience Designer Certification Prep: Module 6: Validate User Interfaces : What is Prototyping? The next phase for a UX designer after completing discovery, research analysis, andideation is to determine what to prototype. Prototyping is the process of creating a model, mock-up, or simulation #### **Answer: A** Explanation: The human-centered design approach is a problem-solving technique that puts real people at the center of the development process, enabling designers to create products and services that resonate <u>and are tailored to the audience’s needs. The human-centered design approach typically involves four stages: clarify, ideate, develop, and implement1. The frst stage, clarify, is dedicated to collectng</u> data and observing the users to clarify the problem and how to solve it. Rather than developing products based on assumptions, designers conduct user research and assess user needs to determine what the users want. The clarify stage requires empathy—the capability of understanding <u>another person’s experiences and emotons. Designers need to consider the users’ perspectves and ask questons to determine what products they’re currently using, why and how they’re using them,</u> ’ <u>and the challenges they re trying to solve2.</u> Therefore, the activity that should come first in the human-centered design process is observing the medical staff while they use their existing portal. This activity will help the UX designer to understand the context, the goals, the pain points, and the preferences of the medical staff, as well as to identify the opportunities for improvement and innovation. The other activities, such as estimating the cost, writing technical requirements, and designing a mockup, belong to the later stages of the humancentered design process, after the problem and the user needs have been clearly defined. <u>Reference: What is Human-Centered Design? — updated 2023 | IxDF and What Is Human-Centered Design? | HBS Online</u> The first activity inthe process when using a human-centered design approach to redesign a portal that medical staff use to report on patient demographics should be observing the medical staff while they use their existing portal. This is a critical step in the process, as ithelps to identify user needs, preferences, and behaviors so that the design of the new portal can be tailored to meet their specific needs. Observing the medical staff while they use the portal will help to identify any existing problems and highlightareas where the portal can be improved. This can include issues with usability, functionality, and accessibility. Additionally, observing how the medical staff interact with the portal can help to identify any potential areas of improvement and uncover anyhidden requirements or user needs. Reference: [1] https://www.salesforce.com/blog/2019/02/human-centereddesign.html [2] https://uxplanet.org/human-centered-design-process3d3d3f9a50db [3] https://uxdesign.cc/human-centered-design-for-ux-designers-d4f0e741b9a9"
  },
  {
    "id": 102,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks has identified that users are getting anxious over a multiple-step custom Screen Flow with no way of visualizing its completeness. What should be done to improve the user experience?",
    "choices": [
      "Replace multiple-step Screen Flowwith a static vertical form.",
      "Set up a Salesforce Path with Guidance for Success.",
      "Configure cascading accordions to condense the experience.",
      "Create a Progress Indicator component that displays the flow's stages. **"
    ],
    "correctAnswerText": "Create a Progress Indicator component that displays the flow's stages. **",
    "explanation": "The best way to improve the user experience of a multiple-step custom Screen Flow is to create a Progress Indicator component that displays the flow’s stages. A Progress Indicator component provides a visual indication of the progress of a particular process, showing the number of steps, the current step, and the prior steps completed. This helps to reduce the user’s anxiety and uncertainty by letting them know where they are in the flow and how much is left to complete. A Progress Indicator component can be created using the lightning:progressIndicator or lightning-progressindicator tags in Aura or Lightning Web Components, respectively. The component can be customized to match the branding and styling of Cloud Kicks, and can be integrated with the Screen Flow using attributes and events. Reference: <u>: lightning:progressIndicator - documentaton - Salesforce Lightning Component Library : lightning-progress-indicator - documentaton - Salesforce Lightning Component Library</u> <u>: How to Add a Progress Bar to a Screen Flow</u>"
  },
  {
    "id": 103,
    "category": "Declarative Design",
    "question": "The service team at Cloud Kicks has complained about the quantity of list views available, ,making it hard find the relevant ones. In which two ways should their experience be improved? Choose 2 answers",
    "choices": [
      "Request users to create and share their list views.",
      "Share list views to Public Groups and only add relevant users.",
      "Remove irrelevant public list views.",
      "Recommend using related lists instead of list views."
    ],
    "correctAnswerText": [
      "Share list views to Public Groups and only add relevant users.",
      "Remove irrelevant public list views."
    ],
    "explanation": "<u>To improve the experience of the service team at Cloud Kicks, their UX Designer should do the following12:</u> B) Share list views to Public Groups and only add relevant users. This will help to organize and manage the list views based on the roles and responsibilities of the service team members, and to <u>avoid clutering their list view menu with unnecessary or irrelevant list views. Public Groups are collectons of users, roles, or other groups that can be used to share list views, reports, dashboards, and other records3.</u> C) Remove irrelevant public list views. This will help to reduce the number of list views available, and to make it easier for the service team members to find the relevant ones. Irrelevant public list views are those that are outdated, duplicated, unused, or not applicable to the service team’s needs or goals. <u>Reference: List Views - Salesforce Help, Your Complete Guide to Salesforce List Views in Lightning, Public Groups - Salesforce Help, Improve List View Performance - Salesforce</u>"
  },
  {
    "id": 104,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks wants to implement its company colors in all UIcomponents, like buttons and icons, using a custom themes. How does the Salesforce Lightning Design System (SLDS) ensure the UI components align with the theme?",
    "choices": [
      "Design tokens prefixed with \"brand\"",
      "JS libraries loaded from a static resource",
      "CSS Hexcolors",
      "Builder panels"
    ],
    "correctAnswerText": "Design tokens prefixed with \"brand\"",
    "explanation": "The Salesforce Lightning Design System (SLDS) is a set of design guidelines and resources for creating consistent and beautiful user experiences on the Salesforce platform. It provides UI components, icons, fonts, colors, and more that follow the best practices and accessibility standards of Salesforce. One of the features of SLDS is the ability to create custom themes that reflect the brand identity and personality of a company or an app. Custom themes can be implemented using design tokens, which are variables that store the values of the UI elements, such as colors, sizes, spacing, fonts, etc. Design tokens can be overridden or customized to change the appearance of the UI components without modifying the CSS or HTML code. To implement the company colors in all UI components, such as buttons and icons, using a custom theme, the UX designer should use the design tokens prefixed with “brand”, such as $brand-primary, $brand-secondary, $brand-accessible, etc. These design tokens control the color scheme of the UI components and can be assigned the values of the company colors. For example, to change the color of the primary button to the company’s blue color, the UX designer can use the following design token: $brand-primary: #0070d2; Reference: : User Experience Designer Certification Prep: Module 7: Implement User Interfaces : Salesforce Lightning Design System: Customization : Salesforce Lightning Design System: Design Tokens"
  },
  {
    "id": 105,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks’ website serves two primary authenticated audiences: suppliers and installers. Their overall experience is the same, but the presentations for the audience should have a unique look and feel. Experience Builder will used to create a unique for each audience that includes colors, image, and typography. Which out-of-the-box design approach should be recommended?",
    "choices": [
      "Use custom CSS to override the default template and Theme panel styles.",
      "Create branding sets and assign them to each audience using audience targeting.",
      "Use unique sites under digital experiences for each audience and tailor the look and feel of each.",
      "Create a custom theme for each audience and apply it to the same site."
    ],
    "correctAnswerText": "Create branding sets and assign them to each audience using audience targeting.",
    "explanation": "To create a unique experience for each audience that includes colors, images, and typography, the recommended out-of-the-box design approach is to use branding sets and assign them to each audience using audience targeting. Branding sets are collections of branding attributes, such as logos, fonts, colors, and images, that can be applied to a site or a page to customize its look and feel. Audience targeting is a feature that allows the designer to deliver different content and experiences to different groups of users based on criteria such as profile, location, or behavior. By creating branding sets and assigning them to each audience using audience targeting, the designer can easily create a unique and consistent experience for each audience without creating separate sites or custom themes. Reference: : Branding Sets | Salesforce Help : Audience Targeting | Salesforce Help : UX Designer Certification Prep: Designing with Experience Builder | Trailhead The best approach for Cloud Kicks to create a unique look and feel for each audience is to create branding sets and assign them to each audience using audience targeting. With this approach, the same website can be used for both audiences, whilethe look and feel of each page can be tailored to each audience. Branding sets allow you to create unique designs and apply them to specific audiences. You can create unique colors, images, and typography for each audience and then target them to the appropriate audiences using the audience targeting feature. This will ensure that each audience has a unique look and feel that meets their needs. Reference: [1] https://help.salesforce.com/articleView?id=siteforce_editing_audience_targeting.htm&type=5 [2 ] https://help.salesforce.com/articleView?id=siteforce_branding_sets.htm&type=5 [3] https://help.s alesforce.com/articleView?id=siteforce_creating_branding_sets.htm&type=5"
  },
  {
    "id": 106,
    "category": "UX Fundamentals",
    "question": "When designing a custom component that includes this clickable icon in a Lookup field: What should be used as the alternative (alt) text?",
    "choices": [
      "Image of a search button",
      "Search",
      "Search button",
      "Image of a magnifying glass"
    ],
    "correctAnswerText": "Search button",
    "explanation": "The alternative (alt) text is a short block of text that describes the content and function of an image or other non-text element on a web page. The alt text is read aloud by screen readers and other <u>assistve technologies to provide access to people who cannot see the image. The alt text also helps with search engine optmizaton and displays on the page if the image fails to load1.</u> When designing a custom component that includes a clickable icon in a Lookup field, the alt text should be concise, descriptive, and meaningful. The alt text should convey the purpose and action of the icon, rather than its appearance or format. Therefore, the best option for the alt text of the icon is “Search button”, as it describes what the icon does and how the user can interact with it. The other options are not suitable for the alt text, as they either include unnecessary words, such as “image of” or “photo of”, or omit important information, such as “button”. For example, the option “Image of a search button” is redundant, as the screen reader will already announce that the element is an image. The option “Search” is incomplete, as it does not indicate that the element is a button that can be clicked. The option “Image of a magnifying glass” is irrelevant, as it describes the appearance of the icon, rather than its function. <u>Reference: Everything you need to know to write efectve alt text and Write helpful Alt Text to describe images</u>"
  },
  {
    "id": 107,
    "category": "Declarative Design",
    "question": "A UX Designer wants touse Paths to provide guidance about which activities sales representatives should be doing at each stage of the opportunity lifecycle. Which two elements could be used in the Path's Guidance for Success sections?",
    "choices": [
      "Lightning Component",
      "Images and Links",
      "Progress Indicator",
      "Rich Text **"
    ],
    "correctAnswerText": [
      "Images and Links",
      "Rich Text **"
    ],
    "explanation": "The Path’s Guidance for Success sections can include the following two elements: Images and Links: Images and links can be used to provide visual cues and additional resources for the sales representatives. For example, an image of a checklist or a link to a best practice document can help the reps complete the required tasks at each stage. Images and links can be added using the rich text editor in the Path Settings page. Rich Text: Rich text can be used to provide text-based guidance, such as tips, reminders, instructions, or motivational messages. For example, a rich text guidance can tell the reps what information they need to gather from the customer or what actions they need to take to move the opportunity forward. Rich text can be formatted using the rich text editor in the Path Settings page. Reference: <u>: Set Up a Path : Consideratons and Guidelines for Creatng Paths : Optmize Sales Processes with Path in Salesforce</u> The two elements that can be used in the Path's Guidance for Success section are Images and Links and Rich Text. Images and Links can be used to provide visual elements to the Guidance for Success section, while Rich Text can be used to provide text-based explanations and instructions. In addition, a Progress Indicator can be used to show the user's progress through the Path. Images and Links can be used to provide visual elements to the Guidance for Success section. For example, if the user needs to read an article, a link to the article can be included, as well as an image of the article cover. Similarly, if the user needs to view a video, a link to the video and an image of the video can be included. Rich Text can be used to provide text-based explanations and instructions. This can include explanations of what the user should be doing at each stage of the Path, as well as any other helpful information. Finally, a Progress Indicator can be used to show the user's progress through the Path. This can help the user understand where they are in the Path and how far they have left to go. Reference: [1] https://help.salesforce.com/articleView?id=path_guidance.htm&type=5 [2] https://help.salesforc e.com/articleView?id=path_customize_guidance_success.htm&type=5 [3] https://help.salesforce.co m/articleView?id=path_use_guidance_success.htm&type=5"
  },
  {
    "id": 108,
    "category": "UX Fundamentals",
    "question": "Cloud kicks research team provides its UX Designer with a readout stating the audience for the design solution has a high number of visually impaired people. How should the design be approached?",
    "choices": [
      "Ensure all text is black to maximize readability.",
      "Optimize for color contrast-ratio and screen-reading technology.",
      "Ensure Health Insurance Portability and Accountability Act (HIPAA) standards and guidelines are followed.",
      "Design a mobile-responsive solution to be used with Mobile Publisher."
    ],
    "correctAnswerText": "Optimize for color contrast-ratio and screen-reading technology.",
    "explanation": "<u>The design should be optmized for color contrast-rato and screen-reading technology, as these are the best practces for designing for visually impaired people12. Color contrast-rato is the diference in brightness and color between the foreground and the background of a text or an image3. A high color contrast-rato makes the text or the image more visible and readable for people with low vision or color blindness4. Screen-reading technology is a sofware that converts text and images on a</u> screen into speech or braille output for people who are blind or have severe vision loss. A design that is compatible with screen-reading technology ensures that the content and functionality of the - <u>product are accessible and understandable for these users. Reference: Accessibility Standards Salesforce Help, How to Confgure Salesforce for your Blind and Low Vision Users - Salesforce Admins, Color Contrast Rato - WebAIM, Color Contrast Checker - WebAIM, [Screen Readers -</u> WebAIM], [Screen Reader User Survey #8 Results - WebAIM] The correct answer is B. When designing for a visually impaired audience, it is important to optimize for color contrast-ratio and screen-reading technology. This will ensure that the design is accessible to those with visual impairments. Color contrast-ratio ensures that the text is easily readable, while screen-reading technology allows people with visual impairments to access the content on the website using a screen reader. Additionally, Salesforce has some great resources on designing for accessibility, such as their Accessibility Design Guide [1] and their Accessibility Best Practices [2]. [1] https://www.salesforce.com/content/dam/web/en_us/www/documents/salesforce-accessibilitydesign-guide.pdf [2] https://developer.salesforce.com/docs/atlas.en- us.salesforce_accessibility_best_practices.meta/salesforce_accessibility_best_practices/accessibility _best_practices_intro.htm"
  },
  {
    "id": 109,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks wants to create a site for its customers to manage events regardless of the device they are using. Which best practice should be used to provide this experience?",
    "choices": [
      "Create a responsive user interface.",
      "Develop a separate native mobile app for Android and iOS. #####",
      "Launch two different interfaces from the same page."
    ],
    "correctAnswerText": "Create a responsive user interface.",
    "explanation": "A responsive user interface is a type of user interface that adapts to different screen sizes, resolutions, orientations, and devices, such as desktops, laptops, tablets, and smartphones. It uses flexible layouts, grids, images, and media queries to optimize the user experience and ensure usability, accessibility, and performance across different devices. A responsive user interface can help Cloud Kicks create a site for its customers to manage events regardless of the device they are using, as it can provide a consistent and seamless experience that meets the user needs and expectations. A responsive user interface can also reduce the development and maintenance costs and efforts, as it can use the same code base and content for different devices, rather than creating separate versions for each device. Reference: : User Experience Designer Certification Prep: Module 5: Design User Interfaces : User Experience Designer Certification Prep: Module 7: Implement User Interfaces : What is Responsive Web Design? To create a site for its customers to manage events regardless of the device they are using, Cloud Kicks should use the best practice of creating a responsive user interface. A responsive user interface is one that adapts to the screen size and orientation of the device, providing an optimal viewing and interaction experience for the user. A responsive user interface can use the same code base and content for different devices, reducing the development and maintenance costs and ensuring consistency and accessibility. A responsive user interface can also leverage the features and capabilities of the device, such as touch, gestures, camera, etc., to enhance the user experience. Reference: : Responsive User Interface"
  },
  {
    "id": 110,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Which part of the Salesforce Lightning Design System (SLDS) should be used to create visual consistency with regard to alignments, grids, spacing, and typography'",
    "choices": [
      "Component Blueprints",
      "BEM Naming Classes",
      "Utility Classes"
    ],
    "correctAnswerText": "Utility Classes",
    "explanation": "To create visual consistency with regard to alignments, grids, spacing, and typography, the part of the Salesforce Lightning Design System (SLDS) that should be used is utility classes. Utility classes are CSS classes that provide common styling properties, such as margins, paddings, borders, colors, fonts, and text alignments. Utility classes can be applied to any HTML element to quickly and easily adjust its appearance and layout. Utility classes follow the BEM (Block Element Modifier) naming convention, which makes them easy to read and understand. Utility classes can help the designer to create visual consistency across the Lightning components and pages, without writing custom CSS or overriding the component blueprints. Reference: : Utility Classes | Lightning Design System : UX Designer Certification Prep: Designing with Lightning Design System | Trailhead"
  },
  {
    "id": 111,
    "category": "Testing",
    "question": "A UX Designer has completed usability testing on a newly designed case management system and has gathered many observations from the test participants. What should the UX Designer consider while presenting the findings?",
    "choices": [
      "Be specific about the issues testers encountered.",
      "Report only the new issues, and omit already known bugs.",
      "Include the names of participants in the report."
    ],
    "correctAnswerText": "Be specific about the issues testers encountered.",
    "explanation": ": A usability testing report is a document that summarizes the findings and insights from a usability test, which is a method of evaluating a product or service by observing how real users interact with <u>it. A usability testng report should provide clear and actonable recommendatons for improving the user experience and usability of the product or service1. One of the best practces for presentng the</u> findings of a usability testing report is to be specific about the issues testers encountered. This means describing the problems in detail, explaining how they affected the user’s performance and satisfaction, and providing evidence from the data collected, such as quotes, screenshots, videos, or <u>metrics. Being specifc about the issues helps to illustrate the severity and impact of the problems, as well as to justfy the need for improvement2.</u> The other two options, reporting only the new issues and omitting already known bugs, and including the names of participants in the report, are not good practices for presenting the findings of a usability testing report. Reporting only the new issues and omitting already known bugs can create a biased and incomplete picture of the usability test results, as it can overlook the recurring and persistent problems that may still affect the user experience and usability of the product or <u>service. Including the names of partcipants in the report can violate the ethical and legal principles of user research, such as confdentality, anonymity, and informed consent, which require protectng the privacy and identty of the users who partcipate in the research3. Reference: How to Write a Usability Testng Report (With Templates and Examples) - Xtensio, How to Report Usability Test Results for Maximum Impact | Maze, Ethical Consideratons in User Research and Testng | Interacton Design Foundaton (IxDF)</u>"
  },
  {
    "id": 112,
    "category": "Discovery",
    "question": "A UX Designer is asked to build a solution in Salesforce to accommodate a call center's process and make it easier for them to log complaints. How should the designer illustrate the existing process, including the pain points and opportunities?",
    "choices": [
      "Observe the complaints process and create a business process diagram.",
      "Observe the complaints process and create a journey map.",
      "Observe the complaints process and create a prototype."
    ],
    "correctAnswerText": "Observe the complaints process and create a journey map.",
    "explanation": "The best way for the designer to illustrate the existing process, including the pain points and opportunities, is to observe the complaints process and create a journey map. A journey map is a visual representation of the customer’s or user’s experience with a product or service, from their perspective. It shows the steps, interactions, thoughts, feelings, touchpoints, context, and opportunities for improvement along the way. A journey map can help the designer to understand the current state of the complaints process, identify the pain points and gaps, and prioritize the areas for intervention. A journey map can also help to communicate the user’s needs and expectations to the stakeholders and developers, and align them on a common vision for the solution. Reference: <u>: Start Your Journey Map Unit | Salesforce Trailhead : Add Journey Mapping to Your Soluton Toolbox Unit | Salesforce Trailhead</u> <u>: Customer Journey Mapping Resources - Salesforce</u>"
  },
  {
    "id": 113,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks (CK) wants gamified learning content for its internal users and leadership. CK wants to create a custom product training as a part of the experience. What should be recommended?",
    "choices": [
      "In-app prompts to provide access to video content",
      "Sandbox to experiment with the product",
      "Enablement Site to build and assign custom modules"
    ],
    "correctAnswerText": "Enablement Site to build and assign custom modules",
    "explanation": "An Enablement Site is a custom-branded site that allows users to access learning content, such as modules, trails, and trailmixes, from Trailhead. It also allows admins to create and assign custom modules that are specific to their organization’s needs and goals. An Enablement Site can be used to gamify the learning experience by adding badges, points, and leaderboards. An Enablement Site can also provide analytics and reports on the learners’ progress and performance. Therefore, an Enablement Site is the best option for Cloud Kicks to create a gamified learning content for its internal users and leadership, as well as a custom product training. Reference: [Trailhead: Enablement Site Basics] [Trailhead: Create Custom Modules for Your Enablement Site] [Trailhead: Gamify Your Enablement Site]"
  },
  {
    "id": 114,
    "category": "Testing",
    "question": "What is a goal of usability testing?",
    "choices": [
      "Showing users how to use the design in the right way",
      "A Learning about the user's behavior and preferences",
      "Identifying the best variation of a page"
    ],
    "correctAnswerText": "A Learning about the user's behavior and preferences",
    "explanation": "Usability testing is a method of evaluating how easy and intuitive a product or service is to use by observing real users performing specific tasks. It can help identify usability issues, user needs, and user satisfaction. A goal of usability testing is to learn about the user’s behavior and preferences, such as how they interact with the design, what they expect from the design, what they like or dislike about the design, and what they find confusing or frustrating about the design. By learning about the user’s behavior and preferences, the UX designer can gain insights and feedback that can help improve the design and enhance the user experience. Reference: : User Experience Designer Certification Prep: Module 6: Validate User Interfaces : What is Usability Testing?"
  },
  {
    "id": 115,
    "category": "Testing",
    "question": "A UX Designer is evaluating whether to perform a moderated or unmoderated usability study on their prototype solution to gain user feedback. Which reason would lead the designer to choose a moderated study?",
    "choices": [
      "Follow-up questions can be asked to obtain further information about the issues participants may encounter.",
      "Sessions can be completed at any time and anywhere.",
      "It is less expensive and time-consuming to conduct."
    ],
    "correctAnswerText": "Follow-up questions can be asked to obtain further information about the issues participants may encounter.",
    "explanation": "A moderated usability study is a type of user research where the UX Designer interacts with the participants as they perform tasks on the prototype solution. The designer can ask follow-up questions to obtain further information about the issues participants may encounter, such as why they made certain choices, how they felt about the experience, and what they would like to see improved. This can help the designer gain deeper insights into the user needs, preferences, and pain points, as well as validate or invalidate their design assumptions. A moderated study also allows the designer to clarify any confusion or ambiguity that the participants may have during the session, and to adjust the tasks or scenarios as needed. Reference: [User Experience Designer Certification Prep: Conduct User Research] [User Experience Designer Certification Prep: Analyze User Research] [User Experience Designer Certification Prep: Validate Solutions]"
  },
  {
    "id": 116,
    "category": "Declarative Design",
    "question": "Cloud Kicks has updated its logo and wants it prominently displayed on its Digital Experience site. Where does their UX Designer need to code to update the logo?",
    "choices": [
      "Visualforce pages",
      "Page headers",
      "Email templates"
    ],
    "correctAnswerText": "Page headers",
    "explanation": "A page header is a component that appears at the top of every page on a Digital Experience site, and usually contains the site logo, the site name, the navigation menu, and other elements that provide a <u>consistent and recognizable look and feel for the site. A UX Designer can code the page header to update the logo for Cloud Kicks by using the Experience Builder or the Developer Console1. The</u> Experience Builder is a point-and-click tool that allows creating and customizing the page header <u>using predefned templates, themes, and components. The Developer Console is a code editor that allows creatng and editng the page header using HTML, CSS, JavaScript, and Lightning components2. Both tools provide the opton to upload and insert the new logo image fle into the</u> page header, and to adjust its size, position, and alignment. The other two options, Visualforce pages and email templates, are not the places where the UX <u>Designer needs to code to update the logo for Cloud Kicks. Visualforce pages are web pages that can be used to create custom user interfaces for Digital Experience sites, but they do not afect the page header, which is a separate component that can be added to any page3. Email templates are</u> predefined layouts and content that can be used to send emails to the site users, but they do not have any impact on the site appearance or functionality. <u>Reference: Create a Custom Header for Your Site | Salesforce Trailhead and Customize Your Site Header and Footer | Salesforce Trailhead</u>"
  },
  {
    "id": 117,
    "category": "Declarative Design",
    "question": "Cloud Kicks wants to use Paths for onboarding its sales representatives. Which Path feature should be used to add onboarding value?",
    "choices": [
      "Integrated buttons to automate approvals",
      "Actions and recommendations component",
      "A Key fields to complete before next Path stage"
    ],
    "correctAnswerText": "A Key fields to complete before next Path stage",
    "explanation": "The Path feature that should be used to add onboarding value for the sales representatives is the Key fields component. The Key fields component allows the admin to specify up to five fields that are important or required for each stage of the Path. The sales reps can see and edit these fields directly from the Path, without scrolling through the record page. This helps to guide the reps on what information they need to gather or update at each stage, and ensures data quality and completeness. The Key fields component can also be used to enforce validation rules or required fields, by preventing the reps from moving to the next stage until they fill out the necessary fields. Reference: <u>: Set Up a Path : Consideratons and Guidelines for Creatng Paths : Optmize Sales Processes with Path in Salesforce</u>"
  },
  {
    "id": 118,
    "category": "UX Fundamentals",
    "question": "A UX Designer is customizing the look and feel of a site using Experience Builder and needs to choose a color for the text and the background of the buttons. Which accessibility guideline should be considered?",
    "choices": [
      "Adaptable",
      "Distinguishable",
      "Navigable"
    ],
    "correctAnswerText": "Distinguishable",
    "explanation": "The accessibility guideline of distinguishable means that the information and user interface components must be presented to users in ways that are perceptible. This includes using sufficient contrast between text and background colors, providing text alternatives for non-text content, and making it easier for users to see and hear content. When choosing a color for the text and the background of the buttons, the UX Designer should consider the contrast ratio between them, which should be at least 4.5:1 for normal text and 3:1 for large text. This will ensure that the buttons are visible and readable for users with different visual abilities. Reference: [1]: Web Content Accessibility Guidelines (WCAG) 2.1, Principle 1: Perceivable [2]: Web Content Accessibility Guidelines (WCAG) 2.1, Success Criterion 1.4.3 Contrast (Minimum)"
  },
  {
    "id": 119,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer is working on a series of custom Salesforce components for a new website. In which way could the designer accelerate the visual design process?",
    "choices": [
      "Use separate stylesheets to make implementation easier.",
      "Build a custom layout in Salesforce and export the underlying code.",
      "A Leverage the Salesforce Lightning Design System (SLDS) using UI kits or plugins."
    ],
    "correctAnswerText": "A Leverage the Salesforce Lightning Design System (SLDS) using UI kits or plugins.",
    "explanation": "The Salesforce Lightning Design System (SLDS) is a collection of design guidelines, components, and resources that enable developers and designers to build consistent, high-quality, and responsive user interfaces across the Salesforce platform. The SLDS provides UI kits and plugins for popular design and prototyping tools, such as Sketch, Adobe XD, and Figma, that allow designers to quickly create mockups and wireframes using the SLDS components and styles. By leveraging the SLDS, the designer can accelerate the visual design process and ensure alignment with the Salesforce brand and best practices. Reference: [Salesforce Lightning Design System] [UI Kits and Plugins] [UX Designer Certification Prep: Visual Design]"
  },
  {
    "id": 120,
    "category": "Testing",
    "question": "A UX Designer is attending a sprint planning session as part of their team's Agile ceremonies. Which methodology could the designer be asked to use to roughly estimate the work required for each item?",
    "choices": [
      "Sprint Backlogging",
      "Prioritization Matrix",
      "T-shirt Sizing"
    ],
    "correctAnswerText": "T-shirt Sizing",
    "explanation": "The conceptual approach of desirable, feasible, and viable describes how to evaluate design solutions based on three criteria: Desirable: The solution meets the needs and wants of the users and stakeholders. Feasible: The solution can be implemented with the available resources and technology. Viable: The solution can generate value and sustain itself in the market and environment. By incorporating human-centered design, CK is aiming to create design solutions that are desirable for its Sales team and customers, feasible with the Salesforce platform and tools, and viable for its business goals and strategy. Reference: [1]: UX Designer Certification Prep: Design Thinking, Unit 3: Ideate [2]: UX Designer Certification Prep: Design Thinking, Unit 4: Prototype and Test T-shirt sizing is a methodology that can be used to roughly estimate the work required for each item in a sprint backlog. It involves assigning a size category (such as XS, S, M, L, XL) to each item based on its complexity, effort, and uncertainty. T-shirt sizing is a relative estimation technique that allows the team to compare items and prioritize them accordingly. It is also a quick and easy way to get a highlevel overview of the scope of work without getting into too much detail. Reference: [UX Designer Certification Prep: Agile UX] [Agile Estimation Techniques: A True Estimation in an Agile Project]"
  },
  {
    "id": 121,
    "category": "Human-Centered Design",
    "question": "Cloud Kicks (CK) has made a commitment to incorporating human-centered design and is now collaborating with its Sales team to redesign some of its key sales processes in Salesforce. Which conceptual approach would describe CK's new design solutions?",
    "choices": [
      "V2MOM",
      "Agile",
      "Desirable, Feasible, Viable **"
    ],
    "correctAnswerText": "Desirable, Feasible, Viable **",
    "explanation": "Cloud Kicks’ new design solutions would be described by the conceptual approach of desirable, feasible, and viable. This approach is based on the human-centered design (HCD) methodology, which aims to create solutions that meet the needs, preferences, and expectations of the users or customers, while also being technically possible and economically sustainable. HCD is a creative problem-solving process that starts with identifying the user’s problems and ends with creating solutions that address them. The desirable, feasible, and viable framework helps designers evaluate their solutions according to these three criteria: Desirable: A solution that people want or need, that solves a real problem for them, and that provides a meaningful and relevant experience. Feasible: A solution that can be created with new or existing technology, that is within the scope and capabilities of the organization, and that can be tested and validated. Viable: A solution that fits the organization’s business model, that generates value for the stakeholders, and that is sustainable in the long term. By applying this framework, Cloud Kicks can ensure that its new design solutions for its sales processes in Salesforce are not only user-friendly, but also technically sound and profitable. This can help Cloud Kicks achieve its business goals, while also delivering more satisfying and delightful customer experiences. Reference: - <u>Explore Human Centered Design IDEO’s Desirability, Viability, Feasibility Framework: A Practcal Guide</u>"
  },
  {
    "id": 122,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks (CK) is going mobile and wants to ensure its Salesforce app aligns with company branding. Which element could be customized in the Salesforce app to match CK's branding?",
    "choices": [
      "Search bar layout and loading page background",
      "Background image and focus link color",
      "Brand color and loading page logo"
    ],
    "correctAnswerText": "Brand color and loading page logo",
    "explanation": "The Salesforce app allows administrators to customize the brand color and the loading page logo to match the company’s branding. The brand color affects the key user interface elements such as the header, buttons, and search bar. The loading page logo is the image that appears after a mobile user logs in. These elements can be customized from Setup by entering Salesforce Branding in the Quick Find box, then selecting Salesforce Branding. The other elements, such as the search bar layout, the background image, and the focus link color, are not customizable in the Salesforce app. Reference: <u>Customize Salesforce Mobile App Branding How Salesforce App Branding Works</u>"
  },
  {
    "id": 123,
    "category": "Testing",
    "question": "Cloud Kicks (CK) has hired a UX Designer to help with the design of its Experience Cloud site. CK wants to understand the structure and layout of the navigation menu. Which activity should the designer use while card sorting?",
    "choices": [
      "Compare two versions of the navigation menu mockups to see which performs better.",
      "Have users sort the cards based on similar categories or groups.",
      "Arrange pages in the navigation menu by alphabetical order."
    ],
    "correctAnswerText": "Have users sort the cards based on similar categories or groups.",
    "explanation": "Card sorting is a UX research method used to discover how people understand and categorize information. In a card sort, participants group ideas or information written on cards into different categories in a way that makes sense to them. The designer can use virtual cards, pieces of paper, or an online card sorting tool. Card sorting can help the designer to: Assess the information architecture (IA) of a website or homepage Learn how people understand different concepts or ideas, and how they feel about them Understand where users expect certain content to be found Get inspiration for labeling and grouping content or ideas In this case, the designer wants to understand the structure and layout of the navigation menu for the Experience Cloud site. The designer can use card sorting to learn how users would group and label the pages or features of the site, and what categories or subcategories they would expect to see in the navigation menu. This can help the designer to create a user-friendly and intuitive IA that matches the users’ mental models and expectations. To conduct a card sorting activity, the designer should: Define the goal and scope of the card sort Choose the type of card sort (open, closed, or hybrid) Choose the format of the card sort (moderated or unmoderated) Select the cards and categories to use Recruit and screen the participants Run the card sort sessions Analyze and interpret the results Apply the findings to the design The correct answer is B, have users sort the cards based on similar categories or groups. This is the main task of a card sorting activity, where users are asked to group the cards (representing the pages or features of the site) into categories or groups that make sense to them. The designer can then analyze the results to see how users organize and label the information, and use that to inform the design of the navigation menu."
  },
  {
    "id": 124,
    "category": "UX Fundamentals",
    "question": "What are the foundational principles from the Web Content Accessibility Guidelines (WCAG)?",
    "choices": [
      "Perceivable, operable, understandable, robust",
      "Useful, effective, efficient, reliable",
      "Desirable, feasible, viable, affordable"
    ],
    "correctAnswerText": "Perceivable, operable, understandable, robust",
    "explanation": "The Web Content Accessibility Guidelines (WCAG) are a set of standards that aim to make web content more accessible to people with disabilities. The WCAG are organized by four principles, which state that content must be: Perceivable: Users must be able to perceive the information and user interface components in ways they can sense, such as through sight, hearing, or touch. Operable: Users must be able to interact with the user interface components and navigate the content using various input methods, such as keyboard, mouse, voice, or gesture. Understandable: Users must be able to comprehend the information and the operation of the user interface, which means that the content must be clear, consistent, and predictable. Robust: Users must be able to access the content using a wide range of technologies, including different browsers, devices, and assistive tools, which means that the content must be compatible <u>with current and future web standards. Reference: WCAG 2 Overview, Understanding the Web Content Accessibility Guidelines</u>"
  },
  {
    "id": 125,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks (CK) is implementing its brand style guide using out-of-the box Experience Builder features. CK wants to avoid custom solutions. Which declarative option could be used?",
    "choices": [
      "A Apply brand fonts and colors.",
      "Use a different template.",
      "Update global CSS."
    ],
    "correctAnswerText": "A Apply brand fonts and colors.",
    "explanation": "To implement a brand style guide using out-of-the box Experience Builder features, the best option is to apply brand fonts and colors. This can be done by using themes and branding sets in Experience Builder. Themes are collections of information that define the visual flow of a site, such as colors, fonts, and spacing. Branding sets are groups of assets that can be applied to a theme, such as logos, images, and icons. By using themes and branding sets, CK can customize the look and feel of their <u>site without coding or using a diferent template. Reference: Add Style to Your Experience Builder Site with Themes, Use Branding Sets in Experience Builder</u>"
  },
  {
    "id": 126,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Design team is doing a review of a new Lightning Web Component (IWC). They are following the Salesforce Lightning Design System (SLDS) block, element, modifier (BEM) naming conventions. Which class does NOT follow this convention?",
    "choices": [
      ".slds-avatar_circle",
      ".slds-box",
      ".slds--size-l-of-2"
    ],
    "correctAnswerText": ".slds--size-l-of-2",
    "explanation": "The SLDS BEM naming convention consists of three parts: block, element, and modifier. A block is a standalone component that can be reused across projects, such as a button, a card, or a modal. An element is a part of a block that has no standalone meaning, such as a label, an icon, or a header. A modifier is a flag that changes the appearance or behavior of a block or an element, such as size, color, or state. The modifier is separated from the block or element by two hyphens (–), and can have a value separated by a single hyphen (-), such as .slds-button–brand or .slds-button–neutral. The class .slds–size-l-of-2 does not follow this convention because it has no block or element name before the modifier. It should be something like .slds-grid–size-l-of-2 or .slds-col–size-l-of2. Reference: [1]: Salesforce Lightning Design System - Introduction [2]: Salesforce Lightning Design System - Naming Con"
  },
  {
    "id": 127,
    "category": "Discovery",
    "question": "A UX Designer interviews a user who spends most of their time moderating forums, enforcing community standards, and providing member support. Which Salesforce persona does this user align with?",
    "choices": [
      "Site Admin",
      "Community Manager",
      "Support Manager"
    ],
    "correctAnswerText": "Community Manager",
    "explanation": "A Community Manager is a Salesforce persona who is responsible for creating, managing, and moderating online communities that connect customers, partners, and employees. They spend most of their time engaging with community members, enforcing community standards, and providing member support. A Community Manager aligns with the user who performs similar tasks in moderating forums. Reference: : Salesforce Personas : Community Manager Roles and Responsibilities"
  },
  {
    "id": 128,
    "category": "Declarative Design",
    "question": "Cloud Kicks wants to prevent its sales agents from being able to save a new account unless they have entered the phone number in the correct format and with the correct number of digits. A validation rule would then prevent the new account from saving. Which method should be used to improve the user experience in the simplest way while preventing errors?",
    "choices": [
      "Set a prompt to display on the page using In-App Guidance.",
      "Set field-level error message to display on the page.",
      "Mark the field as Required."
    ],
    "correctAnswerText": "Set field-level error message to display on the page.",
    "explanation": "A field-level error message is a message that appears next to a specific field when the user enters invalid data or omits required data. It helps the user to correct the error and proceed with the action. A field-level error message is more user-friendly than a validation rule, which displays a generic message at the top of the page and prevents the user from saving the record. A field-level error message can also provide guidance on the correct format and number of digits for the phone number field. Marking the field as required would not ensure that the user enters the phone number in the correct format and with the correct number of digits. Setting a prompt to display on the page using In-App Guidance would not prevent the user from entering invalid data or omitting required data. Reference: [Field-Level Error Messages], [Validation Rules], [In-App Guidance]"
  },
  {
    "id": 129,
    "category": "Declarative Design",
    "question": "A UX Designer is creating a one-to-many or many-to-one relationship between two objects. Which kind of relationship should the designer use to link the two objects?",
    "choices": [
      "Master-Detail",
      "Hierarchical",
      "Lookup"
    ],
    "correctAnswerText": "Lookup",
    "explanation": ": A lookup relationship is a type of relationship that links two objects together, but the relationship is not required. This means that the child object can exist independently of the parent object. A lookup relationship can be either one-to-many or many-to-one, depending on the cardinality of the objects involved. For example, a contact can have a lookup relationship to an account, which means that a contact can belong to one account, but an account can have many contacts. Alternatively, a custom object can have a lookup relationship to a user, which means that a custom object can belong to <u>many users, but a user can have only one custom object record. Reference: Trailhead: Data Modeling, Trailhead: Salesforce User Experience Designer Certfcaton Prep, Salesforce Help: Defne Lookup Relatonships</u>"
  },
  {
    "id": 130,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks (CK) wants to build a custom component for a complex opportunity process. CK's UX Designer is creating a three-step flow with modals and needs to select the main buttons for the \"Continue\", \"Cancel\", and \"Back\" actions. Which set should be chosen to adhere to the Salesforce Design System guidelines for button usage?",
    "choices": [
      "Brand button for \"Cancel\" and \"Continue\"; Neutral button for 'Back\"",
      "A Neutral button for \"Cancel\" and \"Back\"; Brand button for \"Continue\"",
      "Brand button for \"Continue\", \"Cancel\", and \"Back\""
    ],
    "correctAnswerText": "A Neutral button for \"Cancel\" and \"Back\"; Brand button for \"Continue\"",
    "explanation": "According to the Salesforce Design System guidelines for button usage, the brand button should be used for the primary action on a page or modal, such as “Save” or “Continue”. The neutral button should be used for secondary or tertiary actions, such as “Cancel” or “Back”. The brand button should have more visual weight and contrast than the neutral button, to indicate its importance and guide the user’s attention. Therefore, the best option for the Cloud Kicks custom component is to use a <u>brand buton for “Contnue” and neutral butons for “Cancel” and “Back”. Reference: Trailhead: Systems Design with SLDS, Salesforce Developers: Butons, Lightning Design System: Butons</u>"
  },
  {
    "id": 131,
    "category": "Testing",
    "question": "A UX Designer wants to remotely collect feedback from hundreds of users on tasks or activities that do not require much imagination or emotion. Which testing approach should be used?",
    "choices": [
      "Online surveys",
      "Usability study",
      "A/B Testing"
    ],
    "correctAnswerText": "Online surveys",
    "explanation": "Online surveys are a testing approach that allows a UX Designer to remotely collect feedback from hundreds of users on tasks or activities that do not require much imagination or emotion. Online surveys are useful for gathering quantitative data, such as ratings, rankings, preferences, and satisfaction levels. Online surveys are also relatively easy and inexpensive to administer and analyze. Usability studies and A/B testing are testing approaches that require more interaction and observation from the UX Designer and the users, and are more suitable for tasks or activities that involve more complexity, creativity, or emotion. Reference: [Online Surveys], [Usability Studies], [A/B Testing]"
  },
  {
    "id": 132,
    "category": "Declarative Design",
    "question": "A UX Designer is tasked with ensuring Lightning App Builder apps are mobile-friendly, including interactive elements. What should be the minimum touch screen target size for interactive elements on mobile devices? #####",
    "choices": [
      "24 pixels wide x 24 pixels tall",
      "44 pixels wide x 44 pixels tall",
      "64 pixels wide x 64 pixels tall"
    ],
    "correctAnswerText": "44 pixels wide x 44 pixels tall",
    "explanation": "According to the Salesforce Lightning Design System, the minimum touch screen target size for interactive elements on mobile devices is 44 pixels wide x 44 pixels tall. This size ensures that users can easily tap the elements without accidentally hitting the wrong ones or missing them entirely. The touch target size also takes into account the average finger size and the device resolution. Smaller touch targets may cause frustration and errors for users, especially those with low vision, motor impairments, or large fingers. Reference: : Salesforce Lightning Design System - Sizing : Salesforce Lightning Design System - Accessibility"
  },
  {
    "id": 133,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks is launching a new Salesforce org and wants to test its levels of accessibility, including keyboard navigation. Which detail could be verified by testing keyboard navigation for accessibility?",
    "choices": [
      "Tabbing order is logical.",
      "Keyboard actions provide audio feedback.",
      "Actionable items are highlighted in a specific color."
    ],
    "correctAnswerText": "Tabbing order is logical.",
    "explanation": "Keyboard navigation is a way of interacting with a web application using only the keyboard, without a mouse or a touch screen. Keyboard navigation is essential for users who have visual impairments, motor disabilities, or other accessibility needs. Keyboard navigation also benefits users who prefer to use the keyboard for efficiency or convenience. One of the aspects of keyboard navigation that can be tested for accessibility is the tabbing order, which is the order in which elements on a page receive focus when the user presses the Tab key. The tabbing order should be logical, meaning that it follows the natural reading order of the page and the expected user workflow. A logical tabbing order helps users navigate the page easily and intuitively, without skipping or repeating elements. A logical tabbing order also helps screen readers announce the elements in a meaningful sequence. Therefore, testing the tabbing order for logic is a way of verifying keyboard navigation for accessibility. The other options are not related to keyboard navigation. Keyboard actions do not provide audio feedback by default, although some screen readers may have this feature. Actionable items are not highlighted in a specific color, although they may have a visible focus indicator, such as a border or an outline, to show which element has focus. The color of the focus indicator is not a factor for keyboard navigation, as long as it is distinguishable from the <u>background. Reference: Keyboard Shortcuts, Use Lightning Experience with a Screen Reader, Accessibility in LWR Sites</u>"
  },
  {
    "id": 134,
    "category": "Human-Centered Design",
    "question": "Cloud Kicks is making inclusive design a priority for its communities and customers. What are the three inclusive design action-oriented principles?",
    "choices": [
      "Recognize imperfection. Learn from diversity. One size fits one.",
      "Recognize exclusion. Learn from diversity. Solve for one, extend to many.",
      "Recognize diversity. Learn from experts. Focus on one person."
    ],
    "correctAnswerText": "Recognize exclusion. Learn from diversity. Solve for one, extend to many.",
    "explanation": "##### The three inclusive design action-oriented principles are: Recognize exclusion: Identify and understand the barriers that prevent people from accessing or using a product or experience. Exclusion can be caused by ability, context, or personal factors. Learn from diversity: Seek out and learn from the perspectives of people who have a range of experiences, backgrounds, and identities. Diversity can be a source of inspiration and innovation. Solve for one, extend to many: Design solutions that address the needs of a specific person or group, and then generalize them to benefit a wider audience. Solving for one can reveal hidden <u>opportunites and create more inclusive outcomes. Reference: Explore Inclusive Design, Inclusive Design</u>"
  },
  {
    "id": 135,
    "category": "Testing",
    "question": "A UX Designer at Cloud Kicks wants to utilize a design thinking approach for the design of new customer services. Which approach combination encourages more creative problem-solving?",
    "choices": [
      "Divergent and convergent",
      "Agile and efficient",
      "Simple and innovative"
    ],
    "correctAnswerText": "Divergent and convergent",
    "explanation": "A design thinking approach is a human-centered method for solving complex problems and creating innovative solutions. It involves understanding the needs and desires of the users, generating and testing multiple ideas, and iterating on the feedback and results. A design thinking approach can be divided into two types of thinking: divergent and convergent. Divergent thinking is the process of generating many possible solutions to a problem without judging or filtering them. It encourages creativity, exploration, and experimentation. Convergent thinking is the process of evaluating, selecting, and refining the best solution to a problem. It involves analysis, logic, and criteria. Divergent and convergent thinking are complementary and cyclical. They help the designer to expand the solution space and then narrow it down to the most feasible and desirable option. By using both types of thinking, the designer can encourage more creative problem-solving and avoid premature convergence or fixation on a single idea. Therefore, the best approach combination for <u>the UX Designer at Cloud Kicks is divergent and convergent thinking. Reference: Trailhead: Design Thinking, Trailhead: Salesforce User Experience Designer Certfcaton Prep, Divergent and Convergent Design Thinking</u>"
  },
  {
    "id": 136,
    "category": "Declarative Design",
    "question": "Cloud Kicks wants to improve its Salesforce org to provide tailored functionality that enables sales representatives to provide quick, competitive pricing and close deals faster. What is the benefit of Lightning Console Apps in this scenario for the sales representatives?",
    "choices": [
      "They can organize items in the utility bar.",
      "They can add records to Favorites.",
      "They can complete actions with a single click."
    ],
    "correctAnswerText": "They can complete actions with a single click.",
    "explanation": "Lightning console apps are designed to help users work faster and more efficiently by providing a workspace where they can access multiple records and their related records on the same screen. Users can complete actions with a single click, such as creating records, logging calls, sending emails, and updating fields, without losing context or switching tabs. Lightning console apps also support keyboard shortcuts, macros, and quick text to speed up common tasks. Lightning console apps are especially useful for sales representatives who need to provide quick, competitive pricing and close deals faster. They can also use Lightning console apps to view and manage their pipeline, collaborate with team members, and track their performance. Organizing items in the utility bar and adding records to Favorites are features that are available in any Lightning app, not just Lightning console <u>apps. Reference: Salesforce Console in Lightning Experience, Create and Edit a Custom Lightning Console App, Create a Lightning Console App</u>"
  },
  {
    "id": 137,
    "category": "Declarative Design",
    "question": "Cloud Kicks is considering whether it should implement the Standard Salesforce Navigation or use the Console for its Sales team. What is one requirement that could lead to recommending the Console?",
    "choices": [
      "Need for viewing multiple list views at the same time",
      "Ability to toggle between multiple records",
      "Work that is mostly in the field"
    ],
    "correctAnswerText": "Ability to toggle between multiple records",
    "explanation": "The Console is a tab-based workspace that allows users to access multiple records and related information on a single screen. This can help users who need to switch between different records quickly and easily, without losing context or wasting time. For example, a salesperson who needs to compare different opportunities, check account details, or update contact information can benefit from using the Console. The Standard Salesforce Navigation, on the other hand, only allows users to <u>open one record at a tme, which can be limitng for some use cases. Reference: : Salesforce Console : Explore the Service Console</u>"
  },
  {
    "id": 138,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer wants to adopt scalability and consistency by no longer hard-coding values in designs, such as hex values for colors and pixel values for spacing. What should be used or created to leverage named entities that apply design attributes to components and applications?",
    "choices": [
      "Utility Classes",
      "Design Tokens",
      "Design Patterns"
    ],
    "correctAnswerText": "Design Tokens",
    "explanation": "Design tokens are the visual design atoms of the design system — specifically, they are named <u>enttes that store visual design atributes. We use them in place of hard-coded values (such as hex values for color or pixel values for spacing) in order to maintain a scalable and consistent visual system for UI development1. Design tokens are available for diferent platorms and frameworks, such as Lightning Web Components, Aura Components, CSS, iOS, and Android2. Design tokens can be customized to apply branding and theming to components and applicatons3. Utlity classes are CSS classes that provide common styling propertes, such as margins, padding, borders, and text alignment1. Design paterns are reusable solutons to common design problems, such as navigaton, forms, and data visualizaton. Reference: Design Tokens - Lightning Design System, SLDS Design Tokens | Lightning Web Components Developer Guide | Salesforce Developers, Styling with Design Tokens - Salesforce Developers, [Design Paterns - Lightning Design System]</u>"
  },
  {
    "id": 139,
    "category": "Discovery",
    "question": "Cloud Kicks asks its UX Designer to create a B2B sales portal that can easily integrate customer relationship management. Which Salesforce solution should be used?",
    "choices": [
      "Commerce Cloud",
      "Experience Cloud",
      "Sales Cloud"
    ],
    "correctAnswerText": "Experience Cloud",
    "explanation": "Experience Cloud is the Salesforce solution that enables businesses to create engaging and personalized digital experiences for their customers, partners, and employees. Experience Cloud can easily integrate customer relationship management (CRM) data from Sales Cloud, Service Cloud, and other Salesforce products to provide a seamless and consistent experience across different touchpoints. Experience Cloud can also leverage the power of Commerce Cloud to create B2B sales portals that allow buyers to browse, order, and pay for products online. Experience Cloud offers various templates, components, and tools to design and build customized and branded B2B sales <u>portals that meet the needs and expectatons of the target audience. Reference: Experience Cloud Overview, Learn About B2B Commerce, Salesforce B2B Commerce Basics</u>"
  },
  {
    "id": 140,
    "category": "Discovery",
    "question": "It is recommended to carefully consider which demographic data and for what purpose is fed into an AI model. Which reason explains this?",
    "choices": [
      "To avoid societal bias",
      "To avoid unconscious confirmation bias",
      "To avoid interaction bias"
    ],
    "correctAnswerText": "To avoid societal bias",
    "explanation": "Demographic data is data that describes the characteristics of a population or a group of people, such as age, gender, race, ethnicity, income, education, or occupation. Demographic data can lead to bias if it is used to discriminate or treat people differently based on their identity or attributes. Demographic data can also reflect existing biases or stereotypes in society or culture, which can affect the fairness and ethics of AI systems. Societal bias is the bias that results from the social norms, values, and expectations of a society or a culture. Societal bias can influence how people perceive, judge, and behave toward others, especially those who are different from them. Societal bias can also be embedded in the data that is used to train or validate AI models, which can then propagate or amplify the bias in the AI outputs or decisions. Therefore, it is recommended to carefully consider which demographic data and for what purpose is fed into an AI model, to avoid <u>societal bias and its negatve consequences. Reference: Salesforce AI Associate: How to Avoid Bias from Demographic Data in AI Models, Recognize Bias in Artfcial Intelligence Unit | Salesforce Trailhead, Designing Personalized User Experiences with Data AI | Salesforce</u>"
  },
  {
    "id": 141,
    "category": "Discovery",
    "question": "Cloud Kicks' digital support representatives have different needs and requirements for Knowledge articles than customers. Customers need to see: - Some Knowledge articles, not all - Articles organized in different categories - Different fields than support representatives Which consideration should be made when determining how to present Knowledge articles to each audience?",
    "choices": [
      "Separate articles should be written for each audience, with only relevant information.",
      "Page layouts or permissions can display only the fields needed for each audience.",
      "Topics within a customer site must be organized the same as internal data categories."
    ],
    "correctAnswerText": "Page layouts or permissions can display only the fields needed for each audience.",
    "explanation": "The best way to present Knowledge articles to different audiences is to use page layouts or permissions to display only the fields needed for each audience. This way, the same article can be reused for both internal and external users, but with different levels of detail and visibility. Page layouts can control which fields are shown on the article detail page, and permissions can control which fields are searchable and editable. This is more efficient and consistent than writing separate articles for each audience, which would require more maintenance and duplication. Topics and data categories are different ways of organizing articles, but they do not affect the fields that are displayed. Topics are used for external sites, such as communities or portals, and data categories are used for internal sites, such as the Salesforce app. They can be mapped to each other, but they do not have to be organized the same way. Reference: <u>5 Best Practces for Salesforce Knowledge The Ultmate Guide to Salesforce Knowledge How to Write a Good Knowledge Base Artcle Prepare Your Salesforce Knowledge Base</u>"
  },
  {
    "id": 142,
    "category": "Human-Centered Design",
    "question": "Cloud Kicks plans to release a new Salesforce product to its employees, who all have different backgrounds and experience levels within Salesforce. Which onboarding design best practice would best support the product release?",
    "choices": [
      "Provide written help documentation as the single source of truth for learning about new features.",
      "Identify the message, audience, and purpose for content.",
      "Create pop-ups to give users a full visualization of a product."
    ],
    "correctAnswerText": "Identify the message, audience, and purpose for content.",
    "explanation": "The best onboarding design practice for Cloud Kicks would be to identify the message, audience, and purpose for content. This would help them tailor the content to the different needs and preferences of their employees, and provide them with the most relevant and useful information. Providing written help documentation as the single source of truth for learning about new features (A) might not be engaging or effective for all users, especially those who prefer visual or interactive learning. Creating pop-ups to give users a full visualization of a product © might be intrusive or overwhelming for some users, and might not explain the benefits or features of the product clearly. Identifying the message, audience, and purpose for content (B) is a key step in creating user-centered onboarding design, as it helps to define the goals, scope, and tone of the content, and to align it with the user’s needs, expectations, and motivations. Reference: [UX Designer Certification Prep: Onboarding Design] [UX Designer Certification Prep: Content Strategy] [Salesforce Certified User Experience Designer Exam Guide]"
  },
  {
    "id": 143,
    "category": "Testing",
    "question": "The UX team at Cloud Kicks is examining the user interface of the company's customer-facing portal that runs on Experience Cloud. They want to determine the portal's compliance with recognized standard usability principles. How should this be accomplished?",
    "choices": [
      "Intuitive Review",
      "A Heuristic Evaluation",
      "User Testing"
    ],
    "correctAnswerText": "A Heuristic Evaluation",
    "explanation": "A heuristic evaluation is a usability inspection method that involves having evaluators examine a user interface and assess its compliance with established usability principles (or “heuristics”). These heuristics are guidelines or rules of thumb that help identify common usability problems. During a heuristic evaluation, evaluators inspect the interface and identify potential usability issues based on the heuristics. The evaluators then report their findings to the designers or developers, who can use this feedback to improve the interface. Heuristic evaluation is a cost-effective and efficient way to identify usability problems early in the design process. It can be done quickly and does not require <u>large groups of partcipants. It is partcularly useful for identfying problems that may not be detected through user testng or surveys1.</u> <u>A heuristc evaluaton is the most suitable method for determining the portal’s compliance with</u> ’ <u>recognized standard usability principles, such as Nielsen s 10 heuristcs for user interface design2.</u> These heuristics cover aspects such as visibility of system status, match between system and the real world, user control and freedom, consistency and standards, error prevention, recognition rather than recall, flexibility and efficiency of use, aesthetic and minimalist design, help users recognize, diagnose, and recover from errors, and help and documentation. By applying these heuristics to the portal, the UX team can identify and prioritize the usability problems that need to be fixed. An intuitive review is a less formal and less rigorous method of usability inspection, where an evaluator relies on their own intuition and experience to judge the usability of an interface. An intuitive review does not follow a set of predefined heuristics or criteria, and it is more subjective <u>and prone to bias. An intuitve review can be useful for getng a quick overview of the interface, but it is not as reliable or comprehensive as a heuristc evaluaton3.</u> User testing is a usability evaluation method that involves observing and collecting data from actual or potential users as they perform tasks with the interface. User testing can provide valuable insights into how users interact with the interface, what difficulties they encounter, and what their preferences and expectations are. User testing can also measure the effectiveness, efficiency, and satisfaction of the interface. However, user testing is not the best method for determining the compliance with standard usability principles, as it does not directly assess the interface against the <u>heuristcs. User testng is also more tme-consuming, resource-intensive, and complex to conduct than heuristc evaluaton4.</u> <u>Reference: 1: A Comparison of User Testng and Heuristc Evaluaton Methods for Identfying Website Usability Problems | SpringerLink 2: 10 Usability Heuristcs for User Interface Design 3: Heuristc Evaluaton of User Interfaces versus Usability Testng 4: Diference Between Heuristc Evaluaton VS</u> Usability Testing - Storyly"
  },
  {
    "id": 144,
    "category": "Declarative Design",
    "question": "A UX Designer needs to declutter the Highlights panel for a custom object's Lightning page. The team that uses this object explained there are too many action buttons; only specific actions are used for each status of the record. Which Lightning Record Page feature should be used to solve this problem?",
    "choices": [
      "Audiences",
      "Dynamic Forms",
      "A Dynamic Actions **"
    ],
    "correctAnswerText": "A Dynamic Actions **",
    "explanation": "Dynamic Actions are a feature that allows the UX Designer to customize the actions that appear on the Highlights panel of a Lightning record page based on criteria such as record status, user profile, or field value. This way, the UX Designer can declutter the Highlights panel and show only the relevant actions for each record. Dynamic Actions can be configured in the Lightning App Builder instead of the page layout editor, which gives more flexibility and control to the UX Designer. Reference: <u>Salesforce Dynamic Actons – Overview & Deep Dive Tutorial Create Dynamic Actons in Lightning App Builder - Salesforce Add Visibility Rules for Dynamic Pages - Trailhead</u>"
  },
  {
    "id": 145,
    "category": "Discovery",
    "question": "A UX Designer wants to inform user stories based on user value and development effort. Which method should be used?",
    "choices": [
      "Card Sorting",
      "Prioritization Matrix",
      "Customer Journey Map"
    ],
    "correctAnswerText": "Prioritization Matrix",
    "explanation": "A prioritization matrix is a method that helps UX designers to inform user stories based on user value and development effort. A prioritization matrix is a table that compares different user stories or features based on two criteria: user value and development effort. User value is the benefit or satisfaction that the user will get from using the feature. Development effort is the time, cost, and complexity involved in building the feature. By plotting user stories or features on a prioritization matrix, UX designers can identify which ones are high-value and low-effort, which ones are highvalue and high-effort, which ones are low-value and low-effort, and which ones are low-value and high-effort. This helps UX designers to prioritize the user stories or features that will deliver the most value to the user with the least amount of effort, and to deprioritize or eliminate the ones that will deliver the least value to the user with the most amount of effort. A prioritization matrix can also help UX designers to communicate and align with stakeholders and developers on the scope and <u>feasibility of the project. Reference: Prioritze User Stories and Features Unit | Salesforce Trailhead, How to Prioritze User Stories (and Build the Right Features), Salesforce User Experience (UX) Designer Certfcaton Guide & Tips</u>"
  },
  {
    "id": 146,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks is displaying Knowledge articles on a site with a colored background. A UX Designer is asked to evaluate Web Content Accessibility Guidelines (WCAG) level AA for normal text. What is the minimum color contrast ratio that would pass these guidelines?",
    "choices": [
      "At least 7.0:1",
      "At least 3.0:1",
      "At least 4.5:1"
    ],
    "correctAnswerText": "At least 4.5:1",
    "explanation": "<u>According to the Web Content Accessibility Guidelines (WCAG) 2.1, the minimum color contrast rato for normal text is 4.5:11. This means that the diference in brightness (luminance) between the text color and the background color should be at least 4.5 tmes. This ensures that the text is readable by people with moderately low vision, color defciencies, or contrast sensitvity1. The contrast rato can</u> be calculated using the formula: L2 +0.05L1 +0.05 <u>where L1 is the relatve luminance of the lighter color and L2 is the relatve luminance of the darker color2. The relatve luminance is a value between 0 and 1, where 0 is black and 1 is white2. The contrast rato can range from 1:1 (white on white) to 21:1 (black on white)2.</u> The contrast ratio requirement for normal text is lower for larger text or bold text, as they are easier <u>to read at lower contrast. For large text (18 point or 14 point bold), the minimum contrast rato is 3:11. For graphics and user interface components, such as form input borders, the minimum contrast rato is also 3:13. For level AAA conformance, the minimum contrast rato for normal text is 7:1 and for large text is 4.5:11.</u> <u>To evaluate the color contrast rato of a site, there are various tools available, such as the Contrast Checker or the Contrast Rato tool. These tools allow users to enter the text color and the</u> background color and see the contrast ratio and whether it meets the WCAG guidelines. They also provide suggestions for improving the contrast ratio if needed. Reference: <u>Understanding Success Criterion 1.4.3: Contrast (Minimum)</u> <u>Contrast Rato - WCAG Color Contrast Checker</u> <u>WebAIM: Contrast Checker WCAG: Accessible colour and contrast ratos Contrast rato - WCAG WG</u>"
  },
  {
    "id": 147,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks is planning to build a custom Lightning Web Component (LWC) that needs to be implemented quickly. Where should the team go to explore Lightning component code, documentation, and specifications?",
    "choices": [
      "Salesforce Extensions for V5 Code",
      "Design Tokens on SLDS website",
      "A Components Library on developer.salesforce.com is item for later review."
    ],
    "correctAnswerText": "A Components Library on developer.salesforce.com is item for later review.",
    "explanation": "<u>The best place for the team to explore Lightning component code, documentaton, and specifcatons is the Components Library on developer.salesforce.com1. The Components Library is the Lightning components developer reference, where the team can fnd code samples, SDKs, tools, metadata coverage informaton, and a developer guide for Lightning Web Components1. The team can also use the live code environment to code their frst Lightning web component and see the results in real</u> <u>tme2. Salesforce Extensions for VS Code (A) is a powerful tool for developing Lightning components,</u> but it is not a source of code, documentation, and specifications. Design Tokens on SLDS website (B) are a way to store and maintain consistent design attributes across different platforms, but they are not specific to Lightning Web Components. Reference: <u>Components Library on developer.salesforce.com</u> <u>Get Started Coding | Lightning Web Components Developer Guide</u>"
  },
  {
    "id": 148,
    "category": "Declarative Design",
    "question": "Cloud Kicks has a text information-rich Salesforce org. The company wants to maximize the content on every screen because most of its employees use laptops with limited screen space. Which global user interface setting should be used to solve this problem?",
    "choices": [
      "Comfy Display Density",
      "Compact Display Density",
      "Enable Collapsible Sections"
    ],
    "correctAnswerText": "Compact Display Density",
    "explanation": "Compact display density is a global user interface setting that allows users to view more content on every screen by reducing the amount of space between page elements and aligning the field labels to the left of the fields. Compact display density is suitable for text information-rich Salesforce orgs, <u>such as Cloud Kicks, that want to maximize the use of limited screen space on laptops. Compact display density can be set as the default for the org by the system admins, or chosen by individual users from their profle menu1.</u> Comfy display density is another global user interface setting that provides a spacious view with labels on the top of fields and more space between page elements. Comfy display density is suitable for orgs that want to emphasize readability and clarity, or that have more complex or interactive <u>felds. Comfy display density is not the best opton for Cloud Kicks, as it would reduce the amount of content that can be displayed on each screen1.</u> Enable collapsible sections is a feature that allows users to collapse or expand sections on a record page layout. Collapsible sections can help users focus on the most relevant information and reduce scrolling. However, collapsible sections are not a global user interface setting, but a page layout <u>opton that can be confgured by the admins. Collapsible sectons can be used in combinaton with either comfy or compact display density, but they do not afect the alignment of the feld labels or the spacing between the page elements2. Reference: 1: Personalize Lightning Experience Display 2: Collapsible Sectons in Lightning Experience</u> Record Pages"
  },
  {
    "id": 149,
    "category": "Discovery",
    "question": "A UX Designer wants to conduct customer interviews as part of discovery research. Which best practice should be followed while conducting these interviews?",
    "choices": [
      "Ignore vague or general answers.",
      "Engage in a friendly and informal way. #####",
      "Analyze findings in the moment."
    ],
    "correctAnswerText": "Engage in a friendly and informal way. #####",
    "explanation": "Customer interviews are a qualitative research method that allows the UX Designer to understand the needs, goals, pain points, and behaviors of the target users. To conduct effective customer interviews, the UX Designer should follow some best practices, such as: Engage in a friendly and informal way: The UX Designer should try to establish rapport and trust with the interviewee, and make them feel comfortable and relaxed. This can help elicit honest and candid <u>responses, and encourage the interviewee to share more details and stories. The UX Designer should use a conversatonal tone, smile, and show interest and empathy12</u> Ask open-ended questions: The UX Designer should avoid asking yes/no questions, or questions that lead or suggest a specific answer. Instead, the UX Designer should ask open-ended questions that <u>allow the interviewee to express their thoughts and feelings in their own words. The UX Designer should also probe deeper by asking follow-up questons, such as “why?”, “how?”, or “can you tell me more about that?” 12</u> Listen actively and attentively: The UX Designer should focus on listening to the interviewee, and avoid interrupting, judging, or correcting them. The UX Designer should also use verbal and nonverbal cues, such as nodding, eye contact, and paraphrasing, to show that they are paying attention <u>and understanding the interviewee. The UX Designer should also take notes or record the interview, with the interviewee’s permission, for later analysis12</u> Ignore vague or general answers: This is not a best practice, because vague or general answers can <u>indicate that the interviewee is not comfortable, engaged, or clear about the queston. The UX Designer should try to clarify the queston, or ask more specifc or concrete questons, to elicit more meaningful and relevant responses12</u> Analyze findings in the moment: This is not a best practice, because analyzing findings in the moment can distract the UX Designer from listening to the interviewee, and bias their interpretation <u>of the data. The UX Designer should wait untl the interview is over, and review the notes or recordings, before analyzing the fndings and identfying paterns, insights, and opportunites12</u> Reference: <u>Customer Interviews: The Ultmate Guide - User Interviews How to Conduct User Interviews - Interacton Design Foundaton</u>"
  },
  {
    "id": 150,
    "category": "Declarative Design",
    "question": "Cloud Kicks has a content-rich set of record pages and wants its UX Design team to organize and consolidate them. Which Salesforce Lightning Design System (SLDS) component should be used to organize and consolidate content?",
    "choices": [
      "Data Tables",
      "Modals",
      "Q Tabs **"
    ],
    "correctAnswerText": "Q Tabs **",
    "explanation": "Q Tabs are a type of SLDS component that can be used to organize and consolidate content on a record page. Q Tabs are a variant of the Tabs component that are designed for use in the Lightning App Builder. Q Tabs allow users to switch between different views of related information within the same context. Q Tabs can also be nested to create subtabs within a tab. Q Tabs can help UX designers to create content-rich record pages that are easy to navigate and consume. Q Tabs can also help to reduce clutter and scrolling on a record page by grouping related content into tabs. Q Tabs can be customized with different icons, labels, and badges to indicate the type and status of the content in each tab. Q Tabs can also be configured to load content dynamically or on demand, which can <u>improve the performance and user experience of the record page. Reference: Q Tabs Component Blueprint | Lightning Design System, Tabs Component Blueprint | Lightning Design System, Tabs | Lightning Web Components Developer Guide | Salesforce Developers</u>"
  },
  {
    "id": 151,
    "category": "Discovery",
    "question": "Which goal would be important in undertaking a Consequence Scanning exercise before launching a new product?",
    "choices": [
      "Reframe the product objectives from multiple, diverse perspectives.",
      "Encourage team well-being through collaboration.",
      "Identify the best angle for positive launch press coverage."
    ],
    "correctAnswerText": "Reframe the product objectives from multiple, diverse perspectives.",
    "explanation": "<u>Consequence scanning is a practce that helps teams to consider the potental consequences of their product or service on people, communites, and the planet1. It is an agile tool that fts within an iteratve development cycle and allows teams to identfy and mitgate risks, as well as focus on positve outcomes2. One of the goals of consequence scanning is to reframe the product objectves from multple, diverse perspectves. This means that the team can explore how diferent stakeholders, such as users, organisatons, or society, might be afected by the product or service, both intentonally and unintentonally2. By doing so, the team can ensure that the product or service aligns with their values and culture, and that they are aware of the trade-ofs and implicatons of their decisions2. Reframing the product objectves from multple, diverse perspectves can also help the team to discover new opportunites, generate innovatve solutons, and increase user satsfacton and trust3.</u> Encouraging team well-being through collaboration and identifying the best angle for positive launch press coverage are not the primary goals of consequence scanning, although they might be <u>benefcial side efects. Consequence scanning is not a PR exercise, but a way to ensure responsible innovaton and ethical design2. While consequence scanning can foster team collaboraton and communicaton, it is not a team-building actvity, but a way to share knowledge and expertse and raise concerns in a dedicated format2. Reference: Consequence scanning: How to mitgate risks in your service</u> – <u>Consequence Scanning an agile practce for responsible innovators What is consequence scanning?</u>"
  },
  {
    "id": 152,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks (CK) has identified that its individual agents send out messaging and communication that is often not aligned with the company's overall branding and communication style. Which Salesforce solutions should be implemented to help CK deliver consistently branded content at every touchpoint?",
    "choices": [
      "A Distributed Marketing and Journey Builder",
      "Email Builder and Customer 360",
      "Service Cloud and Letterhead"
    ],
    "correctAnswerText": "A Distributed Marketing and Journey Builder",
    "explanation": "The best Salesforce solutions for Cloud Kicks to deliver consistently branded content at every <u>touchpoint are Distributed Marketng and Journey Builder. Distributed Marketng allows individual</u> - <u>agents to send personalized and compliant messages to their customers, using pre approved templates and content created by the corporate marketng team1. Journey Builder enables the marketng team to design and automate customer journeys across channels and devices, using data and analytcs to optmize the customer experience2. Email Builder and Customer 360 (B) are not</u> sufficient to ensure consistent branding and communication, as they only cover email marketing and customer data integration, respectively. Service Cloud and Letterhead © are also not the best solutions, as they only focus on customer service and email formatting, respectively. Reference: <u>Distributed Marketng | Salesforce</u> <u>Journey Builder | Salesforce</u>"
  },
  {
    "id": 153,
    "category": "Discovery",
    "question": "Cloud Kicks (CK) wants to better deliver products to its customers. CK's UX Designer has an innovative solution but is struggling to get the team to visualize where and why it fits into what the customer does. Which technique should be used?",
    "choices": [
      "Personas",
      "Storyboards",
      "High-fidelity Prototype"
    ],
    "correctAnswerText": "Storyboards",
    "explanation": "A storyboard is a visual representation of a user’s journey with a product or service. It shows how the user interacts with the product or service in a specific context, what their goals and pain points <u>are, and how the product or service solves their problems or meets their needs. A storyboard typically consists of a series of sketches or illustratons that depict the user’s actons, thoughts, and emotons at each step of the journey1.</u> A storyboard is the most suitable technique for CK’s UX Designer to use in this case, because it can help them communicate their innovative solution to the team and show where and why it fits into what the customer does. A storyboard can also help the UX Designer to validate their assumptions, <u>test their ideas, and get feedback from the team and the customers. A storyboard can also inspire the</u> ’ <u>team to generate more ideas and solutons, and align them with the user s perspectve2.</u> Personas are fictional characters that represent the potential users of a product or service. They are based on user research and data, and they describe the user’s demographics, behaviors, motivations, goals, and frustrations. Personas are useful for understanding the user’s needs and expectations, and for designing products or services that cater to them. However, personas alone are not enough to show how the user interacts with the product or service in a specific context, or how the product or <u>service solves their problems or meets their needs. Personas need to be complemented with other</u> ’ <u>techniques, such as scenarios, user stories, or storyboards, to illustrate the user s journey3.</u> A high-fidelity prototype is a realistic and interactive simulation of a product or service. It mimics the look, feel, and functionality of the final product or service, and it can be used for testing and evaluation purposes. A high-fidelity prototype is useful for demonstrating the features and benefits of a product or service, and for getting feedback from the users and stakeholders. However, a highfidelity prototype is not the best technique for showing where and why a product or service fits into what the customer does, as it focuses more on the details and specifics of the product or service, rather than the context and situation of the user. A high-fidelity prototype is also more timeconsuming and resource-intensive to create than a storyboard, and it may not be necessary at the early stages of the design process. <u>Reference: 1: What is Storyboarding in UX Design? | Adobe XD Ideas 2: How to Use Storyboarding in UX Design | Toptal 3: User Personas, Scenarios, User Stories And Storyboards: What’s the Diference?</u> | by Justinmind | UX Planet : What Kind of Prototype Should You Create? | IxDF"
  },
  {
    "id": 154,
    "category": "Testing",
    "question": "Cloud Kicks' administrator has a requirement to make the user experience for a complex process more engaging for internal users. Which Salesforce functionality should be used?",
    "choices": [
      "Lightning Survey",
      "Process Builder",
      "Screen flow"
    ],
    "correctAnswerText": "Screen flow",
    "explanation": "Screen flow is a Salesforce functionality that allows the UX Designer to create interactive workflows for the users with just a few clicks. With screen flow, the UX Designer can create step-by-step workflows that include screens for data entry, decision points based on user input, and automated actions based on their responses. Screen flow can make the user experience more engaging by presenting the users with what they need, when they need it, and using their input to guide them <u>and automate their tasks. Screen fow can also be customized and embedded in various ways, such as on a Lightning page, a buton, a utlity bar, or an Experience Cloud page123</u> Lightning Survey is a Salesforce functionality that allows the UX Designer to create and distribute <u>surveys to collect feedback from customers, employees, or partners. Lightning Survey is not suitable for creatng complex processes or workfows, but rather for measuring satsfacton, loyalty, or engagement4</u> Process Builder is a Salesforce functionality that allows the UX Designer to create and automate business processes without code. Process Builder can perform actions based on criteria, such as <u>updatng records, sending emails, or invoking fows. Process Builder is not suitable for creatng interactve workfows with screens, but rather for automatng background tasks5</u> Reference: <u>Get Started with Screen Flows Unit | Salesforce Trailhead How to Create a Salesforce Screen Flow | Salesforce Ben</u> <u>5 Ways to Get Started with Screen Flows - Salesforce Admins Create and Distribute Surveys with Salesforce Feedback Management Automate Your Business Processes with Process Builder</u>"
  },
  {
    "id": 155,
    "category": "Discovery",
    "question": "A UX Designer creates a set of patterns and guidelines for including visual indicators letting a user know which form fields are required. Which Usability Heunstic is being used in this case?",
    "choices": [
      "Visibility of system status",
      "User Control and Freedom",
      "Error diagnosis and recovery"
    ],
    "correctAnswerText": "Visibility of system status",
    "explanation": "<u>Visibility of system status is the usability heuristc that is being used in this case. Visibility of system status means that the system should always keep users informed about what is going on, through appropriate feedback within reasonable tme1. One way to apply this heuristc is to use visual</u> indicators to let users know which form fields are required, such as asterisks, labels, or colors. This helps users to understand the expectations and requirements of the system, and to avoid errors or confusion. By providing clear and timely feedback, the system enhances the user experience and <u>satsfacton. Reference: Learn About User Experience Design Unit | Salesforce Trailhead, [10 Usability Heuristcs for User Interface Design], Salesforce User Experience (UX) Designer Certfcaton Guide & Tips</u>"
  },
  {
    "id": 156,
    "category": "Declarative Design",
    "question": "Cloud Kicks (CK) has been tracking the details of its storage facilities in an Excel sheet, where each facility is represented as a row and the details about each facility are represented by columns. How should CK store this information in Salesforce?",
    "choices": [
      "Objects to represent facility details and fields to store storage facilities",
      "Objects to represent both storage facilities and facility details",
      "Objects to represent storage facilities and fields to store facility details"
    ],
    "correctAnswerText": "Objects to represent storage facilities and fields to store facility details",
    "explanation": "The best way to store the information of Cloud Kicks’ storage facilities in Salesforce is to use objects <u>to represent storage facilites and felds to store facility details. This is because objects and felds in</u> <u>Salesforce are analogous to database tables and columns, respectvely1. Each object contains a set of felds that store data values, and each record is an instance of an object1. Therefore, if Cloud Kicks</u> wants to store the same information that they have in their Excel sheet, they can create a custom object called Storage Facility, and add fields for each detail that they want to track, such as location, capacity, inventory, and so on. Then, they can create records for each storage facility and populate <u>the felds with the corresponding data. This way, they can store and manage their data in a structured and consistent way, and leverage the features and benefts of Salesforce, such as reports, dashboards, automaton, and security23.</u> Using objects to represent facility details and fields to store storage facilities is not a valid option, as <u>it does not make sense to use objects as data values. Objects are meant to represent enttes or concepts, not atributes or propertes1. Using objects to represent both storage facilites and facility</u> details is also not a good option, as it would create unnecessary complexity and redundancy in the <u>data model. Objects can be related to each other through various types of relatonships, such as lookup, master-detail, or many-to-many4. However, in this case, there is no need to create a</u> separate object for each facility detail, as they are not independent entities, but rather characteristics <u>of the storage facilites. Creatng a separate object for each detail would also require creatng more felds, records, and relatonships, which would increase the maintenance and storage costs, and reduce the performance and usability of the system5. Reference:</u> <u>Learn All About Objects and Fields in Salesforce - Forcetalks Mastering Salesforce CRM Administraton - Packt Subscripton</u> <u>Overview of Salesforce Objects and Fields Object Reference for the Salesforce Platorm Understand Custom & Standard Objects Unit | Salesforce Trailhead</u>"
  },
  {
    "id": 157,
    "category": "Declarative Design",
    "question": "Cloud Kicks (CK) allows its partners to manage leads and opportunities. CK's relationship manager has requested that partners are able to quickly browse and see their opportunities segmented by key attributes: If the opportunity is closing within 2 weeks If it is valued at more than $100,000 Which approach should be used in Experience Builder to enable this?",
    "choices": [
      "Create a custom Lightning Web Component using a data table for each key attribute.",
      "Allow each user to create a filter for each key attribute and link to the opportunities list view.",
      "Configure a pre-filtered opportunity list view for each key attribute with the partner group."
    ],
    "correctAnswerText": "Configure a pre-filtered opportunity list view for each key attribute with the partner group.",
    "explanation": "The best approach to enable partners to quickly browse and see their opportunities segmented by key attributes is to configure a pre-filtered opportunity list view for each key attribute with the partner group. This way, the partners can easily access the list views that show only the opportunities that match the criteria, such as closing within 2 weeks or valued at more than $100,000. Creating a custom Lightning Web Component using a data table for each key attribute (A) might be too complex and time-consuming, and it might not be compatible with the Experience Builder. Allowing each user to create a filter for each key attribute and link to the opportunities list view (B) might be too tedious and inconsistent, and it might not provide a quick and easy way to browse the <u>opportunites. Confguring a pre-fltered opportunity list view for each key atribute with the partner</u> <u>group © is a simple and efectve soluton that leverages the existng functonality of the Experience Builder and the list view component12. Reference: List View Component | Salesforce Experience Cloud Create and Edit List Views | Salesforce Help</u>"
  },
  {
    "id": 158,
    "category": "Declarative Design",
    "question": "A UX Designer is limited to one standard Order record page layout in Sales Cloud. It is shared between internal and external users. Which page layout feature should be used to control the visibility between users?",
    "choices": [
      "Audience Targeting",
      "Field-Level Security",
      "Dynamic Forms"
    ],
    "correctAnswerText": "Audience Targeting",
    "explanation": "Audience targeting is a page layout feature that allows admins to create different versions of a Lightning page for different audiences, such as user profiles, roles, or permissions. Audience targeting can be used to control the visibility of the entire page or specific components on the page, <u>such as tabs, felds, or sectons. Audience targetng can help create personalized and relevant experiences for diferent types of users, and reduce the need for multple page layouts1.</u> Audience targeting is the most suitable feature for the UX Designer to use in this case, because it can help them customize the Order record page layout for internal and external users, without creating separate page layouts. For example, the UX Designer can use audience targeting to show or hide certain fields, sections, or tabs based on the user’s profile or permission set. This way, the UX Designer can ensure that each user sees only the information that is relevant and appropriate for them. Field-level security is a feature that allows admins to restrict the access and editability of fields for different users, based on their profiles or permission sets. Field-level security can help protect sensitive or confidential data, and enforce data quality and integrity. However, field-level security <u>does not afect the visibility of felds on the page layout, only the access and editability. Field-level security also does not apply to other components on the page, such as tabs or sectons2.</u> Dynamic forms is a feature that allows admins to add, group, and reorder fields and sections on a Lightning page using the Lightning App Builder. Dynamic forms can help create flexible and dynamic page layouts that can adapt to different contexts and scenarios. Dynamic forms also support visibility rules, which can be used to show or hide fields or sections based on filters or conditions. However, dynamic forms are not available for all standard objects, and they do not support audience <u>targetng. Dynamic forms also do not afect the visibility of other components on the page, such as tabs34.</u> - <u>Reference: 1: Audience Targetng for Lightning Pages 2: Field Level Security | Salesforce Security Guide - Salesforce Developers 3: Dynamic Forms Tips and Consideratons - Salesforce 4: Salesforce</u> Dynamic Forms: Overview & Deep Dive Tutorial"
  },
  {
    "id": 159,
    "category": "Testing",
    "question": "A UX Designer is hired to help create a brand new app for the AppExchange with a human-centered approach. Which strategy will most likely strengthen employee relationships the most?",
    "choices": [
      "Create a first draft in a design team and then share it for feedback with employees.",
      "Send an anonymous survey to collect ideas from across the whole company.",
      "Invite employees from different departments and create a journey map together."
    ],
    "correctAnswerText": "Invite employees from different departments and create a journey map together.",
    "explanation": "A journey map is a visual representation of the steps, emotions, and pain points that a user goes <u>through when interactng with a product or service. A journey map can help the UX Designer understand the user’s needs, goals, expectatons, and frustratons, and identfy opportunites for improvement or innovaton12</u> Creating a journey map together with employees from different departments is a strategy that can strengthen employee relationships the most, because it can: Foster collaboration and communication: Inviting employees from different departments to create a journey map can help them share their perspectives, insights, and ideas, and learn from each <u>other. This can also help them align on a common vision and goal, and build trust and respect among the team members34</u> Increase engagement and ownership: Inviting employees from different departments to create a journey map can help them feel more involved and invested in the design process and the <u>outcome. This can also help them develop a sense of ownership and responsibility for the product or service, and increase their motvaton and satsfacton34</u> Enhance creativity and innovation: Inviting employees from different departments to create a journey map can help them generate more diverse and creative solutions, as they can leverage their <u>diferent skills, experiences, and backgrounds. This can also help them challenge their assumptons and biases, and explore new possibilites and opportunites34</u> Create a first draft in a design team and then share it for feedback with employees: This is not a strategy that can strengthen employee relationships the most, because it can create a sense of exclusion and hierarchy among the employees. The design team may appear to be the sole authority <u>and decision-maker, while the other employees may feel like passive observers or critcs. This can also limit the diversity and quality of the feedback, as the employees may not have enough context or understanding of the design process and the user’s needs34</u> Send an anonymous survey to collect ideas from across the whole company: This is not a strategy that can strengthen employee relationships the most, because it can reduce the interaction and connection among the employees. An anonymous survey may not allow the employees to express their thoughts and feelings fully, or to receive any feedback or recognition for their <u>contributons. This can also make the employees feel detached and indiferent about the design</u> <u>process and the outcome34</u> Reference: <u>Create a Journey Map Unit | Salesforce Trailhead</u> - <u>How to Create a Customer Journey Map UX Mastery How to Use Journey Mapping to Improve Employee Engagement How to Use Journey Mapping to Drive Collaboraton and Innovaton</u>"
  },
  {
    "id": 160,
    "category": "Declarative Design",
    "question": "Cloud Kicks (CK) wants to provide employees with quick access to apps, objects, and other items in the Salesforce mobile app. Which navigational feature should CK use?",
    "choices": [
      "Personalized Navigation Tabs",
      "Console Navigation",
      "Utility Bar"
    ],
    "correctAnswerText": "Personalized Navigation Tabs",
    "explanation": "Personalized Navigation Tabs are a navigational feature that allows the users to customize the navigation bar of the Salesforce mobile app with the items that they use most frequently. Users can add, remove, and reorder the tabs in the navigation bar, and access them with a single tap. Users can <u>also mark their favorite items with a star icon, and access them from the Favorites tab. Personalized Navigaton Tabs can help Cloud Kicks (CK) employees to quickly access the apps, objects, and other items that they need in the Salesforce mobile app12</u> Console Navigation is a navigational feature that allows the users to work with multiple records and <u>objects on a single screen in the Salesforce desktop app. Console Navigaton is not available in the Salesforce mobile app, and it is not suitable for providing quick access to apps, objects, and other items3</u> Utility Bar is a navigational feature that allows the users to access common productivity tools, such <u>as notes, history, or macros, from a fxed footer at the botom of the Salesforce desktop app. Utlity Bar is not available in the Salesforce mobile app, and it is not suitable for providing quick access to apps, objects, and other items4</u> Reference: - <u>Personalize Your Navigaton Bar in the Salesforce Mobile App Salesforce Help Personalize Your Navigaton Bar in the Salesforce Mobile App Unit | Salesforce Trailhead Console Navigaton - Salesforce Help Utlity Bar - Salesforce Help</u>"
  },
  {
    "id": 161,
    "category": "Declarative Design",
    "question": "Cloud Kicks requires a custom image to be added to a record detail page, making it easier for the company to visually identify its current membership level. Which platform tools should be used to achieve this requirement?",
    "choices": [
      "A Formula Field, Static Resource, and Object Page Layout",
      "Image Field, Dynamic Form, and Lightning Record Page",
      "Lightning Components, SLDS Icons, and Compact Layouts"
    ],
    "correctAnswerText": "A Formula Field, Static Resource, and Object Page Layout",
    "explanation": "A formula field is a custom field that calculates a value based on a formula expression. A formula field can display text, numbers, dates, or images. A formula field can use the IMAGE function to <u>display an image from a URL. A formula feld can be added to an object page layout to show the</u> ##### <u>image on the record detail page1.</u> A static resource is a file or a collection of files that can be uploaded to Salesforce and referenced in a formula field, a Visualforce page, a Lightning component, or a web tab. A static resource can store <u>images, style sheets, JavaScript, or other fles. A statc resource can be used to store the custom image that Cloud Kicks wants to display on the record detail page2.</u> An object page layout is a configuration of fields, buttons, related lists, and other components on a record detail page. An object page layout can be customized to show different information for <u>diferent users, based on their profles or record types. An object page layout can be used to add the formula feld that displays the custom image to the record detail page3.</u> These platform tools can be used to achieve the requirement of adding a custom image to a record detail page, making it easier for Cloud Kicks to visually identify its current membership level. For example, the formula field can use the IMAGE function to display the custom image from the static resource, based on the value of another field that indicates the membership level. The object page layout can then include the formula field on the record detail page for the relevant users. Image field is a custom field that allows users to upload and display images on a record. Image field can be used to show images on a record detail page, but it is not suitable for Cloud Kicks’ <u>requirement, because it does not allow the image to be determined by a formula expression. Image feld requires the user to manually upload the image for each record, which is not efcient or consistent4.</u> Dynamic form is a feature that allows admins to add, group, and reorder fields and sections on a Lightning record page using the Lightning App Builder. Dynamic form can be used to create flexible and dynamic page layouts that can adapt to different contexts and scenarios. Dynamic form also supports visibility rules, which can be used to show or hide fields or sections based on filters or conditions. However, dynamic form is not a platform tool that can be used to display a custom image <u>on a record detail page, as it does not afect the content or functonality of the felds. Dynamic form can only be used to confgure the layout of the felds, not the values or images of the felds5.</u> Lightning components are reusable units of user interface that can be used to build Lightning pages and applications. Lightning components can be built using HTML, CSS, JavaScript, and Apex. Lightning components can display data, images, icons, charts, buttons, or other elements on a Lightning page. SLDS icons are icons from the Salesforce Lightning Design System that can be used in Lightning components to represent actions, objects, or concepts. Compact layouts are page layouts that show a record’s key fields at a glance in the highlights panel, the list view, the Related tab, and other <u>places. Compact layouts can be used to customize which felds are displayed in these places6.</u> Lightning components, SLDS icons, and compact layouts are platform tools that can be used to display images on a Lightning page, but they are not the best option for Cloud Kicks’ requirement, because they are more complex and require more development skills than a formula field, a static resource, and an object page layout. Lightning components also require more maintenance and testing than formula fields. SLDS icons are predefined icons that may not match the custom image <u>that Cloud Kicks wants to display. Compact layouts are not relevant for displaying images on a record detail page, as they only afect the highlights panel and other places6. Reference: 1: Use Images in ‘Formula’ Fields - Salesforce 2: Statc Resources | Salesforce Developer Guide 3: Page Layouts | Salesforce Help 4: Image Field | Salesforce Platorm - YouTube 5: Dynamic Forms Tips and Consideratons - Salesforce 6: Lightning Components Basics Unit | Salesforce</u> Trailhead"
  },
  {
    "id": 162,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer has been tasked with designing a custom Lightning Web Component (LWC) that uses ##### the Salesforce Lightning Design System (SLDS). Where on the SLDS website should the designer find accessible HTML and CSS used to create components along with implementation guidelines?",
    "choices": [
      "Component Blueprints",
      "Design Tokens",
      "Development Tools"
    ],
    "correctAnswerText": "Component Blueprints",
    "explanation": "<u>The best place on the SLDS website for the designer to fnd accessible HTML and CSS used to create components along with implementaton guidelines is the Component Blueprints1. Component</u> - <u>Blueprints are framework agnostc, accessible HTML and CSS that provide the basic structure and style for Lightning components1. The designer can use the Component Blueprints to create custom Lightning Web Components that are consistent with the Lightning Design System. Design Tokens (B) are not the best place to fnd HTML and CSS, as they are variables that store design atributes, such as colors, fonts, and spacing2. Development Tools © are not the best place to fnd implementaton guidelines, as they are tools and resources that help developers build and test Lightning components, such as VS Code extensions, LWC recipes, and Playground3. Reference: Component Blueprints | Salesforce Lightning Design System Design Tokens | Salesforce Lightning Design System Development Tools | Salesforce Lightning Design System</u>"
  },
  {
    "id": 163,
    "category": "Declarative Design",
    "question": "A Sales team is having trouble interacting with Contact records in Sales Cloud. They cannot find the information they need, and many of the visible record fields are not relevant to sales activities. On top of that, they complain the page load time is very long. Which approach should be recommended to improve their experience?",
    "choices": [
      "Run the Salesforce Optimizer App to identify fields not in use.",
      "Move all unused fields to a separate section at the bottom of the page.",
      "Implement In-App Guidance to help users focus on the most important fields."
    ],
    "correctAnswerText": "Run the Salesforce Optimizer App to identify fields not in use.",
    "explanation": "The best approach to improve the Sales team’s experience with Contact records in Sales Cloud is to <u>run the Salesforce Optmizer App to identfy felds not in use. The Salesforce Optmizer App is a free tool that scans the Salesforce org and provides a diagnostc report on the performance and health of the org1. It analyzes how the org uses various features, such as felds, triggers, layouts, profles, reports, and more, and suggests customizatons and improvements based on best practces1. By</u> running the Salesforce Optimizer App, the Sales team can find out which fields are not being used or <u>are redundant, and remove or hide them from the Contact record page. This way, they can simplify the page layout, reduce the page load tme, and focus on the felds that are relevant to their sales actvites2.</u> Moving all unused fields to a separate section at the bottom of the page is not a good option, as it does not solve the problem of having too many fields on the page. It would still affect the page load time and the user experience, as the users would have to scroll down to see the entire <u>page. Moreover, it would not help the users to fnd the informaton they need, as the felds would not be organized in a logical or meaningful way3.</u> Implementing In-App Guidance to help users focus on the most important fields is also not a good option, as it does not address the root cause of the problem, which is having too many fields on the <u>page. In-App Guidance is a feature that allows admins to create custom prompts and walkthroughs to guide users through tasks or processes on Salesforce Lightning pages4. It can be useful for user</u> training, onboarding, or adoption, but it cannot replace the need for a clean and efficient page <u>layout. In fact, having too many prompts or walkthroughs on the page can be distractng and annoying for the users, especially if they are not relevant or helpful4. Reference: Run the Salesforce Optmizer App Improve Your Implementaton with Salesforce Optmizer Page Layouts</u> <u>In-App Guidance in Lightning Experience</u>"
  },
  {
    "id": 164,
    "category": "UX Fundamentals",
    "question": "What is the relationship between inclusive design and accessible design?",
    "choices": [
      "Accessible and inclusive design are both methodologies based on guidelines.",
      "Inclusive design is a methodology and accessible design is based on guidelines.",
      "Accessible design is a methodology and inclusive design is focused on the outcome."
    ],
    "correctAnswerText": "Inclusive design is a methodology and accessible design is based on guidelines.",
    "explanation": "Inclusive design and accessible design are both important aspects of creating products and services that are usable and enjoyable for everyone, regardless of their abilities, preferences, or contexts. However, they are not the same thing. Inclusive design is a methodology that involves designing with <u>and for people who have a range of diverse needs and experiences. Inclusive design aims to create solutons that are not only accessible, but also equitable, respectul, and empowering for all users12.</u> Accessible design is based on guidelines that help ensure that products and services can be <u>perceived, understood, operated, and interacted with by people with disabilites. Accessible design follows standards such as the Web Content Accessibility Guidelines (WCAG), which provide technical specifcatons and best practces for making web content accessible34. Inclusive design and</u> accessible design are not mutually exclusive, but rather complementary. Inclusive design can help inform accessible design by providing insights and feedback from diverse users and stakeholders. Accessible design can help support inclusive design by providing a baseline of quality and compliance for products and services. By applying both inclusive design and accessible design, UX designers can <u>create more inclusive, accessible, and delightul experiences for everyone. Reference: Inclusive Design & Accessibility – Salesforce Designer – Medium, Product Accessibility and Inclusive Design - Salesforce.com, Learn the Elements of an Accessible Webpage Unit | Salesforce Trailhead, How Can Tech Be More Inclusive? Salesforce’s New VP of Accessibility & Inclusive Design Ofers Answers - Salesforce News, [Designing for Web Accessibility Unit | Salesforce Trailhead]</u>"
  },
  {
    "id": 165,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Which feature is provided in the Salesforce Lightning Design System (SLDS) for designers and developers?",
    "choices": [
      "A library of Lightning Web Components",
      "Semantic and accessible component markup",
      "ES6 JavaScript modules and plugins"
    ],
    "correctAnswerText": "Semantic and accessible component markup",
    "explanation": "The Salesforce Lightning Design System (SLDS) is a CSS framework that helps designers and <u>developers create applicatons with the look and feel of Lightning Experience. SLDS provides a library of design tokens, icons, components, utlites, and paterns that can be used to build consistent, responsive, and accessible user interfaces1. One of the features that SLDS provides for designers and</u> developers is semantic and accessible component markup. Semantic markup means using HTML elements that describe the meaning and structure of the content, rather than just the presentation. <u>For example, using <h1> for a main heading, <p> for a paragraph, or <buton> for a buton. Semantc markup helps to improve the readability, maintainability, and SEO of the code2. Accessible markup</u> means using HTML attributes and techniques that enhance the usability and accessibility of the content for people with disabilities. For example, using aria-label to provide a descriptive label for an element, role to indicate the function of an element, or tabindex to control the keyboard focus <u>order. Accessible markup helps to ensure that the content can be perceived, understood, operated, and interacted with by people using assistve technologies, such as screen readers, keyboards, or voice commands3. SLDS provides semantc and accessible markup for its components, which are reusable UI elements that can be customized and composed to create complex interfaces. SLDS components follow the Web Content Accessibility Guidelines (WCAG), which are the internatonal standards for web accessibility4. SLDS components also use the BEM (Block Element Modifer) naming conventon, which is a methodology for creatng clear and consistent class names for CSS selectors5. By using SLDS components, designers and developers can create user interfaces that are not only visually appealing, but also meaningful and accessible for everyone. Reference: Introducton to the Salesforce Lightning Design System, Semantc HTML: How to Structure Web Pages, Accessible Rich Internet Applicatons (WAI-ARIA), Web Content Accessibility Guidelines (WCAG) Overview, BEM</u> — Block Element Modifer"
  },
  {
    "id": 166,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks (CK) has a new Portal landing page built with Experience Builder. Upon review, CK does not think the company's brand experience is translated into the user experience; however, CK does confirm the Theme was set up correctly. Which additional UX elements should be reviewed to influence the brand experience?",
    "choices": [
      "Visual Design, Harmony, and Responsiveness",
      "Visual, Content, and Interaction Design",
      "Shapes, Interaction Design, and Typography"
    ],
    "correctAnswerText": "Visual, Content, and Interaction Design",
    "explanation": "The additional UX elements that should be reviewed to influence the brand experience are visual, <u>content, and interacton design. These elements are essental for creatng a consistent, engaging,</u> ’ <u>and memorable user experience that refects the company s brand identty and values12. Visual design refers to the use of colors, shapes, typography, images, icons, and other graphical elements to create a visual hierarchy, contrast, balance, and harmony on the page13. Visual design afects the user’s percepton, emoton, and atenton, and can communicate the brand’s personality, tone, and message13. For example, Cloud Kicks can use their logo, color scheme, and font to create a recognizable and distnctve visual identty for their portal landing page4. Content design refers to the creaton, organizaton, and presentaton of text, audio, video, and other</u> ’ <u>media to convey the brand s value propositon, story, and informaton to the user15. Content design afects the user’s understanding, interest, and trust, and can communicate the brand’s purpose, benefts, and voice15. For example, Cloud Kicks can use clear, concise, and compelling headlines,</u> subheadings, and body text to highlight their products, services, and customer testimonials on their portal landing page. <u>Interacton design refers to the design of the user interface elements, such as butons, links, menus, forms, and sliders, that enable the user to interact with the page and perform tasks1 . Interacton design afects the user’s behavior, satsfacton, and feedback, and can communicate the brand’s functonality, usability, and responsiveness1 . For example, Cloud Kicks can use intuitve, consistent,</u> and accessible navigation, search, and filtering options to help the user find what they are looking for on their portal landing page. By reviewing and improving these UX elements, Cloud Kicks can ensure that their portal landing page delivers a positive and coherent brand experience to their users, and that their brand identity is translated into the user experience. Reference: <u>The 5 Elements of User Experience Design</u> <u>How to Create a Brand Experience That Works With Your UX</u> <u>Visual Design Basics</u> <u>Use Branding Sets in Experience Builder Content Design: What It Is and Why It Maters</u> [How to Write Effective Web Content for Your Experience Cloud Site] [Interaction Design Basics] [Designing User Interfaces for Experience Cloud Sites]"
  },
  {
    "id": 167,
    "category": "Human-Centered Design",
    "question": "Cloud Kicks is incorporating Relationship Design principles into its business model and customer offerings wherever possible. Which principle would represent their company strategy?",
    "choices": [
      "Reframing products in terms of outputs over outcomes",
      "Prioritizing engagement over number of impressions",
      "Highlighting product benefits over uncovering customer needs **"
    ],
    "correctAnswerText": "Prioritizing engagement over number of impressions",
    "explanation": "The principle that would represent Cloud Kicks’ company strategy is prioritizing engagement over <u>number of impressions. This principle is based on the intenton mindset of Relatonship Design, which means engaging with clear purpose and focusing on the quality of interactons rather than the quantty1. Reframing products in terms of outputs over outcomes (A) is not a Relatonship Design</u> principle, as it does not consider the value or impact of the products for the customers. Highlighting product benefits over uncovering customer needs © is also not a Relationship Design principle, as it does not show empathy or understanding of the customers’ problems or goals. Reference: <u>Embrace the Relatonship Design Mindsets Unit | Salesforce Trailhead</u>"
  },
  {
    "id": 168,
    "category": "Human-Centered Design",
    "question": "A UX Designer wants to communicate the value of diversity, inclusion, and equality in design. Which business outcomes represent these values?",
    "choices": [
      "Inclusive recruitment, lower market share, and less employee turnover",
      "Economic growth, greater market share, and less employee turnover",
      "Critical investing, more employee turnover, and greater market share"
    ],
    "correctAnswerText": "Economic growth, greater market share, and less employee turnover",
    "explanation": "Diversity, inclusion, and equality in design are values that aim to create products, services, and environments that are accessible, welcoming, and fair for all people, regardless of their age, gender, <u>ethnicity, disability, sexual orientaton, religion, or other characteristcs. Diversity, inclusion, and equality in design can also bring positve business outcomes, such as economic growth, greater market share, and less employee turnover12.</u> Economic growth is a business outcome that represents the increase in the value of goods and services produced by an organization or a country over time. Economic growth can be influenced by <u>various factors, such as innovaton, productvity, efciency, and compettveness. Diversity, inclusion, and equality in design can contribute to economic growth by fostering creatvity, innovaton, and problem-solving, as well as by atractng and retaining diverse talent, customers, and partners12.</u> Greater market share is a business outcome that represents the percentage of sales or customers that an organization has in a particular market or industry. Greater market share can indicate the success and competitiveness of an organization, as well as its potential for growth and <u>proftability. Diversity, inclusion, and equality in design can help achieve greater market share by expanding the reach and appeal of products, services, and environments to diverse and underserved markets, as well as by enhancing customer satsfacton, loyalty, and advocacy12.</u> Less employee turnover is a business outcome that represents the rate at which employees leave an organization and are replaced by new ones. Less employee turnover can indicate the stability and <u>quality of an organizaton, as well as its ability to retain and develop its human capital. Diversity, inclusion, and equality in design can help reduce employee turnover by creatng a positve and inclusive work culture, where employees feel valued, respected, and engaged, as well as by providing opportunites for learning, development, and career progression12. Reference: 1: The business value of design | McKinsey 2: The Business Case for Diversity, Equity, and</u> Inclusion - Salesforce.com"
  },
  {
    "id": 169,
    "category": "Discovery",
    "question": "Cloud Kicks has identified a Trusted Advisor persona as their primary focus for the next iteration. Which key business process defining their work should be analyzed to make sure the delivered experience fits their needs?",
    "choices": [
      "Maintaining relationships with existing customers",
      "Managing sales pipeline and forecasting",
      "Customizing and administering Salesforce"
    ],
    "correctAnswerText": "Maintaining relationships with existing customers",
    "explanation": "According to the Salesforce Trailhead, the Trusted Advisor persona spends 3+ hours a day maintaining relationships with existing customers. They upsell products, grow deals, and manage <u>renewals. This persona also spends tme prospectng for new opportunites in existng accounts and gathering requirements from prospects1</u> Therefore, the key business process that defines their work and should be analyzed to make sure the delivered experience fits their needs is maintaining relationships with existing customers. This process involves understanding the customer’s needs, goals, expectations, and satisfaction, as well <u>as providing them with relevant solutons, support, and value. The UX Designer should focus on creatng a user interface that enables the Trusted Advisor to easily access and update customer informaton, communicate and collaborate with customers, and track and measure customer loyalty and retenton23</u> Managing sales pipeline and forecasting: This is not the key business process that defines the work of the Trusted Advisor persona, but rather the Data Expert persona. The Data Expert persona spends 3+ – <u>hours a day on reportng and sales forecastng. They also spend 1 3 hours managing the sales pipeline and tools for the sales team1</u> Customizing and administering Salesforce: This is not the key business process that defines the work of the Trusted Advisor persona, but rather the Sales Leader persona. The Sales Leader persona <u>spends most of their day managing, coaching, and training sales reps. They also spend tme managing tools and processes for sales reps, which includes customizing and administering Salesforce1</u> Reference: <u>Learn About Sales Cloud Personas Unit | Salesforce Trailhead How to Increase Your Sales with Personas for Salesforce Users | RTS Labs How to Use Journey Mapping to Improve Employee Engagement</u>"
  },
  {
    "id": 170,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "How would a UX Designer differentiate between voice and tone?",
    "choices": [
      "Voice reflects personality, and tone Is the way in which one speaks.",
      "Voice reflects frequency and tone is one's pitch.",
      "Voice is how one speaks, and tone reflects personality. **"
    ],
    "correctAnswerText": "Voice reflects personality, and tone Is the way in which one speaks.",
    "explanation": "Voice and tone are two aspects of writing that affect how the reader perceives and responds to the content. Voice is the consistent expression of the writer’s or the brand’s personality, values, and at ude. Voice reflects who the writer or the brand is, and what they stand for. Tone is the variation of the voice depending on the context, audience, and purpose of the content. Tone is the way in which the writer or the brand speaks to the reader, and how they convey their emotions, intentions, <u>and expectatons. Tone can change depending on the situaton, the message, and the reader’s needs and feelings12.</u> For example, at Salesforce, we have a voice that is friendly, helpful, and empowering. We use simple, clear, and conversational language that shows our respect and appreciation for our customers, partners, and community. We also use humor, metaphors, and storytelling to make our content engaging and memorable. However, our tone can vary depending on the type and goal of the content. For instance, when we write instructional content, such as Trailhead modules or user guides, our tone is more informative, instructive, and supportive. We use active voice, imperative mood, and positive feedback to guide the learner and encourage their progress. When we write promotional content, such as blog posts or social media posts, our tone is more persuasive, <u>enthusiastc, and inspiring. We use rhetorical devices, emotonal appeals, and calls to acton to atract the reader and motvate them to take acton34.</u> Therefore, a UX Designer would differentiate between voice and tone by understanding that voice <u>refects personality, and tone is the way in which one speaks. Reference: Voice and Tone - Lightning Design System, How To Create a Voice and Tone Program For Your Brand | Salesforce, Learn Why We Write the Way We Do Unit | Salesforce Trailhead, Write for Trailhead Unit | Salesforce Trailhead</u>"
  },
  {
    "id": 171,
    "category": "UX Fundamentals",
    "question": "In which way could the usability of accordion elements be improved in a mobile environment?",
    "choices": [
      "Use the Back browser button to collapse content.",
      "Move an expanded section to the top of the screen.",
      "Expand the first section by default."
    ],
    "correctAnswerText": "Expand the first section by default.",
    "explanation": "The usability of accordion elements in a mobile environment could be improved by expanding the <u>frst secton by default. This is because it can provide the user with a clear indicaton of what kind of content is hidden in the accordion, and encourage them to explore the rest of the</u> ’ <u>sectons1. Expanding the frst secton by default can also reduce the user s cognitve load, as they do not have to make a decision on which secton to open frst2. Moreover, expanding the frst secton by default can improve the accessibility of the accordion, as it can help screen reader users to understand the structure and purpose of the widget3.</u> Using the Back browser button to collapse content is not a good option, as it can confuse the user <u>and break the expected browser behavior. The Back buton is meant to navigate to the previous page, not to collapse an accordion secton4. Using the Back buton to collapse content can also create navigaton issues, as the user might lose their current page or state4.</u> Moving an expanded section to the top of the screen is also not a good option, as it can disrupt the <u>user’s spatal memory and orientaton. Moving an expanded secton to the top of the screen can</u> <u>change the order and positon of the accordion sectons, which can make it harder for the user to fnd and access the secton they want5. It can also create a jarring and inconsistent user experience, as the user might not expect the content to move around the screen5.</u> Reference: <u>How to design the perfect accordion</u> <u>Accordions: Design guidelines Accessible Accordion - examples and best practces | Aditus Don’t Use The Back Buton To Modify Data Usability of a mobile navigaton consistng mostly of accordions?</u>"
  },
  {
    "id": 172,
    "category": "Testing",
    "question": "A UX Designer at Cloud Kicks is having difficulty getting its developers to see why the design changes would improve the user experience. How should the designer help mitigate pushback from developers?",
    "choices": [
      "A Share research notes from previous projects with them.",
      "Get buy-in from the development lead first and let them persuade others.",
      "Work together on setting up UX Indicators."
    ],
    "correctAnswerText": "Work together on setting up UX Indicators.",
    "explanation": "The best way for the designer to help mitigate pushback from developers is to work together on <u>setng up UX Indicators. UX Indicators are a set of metrics that measure the user experience of a product or feature, such as usability, satsfacton, engagement, and adopton1. By working together</u> on setting up UX Indicators, the designer and the developers can align on the goals and expectations of the design changes, and use data and evidence to evaluate their impact. This can help to reduce the subjective opinions and assumptions that might cause pushback, and foster a collaborative and user-centered culture. Sharing research notes from previous projects with them (A) might not be very helpful, as the research might not be relevant or applicable to the current project, and the developers might not trust or understand the research methods or findings. Getting buy-in from the development lead first and let them persuade others (B) might not be very effective, as it might create a top-down or hierarchical approach that does not involve the developers in the design process, and might make them feel excluded or ignored. Reference: <u>UX Designer Certfcaton Prep: UX Indicators</u>"
  },
  {
    "id": 173,
    "category": "UX Fundamentals",
    "question": "Cloud Kicks wants to drive engagement on its website. Which Salesforce feature should boost B2C engagement?",
    "choices": [
      "Marketing Cloud Personalization",
      "Experience Cloud",
      "Marketing Cloud Account Engagement"
    ],
    "correctAnswerText": "Marketing Cloud Personalization",
    "explanation": "Marketing Cloud Personalization is a Salesforce feature that can boost B2C engagement on Cloud <u>Kicks’ website. Marketng Cloud Personalizaton is a kind of technology soluton that ingests customer engagement and profle data, then — using machine learning and AI — determines relevant messages, segmentaton, and content for each customer, based on their preferences and afnites1. Marketng Cloud Personalizaton can help Cloud Kicks to create personalized and relevant</u> experiences for their website visitors, such as showing them products, offers, or recommendations <u>that match their interests, needs, or behaviors. Marketng Cloud Personalizaton can also help Cloud Kicks to optmize their website performance, such as increasing conversions, retenton, loyalty, and</u> ##### <u>revenue1.</u> Experience Cloud is another Salesforce feature that can help Cloud Kicks to create engaging websites, but it is not the best option for boosting B2C engagement. Experience Cloud is a platform that allows users to build branded digital experiences, such as websites, portals, forums, or mobile apps, that connect customers, partners, and employees with Salesforce data and <u>processes. Experience Cloud can help Cloud Kicks to create interactve and collaboratve websites that integrate with their CRM, but it does not provide the same level of personalizaton and intelligence as Marketng Cloud Personalizaton2.</u> Marketing Cloud Account Engagement is a Salesforce feature that is designed for B2B marketing automation, not B2C engagement. Marketing Cloud Account Engagement, formerly known as Pardot, is a solution that helps users to generate more leads, nurture them through email campaigns, <u>and align sales and marketng eforts. Marketng Cloud Account Engagement can help Cloud Kicks to target and engage potental business customers, but it is not suitable for engaging individual consumers on their website34.</u> <u>Reference: 2: Experience Cloud | Salesforce 3: Marketng Cloud Account Engagement customers are scaling their marketng and reaching more leads faster. Find more leads and convert them more quickly with content that resonates Engage buyers on their terms with tailored, relevant campaigns4 4: Marketng Cloud vs. Marketng Cloud Account Engagement2 1: Personalizaton Engine by Marketng Cloud - Salesforce1</u>"
  },
  {
    "id": 174,
    "category": "UX Fundamentals",
    "question": "A UX Designer wants to customize the end user's Salesforce app experience. Which administrative capability should be used for mobile navigation menu setup?",
    "choices": [
      "Menu tabs can be based on different user types.",
      "Menu tabs visibility is based on user location.",
      "Menu tabs can be Visualforce and Lightning pages."
    ],
    "correctAnswerText": "Menu tabs can be Visualforce and Lightning pages.",
    "explanation": "One of the administrative capabilities that can be used for mobile navigation menu setup is to include Visualforce and Lightning pages as menu tabs. Visualforce and Lightning pages are custom <u>pages that can display data, logic, and interface elements in the Salesforce mobile app. To include Visualforce and Lightning pages as menu tabs, the UX Designer needs to create tabs for those items frst, and then add them to the navigaton menu of the Mobile Only app or the Lightning app12</u> Menu tabs can be based on different user types: This is not an administrative capability that can be used for mobile navigation menu setup, but rather a feature of the Lightning app navigation method. The Lightning app navigation method allows the UX Designer to create different Lightning apps for <u>diferent user types, and assign them to diferent user profles. Each Lightning app can have its own navigaton menu and navigaton bar, which can be customized with the items that are relevant for each user type34</u> Menu tabs visibility is based on user location: This is not an administrative capability that can be used for mobile navigation menu setup, but rather a feature of the geolocation field type. The geolocation field type allows the UX Designer to store the latitude and longitude coordinates of a record, and use them for various purposes, such as displaying maps, calculating distances, or filtering reports. The geolocation field type does not affect the visibility of the menu tabs in the Salesforce mobile app. Reference: <u>Customize the Mobile Only Navigaton Menu in the Salesforce Mobile App Customize a Lightning App Navigaton Menu in the Salesforce Mobile App Create a Lightning App Unit | Salesforce Trailhead Assign a Lightning App to a User Profle Unit | Salesforce Trailhead</u> [Geolocation Custom Field Type - Salesforce Help] [Use Geolocation Fields in Formulas - Salesforce Help]"
  },
  {
    "id": 175,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "Cloud Kicks' development team is working on the build of a new custom component using VS Code. They often have new CSS classes and properties conflicting with the Salesforce Lightning Design System (SLDS), What should simplify working with SLDS in Lightning Components?",
    "choices": [
      "Install SLDS creator from AppExchange",
      "Install SLDS Validator extension for VS Code",
      "Install Lightning Design System Plugin for Sketch"
    ],
    "correctAnswerText": "Install SLDS Validator extension for VS Code",
    "explanation": "The best option to simplify working with SLDS in Lightning Components is to install SLDS Validator <u>extension for VS Code. This extension (salesforcedx-vscode-slds) scans the markup of the components, validates it against the SLDS documentaton, and provides suggestons on how to improve the code1. It also ofers syntax highlightng, code completon, and context awareness for SLDS tokens and utlity classes1. By using this extension, the development team can avoid CSS conficts, follow SLDS best practces, and create consistent and accessible components2.</u> Installing SLDS creator from AppExchange is not a valid option, as there is no such app available on <u>the AppExchange. The AppExchange is a marketplace for Salesforce apps, components, and consultng services, not for VS Code extensions3.</u> Installing Lightning Design System Plugin for Sketch is also not a valid option, as it is not related to VS <u>Code or Lightning Components. Sketch is a design tool that allows users to create wireframes, mockups, and prototypes4. The Lightning Design System Plugin for Sketch is a plugin that provides</u> SLDS components, icons, and styles for Sketch users. It can help designers to create consistent and compatible designs, but it cannot help developers to work with SLDS in VS Code. Reference: ##### <u>SLDS Validator - Visual Studio Marketplace</u> <u>SLDS Validator for VS Code - Lightning Design System AppExchange: Salesforce’s Leading Enterprise Cloud Marketplace Sketch — The digital design toolkit</u> [Lightning Design System Plugin for Sketch]"
  },
  {
    "id": 176,
    "category": "UX Fundamentals",
    "question": "What would it mean for the user when designing perceivable content?",
    "choices": [
      "The content should only be presented In a visual format.",
      "The content should only be presented In an audio format.",
      "The content should be presented in a way that can be convertible between different formats."
    ],
    "correctAnswerText": "The content should be presented in a way that can be convertible between different formats.",
    "explanation": "Designing perceivable content means that the content should be presented in a way that can be convertible between different formats, so that users with different sensory abilities can access it. For example, providing text alternatives for images and videos, captions and transcripts for audio, and audio descriptions for visual content. This way, users who are blind, deaf, or have low vision or hearing can perceive the content using assistive technologies, such as screen readers, braille keyboards, or captions. The content should not only be presented in a visual format (A) or an audio <u>format (B), as that would exclude users who cannot see or hear the content. The content should be adaptable to diferent formats and devices, and follow the Web Content Accessibility Guidelines (WCAG) principle of perceivability12. Reference: Perceivable - Accessibility | MDN</u> <u>What Is Perceivability in Web Accessibility? WCAG Principles Explained</u>"
  },
  {
    "id": 177,
    "category": "Testing",
    "question": "Cloud Kicks' Sales team needs In-App Guidance for key functions and processes so they can maximize their time. In which way should a UX Designer customize the Salesforce Help Menu to meet this request?",
    "choices": [
      "Show a site map of all the content.",
      "Create a docked prompt based on new feature rollouts.",
      "Provide links to external resources, such as training videos or a company dictionary."
    ],
    "correctAnswerText": "Show a site map of all the content.",
    "explanation": "<u>Confrmaton bias is the tendency to seek, interpret, and remember informaton that confrms one’s preexistng beliefs or hypotheses, while ignoring or discountng informaton that contradicts them1.</u> Confirmation bias can affect user feedback sessions by influencing how the researcher designs the <u>test, asks the questons, observes the behavior, and analyzes the data of the users. Confrmaton bias can lead to inaccurate or incomplete insights, and ultmately to poor design decisions2.</u> One way to avoid confirmation bias in user feedback sessions is to allow the user to explore the application without specific questions regarding which tasks to perform. This can help the researcher to observe the user’s natural and spontaneous interaction with the application, without imposing any expectations or assumptions on them. This can also help the user to express their honest opinions and feelings about the application, without being influenced by the researcher’s questions <u>or suggestons. This can result in more authentc and unbiased feedback, and more reliable and valid insights3.</u> Asking open-ended questions staying away from questions regarding feelings is not a good way to avoid confirmation bias in user feedback sessions, because it can limit the depth and richness of the feedback, and miss the opportunity to understand the user’s emotions and motivations. Open-ended questions are questions that allow the user to answer in their own words, rather than choosing from a predefined set of options. Open-ended questions are useful for eliciting more detailed and nuanced feedback, and for exploring the user’s thoughts and feelings about the application. However, asking open-ended questions alone is not enough to prevent confirmation bias, as the researcher may still unconsciously frame the questions in a way that leads the user to confirm their hypotheses, or <u>interpret the answers in a way that supports their beliefs. Asking questons regarding feelings is also important, as it can help the researcher to understand the user’s emotonal response to the applicaton, and how it afects their satsfacton, engagement, and loyalty4.</u> Asking specific questions about known pain points to confirm your hypothesis is a bad way to avoid confirmation bias in user feedback sessions, because it can introduce the researcher’s bias into the feedback process, and influence the user’s perception and behavior. Asking specific questions about known pain points can lead the researcher to focus only on the information that confirms their hypothesis, and ignore or dismiss the information that challenges or contradicts it. It can also lead the user to pay more attention to the pain points that the researcher mentions, and overlook or <u>downplay the other aspects of the applicaton. This can result in skewed and distorted feedback, and misleading and invalid insights5.</u> <u>Reference: 1: Confrmaton bias - Wikipedia 2: How Confrmaton Bias can afect user research | by Caroline Galipeau | UX Collectve 3: 11 Types of Cognitve Biases to Avoid in User Research | Maze 4: How to Ask Good Questons in User Research | by Nick Babich | UX Planet 5: How to Avoid</u> Confirmation Bias in User Research | by Sarah Doody | Medium"
  },
  {
    "id": 178,
    "category": "Testing",
    "question": "Following a human-centered design process approach, Cloud Kicks is preparing a user feedback session for an app that is not performing as anticipated. In what way could confirmation bias be avoided?",
    "choices": [
      "Allow the user to explore the application without specific questions regarding which tasks to perform.",
      "Ask open-ended questions staying away from questions regarding feelings.",
      "Ask specific questions about known pain points to confirm your hypothesis."
    ],
    "correctAnswerText": "Ask open-ended questions staying away from questions regarding feelings.",
    "explanation": "A docked prompt is a type of In-App Guidance that can be used to provide contextual help and guidance to the users in the Salesforce app. A docked prompt is a small pop-up window that appears at the bottom of the screen, and can contain text, images, links, or videos. A docked prompt can be <u>triggered by various events, such as opening a page, clicking a buton, or completng an acton. A docked prompt can also be dismissed by the user, or set to expire afer a certain tme or date12</u> A UX Designer can customize the Salesforce Help Menu to meet the request of Cloud Kicks’ Sales team by creating a docked prompt based on new feature rollouts. This way, the UX Designer can: <u>Inform the users about the new features and how they can beneft from them. For example, the UX Designer can create a docked prompt that introduces the new Einstein Opportunity Scoring feature, and explains how it can help the users prioritze their opportunites and close more deals3 Guide the users through the steps and best practces to use the new features. For example, the UX Designer can create a docked prompt that shows the users how to access and confgure the new Einstein Opportunity Scoring feature, and how to interpret and act on the scores3 Engage the users and encourage them to explore and adopt the new features. For example, the UX Designer can create a docked prompt that includes a link to a video tutorial, a Trailhead module, or a feedback survey about the new Einstein Opportunity Scoring feature3</u> Show a site map of all the content: This is not a way to customize the Salesforce Help Menu to meet the request of Cloud Kicks’ Sales team, because a site map of all the content is not a type of In-App <u>Guidance, and it does not provide specifc and tmely help and guidance for the users. A site map of all the content is a visual representaton of the structure and hierarchy of a website or app, and it can</u> - <u>be useful for planning and designing the user interface, but not for providing In App Guidance4</u> Provide links to external resources, such as training videos or a company dictionary: This is not a way to customize the Salesforce Help Menu to meet the request of Cloud Kicks’ Sales team, because providing links to external resources is not a type of In-App Guidance, and it does not provide <u>contextual and interactve help and guidance for the users. Providing links to external resources is a way to supplement the Salesforce Help Menu with additonal informaton and resources, but not to create In-App Guidance5</u> Reference: <u>Create In-App Guidance Unit | Salesforce Trailhead</u> <u>In-App Guidance - Salesforce Help Create a Docked Prompt for New Feature Rollouts Unit | Salesforce Trailhead What is a Sitemap? - Interacton Design Foundaton</u> - <u>Customize the Help Menu in Lightning Experience Salesforce Help</u>"
  },
  {
    "id": 179,
    "category": "Discovery",
    "question": "Which elements of visual design should be used to better translate style and branding guidelines?",
    "choices": [
      "Typography, Color, Imagery",
      "Wireframes, Personas, Blueprints",
      "Sketching, Wireframes, Storyboards"
    ],
    "correctAnswerText": "Typography, Color, Imagery",
    "explanation": "In visual design, especially within the context of translating style and branding guidelines, certain elements play crucial roles in ensuring that the design effectively communicates the intended brand identity and aesthetic. These elements include: Typography: The choice of fonts and how text is styled and arranged can significantly impact the brand's voice and how content is perceived by the audience. Typography can convey feelings, create hierarchy, and guide the user's attention through the design. Color: Color schemes are fundamental in visual design as they can evoke emotions, communicate brand values, and improve the user's experience by creating visual interest and guiding focus. Imagery: The use of images, icons, illustrations, and other visual media must align with the brand's style and values. Imagery can help tell a brand's story, convey complex information quickly, and connect with users on an emotional level. Options B and C, such as Wireframes, Personas, Blueprints, Sketching, and Storyboards, are crucial in the early stages of the design process for conceptualization and planning but do not directly translate style and branding guidelines in the same way that typography, color, and imagery do."
  },
  {
    "id": 180,
    "category": "Discovery",
    "question": "A UX Designer has identified the Case Solver as a key user persona for Cloud Kicks' Service Cloud instance. Which activities should be considered while designing the Case Solver experience?",
    "choices": [
      "troubleshooting customer issues and logging activities",
      "training other agents and editing knowledge articles",
      "Viewing the status of cases and analyzing campaign metrics"
    ],
    "correctAnswerText": "troubleshooting customer issues and logging activities",
    "explanation": "When designing the experience for a 'Case Solver' user persona, especially in the context of Cloud Kicks' Service Cloud instance, the activities to consider should revolve around the primary responsibilities and tasks of this role. For a Case Solver, these would include: Troubleshooting customer issues: This involves identifying, analyzing, and solving problems reported by customers. The design should facilitate easy access to relevant information, tools for effective problem-solving, and a seamless workflow for diagnosing issues. Logging activities: Keeping a detailed record of interactions, solutions provided, and any follow-up actions is crucial. The user interface should support efficient logging and tracking of activities to ensure accountability and facilitate continuous improvement in customer service. While training other agents and editing knowledge articles (option B) and viewing the status of cases and analyzing campaign metrics (option C) are important in certain contexts, they do not directly align with the core activities of a Case Solver persona focused on direct customer support and problem resolution. Reference: Salesforce's own documentation, such as the Salesforce Service Cloud User Guide, provides insights into designing user experiences for specific roles within the platform. It offers best practices and recommendations for optimizing the interface and workflows for various user personas, including those involved in case management and customer support."
  },
  {
    "id": 181,
    "category": "Declarative Design",
    "question": "Cloud Kicks is considering using Learning Paths functionality to assign learning content to employees as part of its onboarding process. Which feature could be assigned to learners'",
    "choices": [
      "Trailhead modules",
      "Hands-on challenges",
      "Superbadges"
    ],
    "correctAnswerText": "Trailhead modules",
    "explanation": "Salesforce's Learning Paths functionality is designed to personalize the learning experience within the Salesforce environment by guiding users through curated content relevant to their role and learning objectives. For employees, especially as part of an onboarding process, the following feature could be particularly useful: Trailhead modules: Trailhead is Salesforce's online learning platform that offers modules covering a wide range of topics related to Salesforce products, best practices, and general business skills. Assigning Trailhead modules through Learning Paths allows for structured and guided learning tailored to the employee's specific needs and roles, making it an ideal choice for onboarding. While hands-on challenges (option B) and Superbadges (option C) are also part of the Trailhead ecosystem and valuable for learning, they are more suited for testing and validating skills after completing foundational modules, rather than as initial assigned learning content in an onboarding process. Reference: Salesforce Trailhead provides extensive resources and guides on how to use Trailhead for learning and development, including setting up Learning Paths for employees. The Trailhead website offers detailed information on modules, hands-on challenges, and Superbadges, which can be leveraged to create a comprehensive onboarding experience."
  },
  {
    "id": 182,
    "category": "Declarative Design",
    "question": "Cloud Kicks has an existing customer Experience Cloud portal that is performing well. Which has the highest probability of increasing customer engagement?",
    "choices": [
      "Choosing personalized branding",
      "Customizing page layouts",
      "Recognizing peers with badges"
    ],
    "correctAnswerText": "Recognizing peers with badges",
    "explanation": "In the context of an existing Customer Experience Cloud portal that is already performing well, the goal is to further increase customer engagement by adding elements that encourage interaction and participation. Recognizing peers with badges is a highly effective way to achieve this because: Personalization and Gamification: Badges introduce an element of gamification and personalization, which can significantly increase engagement. Users are motivated to participate and contribute to the community when they see a tangible recognition of their efforts and achievements. Community Building: Recognizing contributions with badges helps in building a stronger community by highlighting active members and encouraging others to contribute. It fosters a sense of belonging and appreciation among users. While personalized branding (option A) and customizing page layouts (option B) can enhance the show assigned and open cases. C. Add a Case inbox component to the page configured to show assigned and open cases. #### **Answer: B** Explanation: To optimize Salesforce for the IT help desk team at Cloud Kicks, enabling them to quickly resolve queued cases, adding a List View component to the home page is the most effective approach because: Customization and Relevance: A List View component can be customized to show a list view that is specifically filtered to display cases that are both assigned to the team members and are currently open. This ensures that team members immediately see the most relevant cases as soon as they log in, without needing to navigate through the Salesforce interface. Efficiency: Having this component on the home page saves time and clicks, making the process of identifying and accessing pending cases more efficient, which is crucial for quickly resolving issues. While options A (Case Assignment component) and C (Case inbox component) could also present cases to team members, the List View component's ability to be customized with specific filters offers a more targeted approach to showing the most pertinent cases directly on the home page. Reference: For more details on optimizing Salesforce for specific team roles, Salesforce's Help Documentation and Developer Guides offer extensive resources on using components like List Views to enhance user experience and efficiency. These guides provide step-by-step instructions on customizing the Salesforce interface to meet the needs of different teams within an organization."
  },
  {
    "id": 183,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "After conducting user interviews, a UX Designer finds that an equal amount of users prefer to use the Comfy density setting as the Compact density setting while viewing record details. Which approach should be avoided by developers when building custom components to make sure their components take advantage of this setting?",
    "choices": [
      "Using the varSpacingMedium design token in CSS to set spacing",
      "Using REM_based spacing values when styling components.",
      "Using existing Lightning Components such as the card or page header"
    ],
    "correctAnswerText": "Using REM_based spacing values when styling components.",
    "explanation": "When developers are building custom components in Salesforce and need to ensure that these components adapt to user preferences for density settings (Comfy or Compact), they should avoid using REM-based spacing values. This is because REM-based spacing does not automatically adjust based on the density setting chosen by the user, leading to a lack of consistency with the rest of the Salesforce UI, which does adapt to these settings. Instead, developers should: A) Use the varSpacingMedium design token in CSS, as Salesforce Lightning Design System (SLDS) design tokens are context-aware and can adjust their values based on the density setting, ensuring a consistent user experience across different user preferences. C) Use existing Lightning Components such as the card or page header, which are pre-built to adapt to density settings, ensuring that custom components align with the overall Salesforce UI and respect user settings for density. Reference: Salesforce Lightning Design System (SLDS) documentation provides guidelines on using design tokens and building responsive components that respect user settings like density preferences. You can find more information on the official Salesforce Developers website or the SLDS documentation section."
  },
  {
    "id": 184,
    "category": "Salesforce Lightning Design System (SLDS)",
    "question": "A UX Designer needs to restyle a <lightning-modal /> Lightning Web Component (LWC) to meet brand guidelines. Which key consideration about that LWC should the UX designer be aware of?",
    "choices": [
      "Only the main Lightning Modal component can be styled using styling hooks.",
      "Only the body, footer, and header helper components can be styled using styling hooks.",
      "The model cannot be styled using styling hooks"
    ],
    "correctAnswerText": "Only the main Lightning Modal component can be styled using styling hooks.",
    "explanation": "When restyling a <lightning-modal /> Lightning Web Component (LWC) to meet brand guidelines, it's important to know that styling customization options may be limited. Specifically, only the main Lightning Modal component can be styled using styling hooks. This limitation means that while you can apply brand-specific styles to the overall modal component using styling hooks, the finer control over the modal's internal sections (like the body, footer, and header) might not be directly accessible through these hooks. This constraint necessitates a strategic approach to styling, focusing on the aspects of the modal that can be customized to align with brand guidelines while understanding the inherent limitations. Reference: For more information on styling Lightning Web Components and the use of styling hooks, the Salesforce Developer Documentation on Lightning Web Components and the Salesforce Lightning Design System (SLDS) offers detailed guidance and best practices."
  },
  {
    "id": 185,
    "category": "Human-Centered Design",
    "question": "What is a benefit of inclusive design?",
    "choices": [
      "Reducing friction for users in achieving their goals",
      "Tailoring a solution to one type of user",
      "Creating a lowest-common-denominator design"
    ],
    "correctAnswerText": "Reducing friction for users in achieving their goals",
    "explanation": "Inclusive design is a methodology aimed at creating products that are accessible to as many people as possible, regardless of their abilities or circumstances. The benefit of inclusive design is that it focuses on reducing friction for users in achieving their goals by: Considering a wide range of human diversity, including ability, language, culture, gender, age, and other forms of human difference. Identifying and eliminating unnecessary barriers that might prevent people from effectively using a product or service. Ensuring that products and services can be used by everyone, to the greatest extent possible, without the need for adaptation. Inclusive design does not mean tailoring a solution to one type of user (B) or creating a lowestcommon-denominator design that meets only the most basic needs of all users (C). Instead, it seeks to understand and address the needs of a broad audience to create more usable and accessible experiences for everyone. Reference: The Interaction Design Foundation provides extensive resources on inclusive design, its principles, and how to apply them in the design process. These resources offer valuable insights into creating designs that are accessible and beneficial to a wide audience."
  },
  {
    "id": 186,
    "category": "Discovery",
    "question": "A UX Designer determines that the usability of their company's Salesforce org could be improved if there was a tight relationship between the objects Container and Container Bids. For example, Container Bids should be deleted automatically whenever its associated Container is deleted. Which type of relationship should be used to optimize the link between Container and Container Bids?",
    "choices": [
      "Master-Detail",
      "Hierarchical Lookup",
      "Many-to-one-Lookup"
    ],
    "correctAnswerText": "Master-Detail",
    "explanation": "To optimize the relationship between two objects in Salesforce, such as Container and Container Bids, where there is a need for a tight relationship and cascading delete functionality, a Master-Detail relationship is most suitable. This type of relationship has the following characteristics: Cascading Delete: When a record in the master (or parent) object is deleted, all related detail (or child) records are automatically deleted. This ensures data integrity and aligns with the requirement that Container Bids should be deleted when their associated Container is deleted. Tight Coupling: A Master-Detail relationship creates a strong linkage between the two objects, where the detail (child) record's existence is dependent on the master (parent) record. This is appropriate for scenarios where the child record should not exist without its parent. Options B (Hierarchical Lookup) and C (Many-to-one Lookup) do not provide the same level of dependency and cascading delete functionality inherent in a Master-Detail relationship. Reference: Salesforce's official documentation provides extensive information on different types of relationships between objects, including Master-Detail relationships. The Salesforce Developer Documentation is a valuable resource for understanding how to set up and use these relationships to ensure data integrity and optimize application design."
  },
  {
    "id": 187,
    "category": "Discovery",
    "question": "Cloud Kicks has already identified its user personas and is working with a UX Designer who wants to synthesize what the company knows about its users to create a shared understanding with the rest of the organization. Which tool should the designer use?",
    "choices": [
      "Executive Summary",
      "Empathy Map",
      "Prioritize Backlog"
    ],
    "correctAnswerText": "Empathy Map",
    "explanation": "An Empathy Map is a tool used in UX design to synthesize and articulate what a design team knows about a user group. It helps in creating a shared understanding of user needs within an organization. The key features of an Empathy Map include: User Insights: It captures what users say, think, do, and feel, providing a holistic view of their experiences and perspectives. This helps in understanding users at a deeper level. Shared Understanding: By visualizing user at udes and behaviors, an Empathy Map facilitates a common understanding among team members and stakeholders, ensuring that design decisions are aligned with user needs. An Executive Summary (option A) provides a high-level overview of project objectives and outcomes but does not delve into user-centric insights. Prioritizing a Backlog (option C) is more about organizing and prioritizing tasks and features rather than synthesizing user research findings. Reference: For guidelines on creating and using Empathy Maps, UX design resources such as the Nielsen Norman Group and the Interaction Design Foundation offer articles and guides on this and other UX research synthesis tools. These resources explain how to effectively use Empathy Maps to gain insights into user needs and foster empathy within design teams. ### **<mark>Thank You for Purchasing USER-EXPERIENCEDESIGNER PDF</mark>** ## _<u><mark>[Offer]</mark></u>_ <u><mark>Improve Your Exam</mark></u> <mark>Preparation with our Practice Exam Software</mark> <mark>Use Coupon “20OFF” for special 20% discount on the purchase of Practice Test Software. Practice Exam Software helps you validate your preparation in a simulated exam environment.</mark> #### **<mark>Download Free Practce Test Demo from our site:</mark>** - - <u>http://www.justcerts.com/salesforce/USER EXPERIENCE DESIGNER.html</u>"
  }
];

async function fetchAndParseQuestions() {
  const loadingFill = document.getElementById("loading-fill");
  if (loadingFill) loadingFill.style.width = "100%";
  return [...QUESTIONS];
}

// ============================================================
// SECTION 3: EVALUATION & SELECTION ENGINE
// ============================================================

/**
 * Normalizes answer text string for exact comparison.
 */
function cleanText(txt) {
  return typeof txt === "string" ? txt.trim() : "";
}

/**
 * Checks whether the user's selected choice(s) match the correct answer(s).
 * Supports both single-choice (string) and multi-choice (array) questions.
 */
function isAnswerCorrect(q, userSelection) {
  if (!userSelection) return false;

  const selectedArr = Array.isArray(userSelection) ? userSelection : [userSelection];

  if (Array.isArray(q.correctAnswerText)) {
    if (selectedArr.length !== q.correctAnswerText.length) return false;
    const targetNorm = q.correctAnswerText.map(cleanText).sort();
    const userNorm = selectedArr.map(cleanText).sort();
    return targetNorm.every((val, idx) => val === userNorm[idx]);
  } else {
    const singleUserStr = cleanText(selectedArr[0] || "");
    return singleUserStr === cleanText(q.correctAnswerText);
  }
}

/**
 * Helper to check if a specific choice is included in correct answers.
 */
function isChoiceCorrect(q, choiceText) {
  const cleanedChoice = cleanText(choiceText);
  if (Array.isArray(q.correctAnswerText)) {
    return q.correctAnswerText.some(target => cleanText(target) === cleanedChoice);
  }
  return cleanText(q.correctAnswerText) === cleanedChoice;
}

/**
 * Helper to check if user selected a given choice text.
 */
function isChoiceSelected(qid, choiceText) {
  const userAns = state.answers[qid];
  if (!userAns) return false;
  const cleanedChoice = cleanText(choiceText);
  const arr = Array.isArray(userAns) ? userAns : [userAns];
  return arr.some(item => cleanText(item) === cleanedChoice);
}

// ============================================================
// SECTION 4: DUAL-SHUFFLE ENGINE (Fisher-Yates)
// ============================================================

function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestions(questions) {
  return fisherYatesShuffle([...questions]);
}

function shuffleOptions(question) {
  const choicesCopy = [...question.choices];
  fisherYatesShuffle(choicesCopy);
  return choicesCopy;
}

function generateShuffleMaps(questions) {
  questions.forEach(q => {
    state.shuffleMap[q.id] = shuffleOptions(q);
  });
}

// ============================================================
// SECTION 5: TAB SYSTEM
// ============================================================

function renderTabButtons() {
  const nav = $(".tab-nav");
  if (!nav) return;
  nav.innerHTML = "";

  const tabs = [
    { label: "Dashboard", icon: "📊" },
    { label: "Discovery", weight: "13%" },
    { label: "UX Fundamentals", weight: "16%" },
    { label: "Human-Centered Design", weight: "12%" },
    { label: "Declarative Design", weight: "27%" },
    { label: "Testing", weight: "11%" },
    { label: "SLDS", weight: "21%" },
    { label: "Full Exam Simulator", icon: "🎯" }
  ];

  tabs.forEach((tab, i) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (i === 0 ? " active" : "");
    btn.dataset.tab = i;

    let countBadge = "";
    if (i > 0 && i < 7) {
      const count = state.questions.filter(q => q.category === TAB_CATEGORIES[i]).length;
      countBadge = `<span class="tab-badge">${count}</span>`;
    } else if (i === 7) {
      countBadge = `<span class="tab-badge">${state.questions.length}</span>`;
    }

    btn.innerHTML = `${tab.icon || ""}${tab.label}${tab.weight ? ` (${tab.weight})` : ""}${countBadge}`;
    nav.appendChild(btn);
  });
}

function setActiveTab(index) {
  state.activeTab = index;
  $$(".tab-btn").forEach((btn, i) => btn.classList.toggle("active", i === index));
  $$(".tab-pane").forEach((pane, i) => pane.classList.toggle("active", i === index));
}

// ============================================================
// SECTION 6: DASHBOARD RENDERING
// ============================================================

function renderDashboard() {
  const pane = document.getElementById("tab-0");
  if (!pane) return;

  const topicList = [
    { name: CATEGORIES.DISCOVERY, weight: "13%", desc: "Research methodologies, requirement gathering, key UX personas, value proposition.", color: "var(--cat-agents)" },
    { name: CATEGORIES.UX_FUNDAMENTALS, weight: "16%", desc: "UX defining methods, corporate branding/styling, accessibility & design principles, mobile UX fundamentals.", color: "var(--cat-prompt)" },
    { name: CATEGORIES.HUMAN_CENTERED_DESIGN, weight: "12%", desc: "Incorporating HCD into solutions, inclusive design principles.", color: "var(--cat-data)" },
    { name: CATEGORIES.DECLARATIVE_DESIGN, weight: "27%", desc: "Object architecture & UX, information presentation & hierarchy, user efficiency features, global configurations, onboarding/support, branding.", color: "var(--cat-testing)" },
    { name: CATEGORIES.TESTING, weight: "11%", desc: "End-user validation & testing methods, testing techniques, managing design changes.", color: "var(--cat-gov)" },
    { name: CATEGORIES.SLDS, weight: "21%", desc: "SLDS concepts & purpose, out-of-the-box Lightning Experience design, customized component functionality.", color: "var(--cat-multi)" }
  ];

  const totalQuestions = state.questions.length;

  pane.innerHTML = `
    <div class="dashboard-grid">
      <div class="dash-card">
        <h2>📋 Exam Overview</h2>
        <p>Salesforce Certified User Experience (UX) Designer</p>
        <div class="stat-row">
          <div class="stat-box">
            <div class="stat-value">60</div>
            <div class="stat-label">Questions</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">105</div>
            <div class="stat-label">Minutes</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">65%</div>
            <div class="stat-label">Passing Score</div>
          </div>
        </div>
        <p style="font-size:.8rem;color:var(--text-muted);margin-top:12px">
          Multiple-choice format across 6 official domains. This simulator contains ${totalQuestions} practice questions with multi-select support and real-time score tracking.
        </p>
      </div>

      <div class="dash-card">
        <h2>🎯 Your Progress</h2>
        <p>Track your study progress across all sections.</p>
        <div class="stat-row">
          <div class="stat-box">
            <div class="stat-value" id="dash-answered">0</div>
            <div class="stat-label">Answered</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" id="dash-correct">0</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="stat-box">
            <div class="stat-value" id="dash-score">—</div>
            <div class="stat-label">Score</div>
          </div>
        </div>
      </div>

      <div class="dash-card full-width">
        <h3>📚 Exam Blueprint Breakdown</h3>
        <p>The UX Designer exam covers 6 official sections. Click each category tab to practice.</p>
        <ul class="topic-checklist">
          ${topicList.map((t, idx) => {
    const count = state.questions.filter(q => q.category === t.name).length;
    return `
            <li>
              <input type="checkbox" id="chk-${idx}">
              <div>
                <strong>${t.name}</strong><br>
                <span style="font-size:.78rem;color:var(--text-muted)">${t.desc}</span>
              </div>
              <span class="topic-weight" style="color:${t.color}">${t.weight} · ${count} Qs</span>
            </li>`;
  }).join("")}
        </ul>
      </div>

      <div class="dash-card full-width">
        <h3>📈 Category Progress</h3>
        <p>Your completion rate per study domain.</p>
        <div class="cat-progress-grid">
          ${topicList.map((t, idx) => {
    const catId = `cat-progress-${idx}`;
    return `
            <div class="cat-progress-item" style="border-left-color:${t.color}">
              <div class="cp-label">${t.name}</div>
              <div class="cp-bar"><div class="cp-fill" id="${catId}-fill" style="background:${t.color}"></div></div>
              <div class="cp-text" id="${catId}-text">0% complete</div>
            </div>`;
  }).join("")}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SECTION 7: QUIZ RENDERING
// ============================================================

function renderAllQuizTabs() {
  for (let i = 1; i <= 6; i++) {
    const cat = TAB_CATEGORIES[i];
    const questions = state.questions.filter(q => q.category === cat);
    renderQuizTab(i, cat, questions);
  }
  renderQuizTab(7, `Full ${state.questions.length}-Question Simulator`, [...state.questions]);
}

function getTabQuestions(tabIndex) {
  if (tabIndex === 7) return [...state.questions];
  const cat = TAB_CATEGORIES[tabIndex];
  return state.questions.filter(q => q.category === cat);
}

window.shuffleTab = function (tabIndex) {
  const title = tabIndex === 7
    ? `Full ${state.questions.length}-Question Simulator`
    : TAB_CATEGORIES[tabIndex];
  const questions = getTabQuestions(tabIndex);
  const shuffled = shuffleQuestions(questions);
  generateShuffleMaps(shuffled);
  renderQuizTab(tabIndex, title, shuffled);
  restoreSubmittedState(tabIndex);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function restoreSubmittedState(tabIndex) {
  const pane = document.getElementById(`tab-${tabIndex}`);
  if (!pane) return;

  const cards = pane.querySelectorAll(".question-card");
  cards.forEach(card => {
    const qid = parseInt(card.dataset.qid);
    if (!state.submitted[qid]) return;

    const q = state.questions.find(x => x.id === qid);
    if (!q) return;

    const userAns = state.answers[qid];
    const isCorrect = isAnswerCorrect(q, userAns);

    if (state.mode === "study") {
      card.classList.add(isCorrect ? "answered-correct" : "answered-incorrect");
      const options = card.querySelectorAll(".option-item");
      options.forEach(opt => {
        const optText = opt.querySelector(".option-text").textContent.trim();
        opt.classList.add("disabled");
        if (isChoiceCorrect(q, optText)) {
          opt.classList.add("correct");
        } else if (isChoiceSelected(qid, optText)) {
          opt.classList.add("incorrect");
        }
      });
      const btn = card.querySelector(`.btn-submit`);
      if (btn) btn.style.display = "none";
      const explanation = card.querySelector(`.explanation-panel`);
      if (explanation) explanation.classList.add("visible");
    } else {
      const btn = card.querySelector(`.btn-submit`);
      if (btn) {
        btn.textContent = "✓ Saved";
        btn.disabled = true;
        btn.classList.remove("primary");
        btn.classList.add("secondary");
      }
      const options = card.querySelectorAll(".option-item");
      options.forEach(opt => {
        const optText = opt.querySelector(".option-text").textContent.trim();
        opt.classList.toggle("selected", isChoiceSelected(qid, optText));
      });
    }
  });
}

function renderQuizTab(tabIndex, title, questions) {
  const pane = document.getElementById(`tab-${tabIndex}`);
  if (!pane) return;

  const shuffleBtn = `<button class="btn-shuffle" onclick="shuffleTab(${tabIndex})" title="Shuffle question order and option positions">🔀 Shuffle</button>`;

  pane.innerHTML = `
    <div class="section-header">
      <h2>${title}</h2>
      <div class="section-header-actions">
        ${shuffleBtn}
        <span class="section-progress" id="progress-${tabIndex}">0 / ${questions.length} Answered</span>
      </div>
    </div>
    <div class="quiz-container" id="quiz-${tabIndex}">
      ${questions.map(q => renderQuestionCard(q)).join("")}
    </div>
  `;
}

/**
 * Renders a single question card.
 * Uses shuffled options from state.shuffleMap if available, else original choices.
 */
function renderQuestionCard(q) {
  let displayOptions = state.shuffleMap[q.id];
  if (!displayOptions) {
    displayOptions = [...q.choices];
  }

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const isExamMode = state.mode === "exam";
  const actionsStyle = isExamMode ? "display: none;" : "";
  const isMultiSelect = Array.isArray(q.correctAnswerText);

  return `
    <div class="question-card" id="qcard-${q.id}" data-qid="${q.id}">
      <div class="question-header">
        <div class="question-number">Q${q.id}</div>
        <div class="question-body">
          <div class="question-text">
            ${q.question}
            ${isMultiSelect ? ' <span class="multi-select-tag" style="font-size:0.75rem; background:var(--sf-blue-wash); color:var(--sf-blue-primary); padding:2px 8px; border-radius:12px; margin-left:6px; font-weight:600;">(Multi-Select)</span>' : ''}
          </div>
        </div>
      </div>
      <div class="options-list" id="options-${q.id}">
        ${displayOptions.map((optText, idx) => {
    const letter = LETTERS[idx] || String.fromCharCode(65 + idx);
    const isSelected = isChoiceSelected(q.id, optText);
    return `
            <div class="option-item ${isSelected ? 'selected' : ''}" data-qid="${q.id}" data-idx="${idx}" onclick="selectOption(${q.id},${idx})">
              <div class="${isMultiSelect ? 'option-checkbox' : 'option-radio'}"></div>
              <div class="option-letter">${letter}</div>
              <div class="option-text">${optText}</div>
            </div>
          `;
  }).join("")}
      </div>
      <div class="question-actions" id="actions-${q.id}" style="${actionsStyle}">
        <button class="btn-submit primary" id="submit-${q.id}" ${(!state.answers[q.id] || state.answers[q.id].length === 0) ? 'disabled' : ''} onclick="submitAnswer(${q.id})">Submit Answer</button>
      </div>
      <div class="explanation-panel" id="explanation-${q.id}">
        <h4>💡 Explanation</h4>
        <p>${q.explanation}</p>
      </div>
    </div>
  `;
}

// ============================================================
// SECTION 8: ANSWER SELECTION & SUBMISSION
// ============================================================

window.selectOption = function (qid, selectedIdx) {
  if (state.submitted[qid] && state.mode === "study") return;

  const q = state.questions.find(x => x.id === qid);
  if (!q) return;

  const activeTabPane = $(`#tab-${state.activeTab}`);
  if (!activeTabPane) return;

  const optionEl = activeTabPane.querySelector(`#options-${qid} .option-item[data-idx="${selectedIdx}"]`);
  if (!optionEl) return;

  const selectedText = optionEl.querySelector(".option-text").textContent.trim();
  const isMultiSelect = Array.isArray(q.correctAnswerText);

  if (!state.answers[qid]) {
    state.answers[qid] = [];
  } else if (!Array.isArray(state.answers[qid])) {
    state.answers[qid] = [state.answers[qid]];
  }

  if (isMultiSelect) {
    const existingIndex = state.answers[qid].findIndex(item => cleanText(item) === cleanText(selectedText));
    if (existingIndex !== -1) {
      state.answers[qid].splice(existingIndex, 1);
    } else {
      state.answers[qid].push(selectedText);
    }
  } else {
    state.answers[qid] = [selectedText];
  }

  // Synchronize UI across option elements for this card
  const cards = $$(`#qcard-${qid}`);
  cards.forEach(card => {
    const options = card.querySelectorAll(`.option-item`);
    options.forEach(opt => {
      const optText = opt.querySelector(".option-text").textContent.trim();
      const isSelected = isChoiceSelected(qid, optText);
      opt.classList.toggle("selected", isSelected);
    });

    const btn = card.querySelector(`#submit-${qid}`);
    if (btn && state.mode === "study") {
      btn.disabled = (state.answers[qid].length === 0);
    }
  });

  if (state.mode === "exam") {
    state.submitted[qid] = (state.answers[qid].length > 0);
    updateScoreMatrix();
    updateTabProgress();
  }
};

window.submitAnswer = function (qid) {
  if (state.submitted[qid]) return;

  const q = state.questions.find(x => x.id === qid);
  if (!q) return;

  const userAns = state.answers[qid];
  if (!userAns || userAns.length === 0) return;

  const isCorrect = isAnswerCorrect(q, userAns);

  if (state.mode === "exam") {
    state.submitted[qid] = true;
    const cards = $$(`#qcard-${qid}`);
    cards.forEach(card => {
      const btn = card.querySelector(`#submit-${qid}`);
      if (btn) {
        btn.textContent = "✓ Saved";
        btn.disabled = true;
        btn.classList.remove("primary");
        btn.classList.add("secondary");
      }
    });
    updateScoreMatrix();
    updateTabProgress();
    return;
  }

  // Study Mode: immediate visual feedback
  state.submitted[qid] = true;

  const cards = $$(`#qcard-${qid}`);
  cards.forEach(card => {
    card.classList.add(isCorrect ? "answered-correct" : "answered-incorrect");

    const options = card.querySelectorAll(`.option-item`);
    options.forEach(opt => {
      const optText = opt.querySelector(".option-text").textContent.trim();
      opt.classList.add("disabled");

      if (isChoiceCorrect(q, optText)) {
        opt.classList.add("correct");
      } else if (isChoiceSelected(qid, optText)) {
        opt.classList.add("incorrect");
      }
    });

    const btn = card.querySelector(`#submit-${qid}`);
    if (btn) btn.style.display = "none";

    const explanation = card.querySelector(`#explanation-${qid}`);
    if (explanation) explanation.classList.add("visible");
  });

  updateScoreMatrix();
  updateTabProgress();
};

// ============================================================
// SECTION 9: SCORE MATRIX & PROGRESS
// ============================================================

function updateScoreMatrix() {
  const totalQuestions = state.questions.length;
  const totalAnswered = Object.keys(state.submitted).filter(k => state.submitted[k]).length;
  let correctCount = 0;

  Object.keys(state.submitted).forEach(qid => {
    if (!state.submitted[qid]) return;
    const q = state.questions.find(x => x.id === parseInt(qid));
    if (!q) return;

    const userAns = state.answers[qid];
    if (isAnswerCorrect(q, userAns)) {
      correctCount++;
    }
  });

  const score = totalAnswered > 0 ? ((correctCount / totalAnswered) * 100).toFixed(1) : "0.0";
  const passing = parseFloat(score) >= 65;

  const progressPill = $("#pill-progress");
  const scorePill = $("#pill-score");
  const statusPill = $("#pill-status");

  if (progressPill) progressPill.querySelector(".pill-value").textContent = `${totalAnswered}/${totalQuestions}`;
  if (scorePill) scorePill.querySelector(".pill-value").textContent = `${score}%`;
  if (statusPill) {
    statusPill.querySelector(".pill-value").textContent = passing ? "Passing" : "Not Passing";
    statusPill.className = `score-pill ${passing ? "passing" : "failing"}`;
  }

  const dashAnswered = $("#dash-answered");
  const dashCorrect = $("#dash-correct");
  const dashScore = $("#dash-score");

  if (dashAnswered) dashAnswered.textContent = totalAnswered;
  if (dashCorrect) dashCorrect.textContent = correctCount;
  if (dashScore) dashScore.textContent = totalAnswered > 0 ? `${score}%` : "—";
}

function updateTabProgress() {
  for (let i = 1; i <= 6; i++) {
    const cat = TAB_CATEGORIES[i];
    const questions = state.questions.filter(q => q.category === cat);
    const answered = questions.filter(q => state.submitted[q.id]).length;
    const el = $(`#progress-${i}`);
    if (el) el.textContent = `${answered} / ${questions.length} Answered`;
  }

  const allAnswered = Object.keys(state.submitted).filter(k => state.submitted[k]).length;
  const el7 = $(`#progress-7`);
  if (el7) el7.textContent = `${allAnswered} / ${state.questions.length} Answered`;

  const topicKeys = [
    CATEGORIES.DISCOVERY,
    CATEGORIES.UX_FUNDAMENTALS,
    CATEGORIES.HUMAN_CENTERED_DESIGN,
    CATEGORIES.DECLARATIVE_DESIGN,
    CATEGORIES.TESTING,
    CATEGORIES.SLDS
  ];
  topicKeys.forEach((cat, idx) => {
    const questions = state.questions.filter(q => q.category === cat);
    const answered = questions.filter(q => state.submitted[q.id]).length;
    const pct = questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;

    const fill = $(`#cat-progress-${idx}-fill`);
    const text = $(`#cat-progress-${idx}-text`);
    if (fill) fill.style.width = `${pct}%`;
    if (text) text.textContent = `${pct}% complete (${answered}/${questions.length})`;
  });
}

// ============================================================
// SECTION 10: MODE TOGGLE (STUDY / EXAM)
// ============================================================

function toggleMode(isExam) {
  state.mode = isExam ? "exam" : "study";

  const timer = $(".exam-timer");
  const submitExamBtn = $(".submit-exam-btn");

  if (isExam) {
    state.answers = {};
    state.submitted = {};
    state.shuffleMap = {};
    state.examSubmitted = false;
    state.timerSeconds = 105 * 60;

    renderAllQuizTabs();
    updateScoreMatrix();
    updateTabProgress();

    timer.classList.add("visible");
    submitExamBtn.classList.add("visible");
    startTimer();

    setActiveTab(7);
  } else {
    state.answers = {};
    state.submitted = {};
    state.shuffleMap = {};

    stopTimer();
    timer.classList.remove("visible");
    timer.classList.remove("warning");
    submitExamBtn.classList.remove("visible");

    renderAllQuizTabs();
    updateScoreMatrix();
    updateTabProgress();
    setActiveTab(0);
  }
}

// ============================================================
// SECTION 11: EXAM TIMER
// ============================================================

function startTimer() {
  stopTimer();
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    if (state.timerSeconds <= 0) {
      stopTimer();
      submitExam();
    }
    if (state.timerSeconds <= 300) {
      $(".exam-timer").classList.add("warning");
    }
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const hours = Math.floor(state.timerSeconds / 3600);
  const mins = Math.floor((state.timerSeconds % 3600) / 60);
  const secs = state.timerSeconds % 60;
  const display = `${hours > 0 ? hours + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const timerText = $("#timer-text");
  if (timerText) timerText.textContent = display;
}

// ============================================================
// SECTION 12: EXAM SUBMISSION & RESULTS
// ============================================================

function submitExam() {
  if (state.examSubmitted) return;
  state.examSubmitted = true;
  stopTimer();

  let totalCorrect = 0;
  const sectionResults = {};

  Object.values(CATEGORIES).forEach(cat => {
    sectionResults[cat] = { total: 0, correct: 0 };
  });

  state.questions.forEach(q => {
    sectionResults[q.category].total++;
    const userAns = state.answers[q.id];

    if (userAns && userAns.length > 0) {
      if (isAnswerCorrect(q, userAns)) {
        totalCorrect++;
        sectionResults[q.category].correct++;
      }
    }
  });

  const totalQuestions = state.questions.length;
  const totalAnswered = Object.keys(state.submitted).filter(k => state.submitted[k]).length;
  const score = ((totalCorrect / totalQuestions) * 100).toFixed(1);
  const passed = parseFloat(score) >= 65;

  showResultsModal(totalAnswered, totalCorrect, score, passed, sectionResults);
}

function showResultsModal(answered, correct, score, passed, sections) {
  const overlay = $(".results-overlay");
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (parseFloat(score) / 100) * circumference;
  const strokeColor = passed ? "var(--color-correct)" : "var(--color-incorrect)";

  const totalQuestions = state.questions.length;

  const modal = overlay.querySelector(".results-modal");
  modal.innerHTML = `
    <h2>${passed ? "🎉 Congratulations!" : "📝 Keep Studying!"}</h2>
    <p class="result-subtitle">${passed ? "You passed the practice exam!" : "You didn't reach the 65% passing threshold."}</p>

    <div class="result-score-ring">
      <svg viewBox="0 0 140 140">
        <circle class="ring-bg" cx="70" cy="70" r="65"/>
        <circle class="ring-progress" cx="70" cy="70" r="65"
          stroke="${strokeColor}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"/>
      </svg>
      <div class="ring-text" style="color:${strokeColor}">
        ${score}%
        <span>Score</span>
      </div>
    </div>

    <div class="results-breakdown">
      <div class="result-stat ${passed ? 'pass' : 'fail'}">
        <div class="rs-value">${correct}/${totalQuestions}</div>
        <div class="rs-label">Correct</div>
      </div>
      <div class="result-stat">
        <div class="rs-value">${answered}</div>
        <div class="rs-label">Answered</div>
      </div>
      <div class="result-stat">
        <div class="rs-value">${totalQuestions - answered}</div>
        <div class="rs-label">Unanswered</div>
      </div>
      <div class="result-stat ${passed ? 'pass' : 'fail'}">
        <div class="rs-value">${passed ? "PASS" : "FAIL"}</div>
        <div class="rs-label">Status (≥65%)</div>
      </div>
    </div>

    <table class="results-section-table">
      <thead>
        <tr><th>Section</th><th>Weight</th><th>Score</th><th>Result</th></tr>
      </thead>
      <tbody>
        ${Object.entries(sections).map(([name, data]) => {
    const pct = data.total > 0 ? ((data.correct / data.total) * 100).toFixed(0) : 0;
    const weight = CATEGORY_WEIGHTS[name] || "—";
    return `<tr>
            <td>${name}</td>
            <td>${weight}</td>
            <td>${data.correct}/${data.total} (${pct}%)</td>
            <td style="color:${pct >= 65 ? 'var(--color-correct)' : 'var(--color-incorrect)'}">${pct >= 65 ? "✓ Pass" : "✕ Needs Work"}</td>
          </tr>`;
  }).join("")}
      </tbody>
    </table>

    <button class="results-close-btn" onclick="closeResults()">Review Answers</button>
  `;

  overlay.classList.add("visible");
}

window.closeResults = function () {
  $(".results-overlay").classList.remove("visible");

  state.questions.forEach(q => {
    const userAns = state.answers[q.id];
    const isCorrect = isAnswerCorrect(q, userAns);

    const cards = $$(`#qcard-${q.id}`);
    cards.forEach(card => {
      card.classList.add(isCorrect ? "answered-correct" : "answered-incorrect");
      const options = card.querySelectorAll(".option-item");
      options.forEach(opt => {
        const optText = opt.querySelector(".option-text").textContent.trim();
        opt.classList.add("disabled");
        opt.classList.remove("selected");

        if (isChoiceCorrect(q, optText)) {
          opt.classList.add("correct");
        } else if (isChoiceSelected(q.id, optText)) {
          opt.classList.add("incorrect");
        }
      });

      const explanation = card.querySelector(`.explanation-panel`);
      if (explanation) explanation.classList.add("visible");

      const btn = card.querySelector(`.btn-submit`);
      if (btn) btn.style.display = "none";
    });
  });
};

// ============================================================
// SECTION 13: EVENT BINDINGS
// ============================================================

function bindEvents() {
  document.addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".tab-btn");
    if (tabBtn) {
      setActiveTab(parseInt(tabBtn.dataset.tab));
    }
  });

  const toggle = $("#mode-toggle");
  if (toggle) {
    toggle.addEventListener("change", (e) => {
      if (e.target.checked) {
        if (confirm("Switching to Exam Mode will reset all your answers and start a 105-minute timer. Continue?")) {
          toggleMode(true);
        } else {
          e.target.checked = false;
        }
      } else {
        if (confirm("Switching back to Study Mode will reset your exam progress. Continue?")) {
          toggleMode(false);
        } else {
          e.target.checked = true;
        }
      }
    });
  }

  const submitBtn = $(".submit-exam-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to submit the exam? You cannot change answers after submitting.")) {
        submitExam();
      }
    });
  }
}

// ============================================================
// SECTION 14: UTILITY FUNCTIONS
// ============================================================

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, i) => val === b[i]);
}

// ============================================================
// SECTION 15: INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  if (sessionStorage.getItem("simulator_unlocked") === "true") {
    unlockApp(true);
  }

  const questions = await fetchAndParseQuestions();
  if (questions.length === 0) return;

  state.questions = questions;

  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden");
  }

  renderTabButtons();
  renderDashboard();
  renderAllQuizTabs();
  updateScoreMatrix();
  updateTabProgress();
  bindEvents();
  setActiveTab(0);
});
