export interface Specimen {
  text: string;
  /** Sinhala script, set in a Sinhala font. Otherwise it is shown as typed: mono Latin. */
  sinhala?: boolean;
}

export interface Fix {
  title: string;
  body: string;
  before: Specimen;
  after: Specimen;
  /** The "before" is broken text rather than an input, so it is marked like a spelling error. */
  broken?: boolean;
}

export const FIXES: Fix[] = [
  {
    title: "FM text that breaks on every other PC",
    body: "Text typed in FM Abhaya is stored as English letters, so in WhatsApp, on a phone or in a government web form it turns into this. Akuru converts it to Unicode, and back to FM for old Photoshop, Illustrator and CorelDRAW.",
    before: { text: "m%dfoaYSh iNdj" },
    after: { text: "ප්‍රාදේශීය සභාව", sinhala: true },
    broken: true,
  },
  {
    title: "Converters that break ශ්‍රී",
    body: "Online converters drop the joiner in ශ්‍රී and ප්‍ර, and put the kombuva on the wrong letter. Akuru keeps them right, and its Doctor finds text that only looks right and repairs it.",
    before: { text: "ශ්රී ලංකා", sinhala: true },
    after: { text: "ශ්‍රී ලංකා", sinhala: true },
    broken: true,
  },
  {
    title: "Typing the way you learned",
    body: "Type in Singlish, or on the Wijesekara keyboard with the kombuva before or after the letter. Suggestions come from 23,000 common Sinhala words, and nothing has to be installed in Windows.",
    before: { text: "mama gedhara yanavaa" },
    after: { text: "මම ගෙදර යනවා", sinhala: true },
  },
  {
    title: "Whole Word files, or a folder of them",
    body: "Convert .docx files one at a time or a whole folder at once. Bold, sizes, tables, headers and pictures stay as they were, and the original file is never changed.",
    before: { text: "notice.docx" },
    after: { text: "notice (Unicode).docx" },
  },
  {
    title: "In any program",
    body: "While Akuru sits in the tray, copy FM text anywhere, press Ctrl+Alt+U and paste Unicode. Ctrl+Alt+F goes the other way, and Ctrl+Alt+Space opens a small box for typing a few words.",
    before: { text: "Ctrl+Alt+U" },
    after: { text: "ප්‍රාදේශීය සභාව", sinhala: true },
  },
];

export interface Step {
  title: string;
  body: string;
}

export const steps = (setupName: string): Step[] => [
  {
    title: "Download and open it",
    body: `${setupName} lands in your Downloads folder. Double-click it.`,
  },
  {
    title: "If Windows warns you",
    body: "Windows may say “Windows protected your PC” because the app is new and not code-signed yet. Choose More info, then Run anyway.",
  },
  {
    title: "Start typing",
    body: "It installs for your Windows account in a few seconds, without an admin password, and puts Glaux Akuru on the Desktop and in the Start menu.",
  },
];

export interface Question {
  question: string;
  answer: string;
}

export const QUESTIONS: Question[] = [
  {
    question: "Is it free?",
    answer:
      "Yes, everything in this version is free. Typing, converting and fixing Sinhala text will stay free.",
  },
  {
    question: "Does it need the internet?",
    answer:
      "Only to download it. After that it works with no connection, and nothing you type leaves the PC. There are no accounts and no tracking.",
  },
  {
    question: "Does it come with FM Abhaya?",
    answer:
      "No. FM fonts belong to their makers, so Akuru doesn't include or download them. It knows which key each letter sits on, so converted text shows correctly wherever FM Abhaya is already installed.",
  },
  {
    question: "Which computers does it run on?",
    answer:
      "Windows 10 and 11, 64-bit. It doesn't run on Windows 7 or 8, a Mac or a phone, but the Unicode text it makes works on all of them.",
  },
  {
    question: "How do I remove it?",
    answer:
      "Open Settings, then Apps, find Glaux Akuru and choose Uninstall. Your saved work stays in %APPDATA%\\Glaux Akuru until you delete that folder.",
  },
];
