import { FC, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Quote {
  text: string;
  author: string;
  wiki: string;
}

const quotes: Quote[] = [
  { text: "For every minute spent organizing, an hour is earned.", author: "Benjamin Franklin", wiki: "Benjamin_Franklin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", wiki: "Mark_Twain" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", wiki: "Winston_Churchill" },
  { text: "Order is not pressure which is imposed on society from without, but an equilibrium which is set up from within.", author: "Jane Addams", wiki: "Jane_Addams" },
  { text: "It is not enough to be busy. So are the ants. The question is: what are we busy about?", author: "Henry David Thoreau", wiki: "Henry_David_Thoreau" },
  { text: "The more you know, the more you realize you don't know.", author: "Aristotle", wiki: "Aristotle" },
  { text: "Have a place for everything and keep everything in its place.", author: "Benjamin Franklin", wiki: "Benjamin_Franklin" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle", wiki: "Aristotle" },
  { text: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.", author: "Socrates", wiki: "Socrates" },
  { text: "By failing to prepare, you are preparing to fail.", author: "Benjamin Franklin", wiki: "Benjamin_Franklin" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", wiki: "Albert_Einstein" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", wiki: "Leonardo_da_Vinci" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss", wiki: "Tim_Ferriss" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie", wiki: "Dale_Carnegie" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", wiki: "Steve_Jobs" },
];

const imageCache = new Map<string, string>();

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

interface WelcomeGreetingProps {
  userName: string;
}

export const WelcomeGreeting: FC<WelcomeGreetingProps> = ({ userName }) => {
  const greeting = useMemo(() => getGreeting(), []);
  const fullText = useMemo(() => `${greeting}, ${userName}.`, [greeting, userName]);
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);
  const [imgSrc, setImgSrc] = useState<string | null>(imageCache.get(quote.wiki) || null);
  const [imgError, setImgError] = useState(false);
  const fetchedRef = useRef(false);
  const [displayCount, setDisplayCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const typingSpeed = 60;
    const deletingSpeed = 35;
    const pauseAtEnd = 2000;
    const pauseAtStart = 800;

    if (!isDeleting && displayCount < fullText.length) {
      const timer = setTimeout(() => setDisplayCount((prev) => prev + 1), typingSpeed);
      return () => clearTimeout(timer);
    }
    if (!isDeleting && displayCount === fullText.length) {
      const timer = setTimeout(() => setIsDeleting(true), pauseAtEnd);
      return () => clearTimeout(timer);
    }
    if (isDeleting && displayCount > 0) {
      const timer = setTimeout(() => setDisplayCount((prev) => prev - 1), deletingSpeed);
      return () => clearTimeout(timer);
    }
    if (isDeleting && displayCount === 0) {
      const timer = setTimeout(() => setIsDeleting(false), pauseAtStart);
      return () => clearTimeout(timer);
    }
  }, [displayCount, isDeleting, fullText.length]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (imageCache.has(quote.wiki)) {
      setImgSrc(imageCache.get(quote.wiki)!);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${quote.wiki}`)
      .then((res) => res.json())
      .then((data) => {
        const url = data?.thumbnail?.source || null;
        if (url) {
          imageCache.set(quote.wiki, url);
          setImgSrc(url);
        }
      })
      .catch(() => {});
  }, [quote.wiki]);

  return (
    <div className="flex flex-col items-center text-center gap-2">
      <p className="text-5xl font-extrabold tracking-tight text-foreground min-h-[1.2em]">
        {fullText.split("").map((char, i) => (
          <motion.span
            key={i}
            animate={{ opacity: i < displayCount ? 1 : 0 }}
            transition={{ duration: 0.05 }}
          >
            {char}
          </motion.span>
        ))}
        {displayCount > 0 && displayCount < fullText.length && (
          <span
            className={`inline-block w-[3px] h-[1em] bg-foreground ml-0.5 align-middle transition-opacity duration-150 ${showCursor ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </p>
      <div className="max-w-md mt-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-default-100 mt-0.5 ring-2 ring-default-200">
            {imgSrc && !imgError ? (
              <img
                alt={quote.author}
                className="w-full h-full object-cover"
                src={imgSrc}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-default-500">
                {quote.author
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-left">
            <p className="text-base text-default-500 italic leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-sm text-default-400 mt-2 font-medium">
              &mdash; {quote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
