import type { BlogPost } from "./types";

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "how-to-guide-on-bully-pedigrees",
    title: "How-to Guide on Bully Pedigrees: Everything a New Breeder Needs to Know",
    excerpt: "Pedigrees are the foundation of every reputable breeding program. Here's how to read, build and protect yours.",
    body: `Pedigrees are the family tree of a dog. They show the genetic lineage going back multiple generations, including parents, grandparents, and great-grandparents.

**Why pedigrees matter**

A solid pedigree is more than just a piece of paper. It is proof that your dog comes from a documented bloodline, and it allows future owners to verify your dog's heritage independently. Without a pedigree, the breeding work of generations can be erased in a single sale.

**Reading a pedigree**

A standard 4-generation pedigree shows the sire (father) on top, dam (mother) on the bottom, and each ancestor pair branching out from there. Look for:
- Champion titles (CH, GR CH)
- Health clearances (OFA, DNA-tested)
- Repeated names — a heavy line-bred ancestor can amplify both strengths and weaknesses

**Building your own**

When registering with BullyPedex, you can link existing certificates as sire and dam, and our system automatically computes the next-generation pedigree, plus the coefficient of inbreeding (COI). A healthy COI is under 6.25%.

**Protecting your bloodlines**

Always register before selling. A pedigree without a registered certificate ID is essentially unverifiable. Buyers in 2026 expect a QR-scannable cert before they put down a deposit.`,
    author: "Marcus Whitlock",
    date: "2026-05-12",
    tags: ["Pedigree", "Beginners", "Guide"],
    cover: "📜",
    readTime: 6,
  },
  {
    id: "2",
    slug: "abkc-vs-bpkc-which-registry",
    title: "ABKC vs BPKC: Which Registry Should Your Kennel Use?",
    excerpt: "We break down the differences between the two largest American Bully registries — and why most pro kennels now register with both.",
    body: "The ABKC and BPKC have different standards, fees and recognition. This article walks through each one in detail with side-by-side comparisons...",
    author: "Sasha Kim",
    date: "2026-04-28",
    tags: ["ABKC", "BPKC", "Comparison"],
    cover: "⚖️",
    readTime: 8,
  },
  {
    id: "3",
    slug: "coi-coefficient-of-inbreeding",
    title: "Understanding COI: The Coefficient of Inbreeding Every Breeder Must Know",
    excerpt: "Why your line-breeding program may be quietly destroying genetic diversity — and how to fix it.",
    body: "The Coefficient of Inbreeding (COI) measures how genetically related two parents are. The higher the COI, the higher the risk of recessive genetic disorders surfacing in the litter...",
    author: "Dr. Amanda Reeves DVM",
    date: "2026-04-10",
    tags: ["Genetics", "Health", "COI"],
    cover: "🧬",
    readTime: 10,
  },
  {
    id: "4",
    slug: "tri-color-genetics-explained",
    title: "Tri-Color Bully Genetics Explained (Simply)",
    excerpt: "Lilac tri, chocolate tri, blue tri — where do these colors actually come from?",
    body: "Tri-color American Bullies have exploded in popularity. The science behind them is rooted in two recessive alleles...",
    author: "Marcus Whitlock",
    date: "2026-03-22",
    tags: ["Genetics", "Color", "Tri"],
    cover: "🎨",
    readTime: 5,
  },
  {
    id: "5",
    slug: "ownership-transfer-protect-yourself",
    title: "Ownership Transfers: How to Protect Yourself as a Buyer or Seller",
    excerpt: "Most disputes happen because of missing paperwork. Here's the bulletproof transfer workflow.",
    body: "Whether you're selling a puppy or buying an adult, the ownership transfer is the most important step in protecting both parties...",
    author: "Carlos Rocha",
    date: "2026-03-05",
    tags: ["Ownership", "Transfer", "Legal"],
    cover: "🔁",
    readTime: 7,
  },
  {
    id: "6",
    slug: "preparing-your-bully-for-shows",
    title: "Preparing Your Bully for Show: A 12-Week Plan",
    excerpt: "From conditioning to ring etiquette — a week-by-week breakdown.",
    body: "Show prep is part fitness, part presentation, part mental game. Here's the schedule that's worked for me across six championships...",
    author: "Anna Lindqvist",
    date: "2026-02-18",
    tags: ["Shows", "Training", "Guide"],
    cover: "🏆",
    readTime: 9,
  },
];
