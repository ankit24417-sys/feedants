import { Category } from "../models/category.model.js";
import { Competition } from "../models/competition.model.js";
import { Champion } from "../models/champion.model.js";
import { User } from "../models/user.model.js";

const categoriesData = [
  { name: "all", label: "All", emoji: "🌟", icon: "sparkles", liveCount: 6, order: 1 },
  { name: "classical-dance", label: "Classical Dance", emoji: "💃", icon: "body", liveCount: 2, order: 2 },
  { name: "singing", label: "Singing", emoji: "🎤", icon: "mic", liveCount: 1, order: 3 },
  { name: "art-painting", label: "Art & Painting", emoji: "🎨", icon: "color-palette", liveCount: 1, order: 4 },
  { name: "acting", label: "Acting", emoji: "🎭", icon: "happy", liveCount: 1, order: 5 },
  { name: "photography", label: "Photography", emoji: "📸", icon: "camera", liveCount: 1, order: 6 },
];

const championsData = [
  {
    rank: 1,
    name: "Ananya Sharma",
    prize: "₹1,00,000",
    place: "1st Place",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    rank: 2,
    name: "Kabir Sen",
    prize: "₹50,000",
    place: "2nd Place",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    rank: 3,
    name: "Ritika Sen",
    prize: "₹25,000",
    place: "3rd Place",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    rank: 4,
    name: "Rohan Das",
    prize: "₹15,000",
    place: "4th Place",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
];

const competitionsData = [
  {
    title: "Feedants Classical Dance Championship 2026",
    description: "National jury adjudication, verified certificates & live grand finale showcase.",
    category: "Classical Dance",
    isMegaContest: true,
    status: "live",
    urgency: "critical",
    tags: [
      { label: "Mega Contest", type: "hot" },
      { label: "Classical Dance", type: "default" },
      { label: "National", type: "default" },
    ],
    prizePool: "₹50,000",
    entryFee: "₹99",
    spotsLeft: 19,
    totalSpots: 20,
    enrolled: 1,
    countdown: "01d : 06h : 28m : 32s",
    judge: {
      name: "Manju Dubey",
      role: "Kathak Maestro • 12+ Yrs",
      title: "Professional Kathak Dancer",
      experience: "12+ Years of Experience",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
    dates: [
      { label: "Register Before", date: "10 Aug 26", time: "11:50 PM" },
      { label: "Submission Starts", date: "6 Aug 26", time: "04:00 AM" },
      { label: "Submission Ends", date: "30 Aug 26", time: "11:55 PM" },
      { label: "Result Date", date: "1 Sept 26", time: "11:50 PM" },
    ],
    rewards: [
      { position: "1st Winner", emoji: "🏆", amount: "₹ 550" },
      { position: "2nd Winner", emoji: "🥈", amount: "₹ 300" },
      { position: "3rd Winner", emoji: "🥉", amount: "₹ 240" },
      { position: "4th Winner", emoji: "☆", amount: "₹ 200" },
      { position: "5th Winner", emoji: "☆", amount: "₹ 130" },
      { position: "6th Winner", emoji: "☆", amount: "₹ 80" },
    ],
  },
  {
    title: "Bollywood Fusion Dance League",
    category: "Classical Dance",
    status: "live",
    urgency: "normal",
    tags: [
      { label: "Hot", type: "hot" },
      { label: "Dance", type: "default" },
      { label: "Solo / Duet", type: "default" },
    ],
    prizePool: "₹25,000",
    entryFee: "₹149",
    spotsLeft: 45,
    totalSpots: 100,
    enrolled: 55,
    judge: {
      name: "Geeta Kapoor",
      role: "Head Adjudicator",
      title: "Bollywood Choreographer",
      experience: "15+ Years",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    title: "Carnatic Vocal Solo Trophy",
    category: "Singing",
    status: "live",
    urgency: "critical",
    tags: [
      { label: "Fast Filling", type: "fast" },
      { label: "Music", type: "default" },
      { label: "Classical", type: "default" },
    ],
    prizePool: "₹10,000",
    entryFee: "₹99",
    spotsLeft: 12,
    totalSpots: 30,
    enrolled: 18,
    judge: {
      name: "R. Venkat",
      role: "Carnatic Maestro",
      title: "Vocalist & Composer",
      experience: "20+ Years",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    title: "National Canvas & Digital Art League",
    category: "Art & Painting",
    status: "live",
    urgency: "normal",
    tags: [
      { label: "Hot", type: "hot" },
      { label: "Art & Painting", type: "default" },
      { label: "Digital / Oil", type: "default" },
    ],
    prizePool: "₹15,000",
    entryFee: "₹129",
    spotsLeft: 35,
    totalSpots: 50,
    enrolled: 15,
    judge: {
      name: "Ananya Roy",
      role: "Lead Visual Artist",
      title: "Digital Art Director",
      experience: "8+ Years",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    title: "Monologue & Street Play Drama Arena",
    category: "Acting",
    status: "upcoming",
    urgency: "normal",
    tags: [
      { label: "Fast Filling", type: "fast" },
      { label: "Acting", type: "default" },
    ],
    prizePool: "₹20,000",
    entryFee: "₹119",
    spotsLeft: 22,
    totalSpots: 40,
    enrolled: 18,
    judge: {
      name: "Vikram Saxena",
      role: "Theatre Director",
      title: "NSD Alumnus",
      experience: "14+ Years",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    title: "Landscape & Portrait Photography Cup",
    category: "Photography",
    status: "live",
    urgency: "normal",
    tags: [
      { label: "Hot", type: "hot" },
      { label: "Photography", type: "default" },
    ],
    prizePool: "₹12,000",
    entryFee: "₹79",
    spotsLeft: 8,
    totalSpots: 25,
    enrolled: 17,
    judge: {
      name: "Tanya Sen",
      role: "Wildlife & Fashion Photographer",
      title: "NatGeo Contributor",
      experience: "10+ Years",
      avatarUrl: "https://images.unsplash.com/photo-1534751516642-a171ed28a977?auto=format&fit=crop&w=400&q=80",
    },
  },
];

const defaultUser = {
  name: "Aryan Sharma",
  username: "aryan_dancer24",
  email: "aryan@feedants.com",
  isVerified: true,
  tags: ["Verified Creator", "Kathak Enthusiast"],
  stats: {
    contestsJoined: 12,
    podiumsWon: 3,
    totalEarnings: "₹4,850",
  },
  wallet: {
    balance: "₹1,250",
    status: "Available",
  },
  referralLink: "feedants.com/r/aryan921",
  referralFullLink: "https://feedants.com/r/referral123",
};

export const seedIfEmpty = async () => {
  try {
    const compCount = await Competition.countDocuments();
    if (compCount === 0) {
      console.log("[Seed] Database is empty. Seeding initial data...");

      await Category.deleteMany({});
      await Category.insertMany(categoriesData);

      await Champion.deleteMany({});
      await Champion.insertMany(championsData);

      await Competition.deleteMany({});
      await Competition.insertMany(competitionsData);

      const userExists = await User.findOne({ username: defaultUser.username });
      if (!userExists) {
        await User.create(defaultUser);
      }

      console.log("[Seed] Successfully seeded Categories, Champions, Competitions, and Default User!");
    }
  } catch (error) {
    console.error("[Seed] Seeding failed:", error.message);
  }
};
