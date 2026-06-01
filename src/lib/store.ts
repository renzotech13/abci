"use client";

import type {
  User, Dog, HealthRecord, Litter, Transfer,
  Event, MarketplaceListing,
} from "./types";
import { generateId, generateCertificateId } from "./utils";

const KEYS = {
  users: "bpx:users",
  session: "bpx:session",
  dogs: "bpx:dogs",
  health: "bpx:health",
  litters: "bpx:litters",
  transfers: "bpx:transfers",
  events: "bpx:events",
  marketplace: "bpx:marketplace",
  seeded: "bpx:seeded:v3",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------------- Users / Auth ---------------- */
export function getUsers(): User[] { return read<User[]>(KEYS.users, []); }
export function saveUsers(users: User[]) { write(KEYS.users, users); }

export function getCurrentUser(): User | null {
  const sessionId = read<string | null>(KEYS.session, null);
  if (!sessionId) return null;
  return getUsers().find(u => u.id === sessionId) || null;
}

export function signIn(email: string, password: string): User | null {
  const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) write(KEYS.session, user.id);
  return user || null;
}

export function signUp(data: { email: string; password: string; name: string; kennelName?: string; country?: string }): User | null {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) return null;
  const user: User = {
    id: generateId("U-"),
    email: data.email,
    password: data.password,
    name: data.name,
    kennelName: data.kennelName,
    country: data.country,
    membership: "free",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  write(KEYS.session, user.id);
  return user;
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.session);
}

export function updateUser(patch: Partial<User>): User | null {
  const cur = getCurrentUser();
  if (!cur) return null;
  const users = getUsers().map(u => u.id === cur.id ? { ...u, ...patch } : u);
  saveUsers(users);
  return users.find(u => u.id === cur.id) || null;
}

/* ---------------- Dogs ---------------- */
export function getDogs(): Dog[] { return read<Dog[]>(KEYS.dogs, []); }
export function saveDogs(dogs: Dog[]) { write(KEYS.dogs, dogs); }
export function getMyDogs(): Dog[] {
  const cur = getCurrentUser();
  if (!cur) return [];
  return getDogs().filter(d => d.ownerId === cur.id);
}
export function getDog(id: string): Dog | null {
  return getDogs().find(d => d.id === id || d.certificateId === id) || null;
}
export function addDog(data: Omit<Dog, "id" | "certificateId" | "registrationDate" | "status" | "ownerId"> & { ownerId?: string }): Dog {
  const cur = getCurrentUser();
  const dog: Dog = {
    ...data,
    id: generateId("D-"),
    certificateId: generateCertificateId(),
    registrationDate: new Date().toISOString(),
    status: "active",
    ownerId: data.ownerId || cur?.id || "GUEST",
  };
  const dogs = getDogs();
  dogs.push(dog);
  saveDogs(dogs);
  return dog;
}
export function updateDog(id: string, patch: Partial<Dog>): Dog | null {
  const dogs = getDogs().map(d => d.id === id ? { ...d, ...patch } : d);
  saveDogs(dogs);
  return dogs.find(d => d.id === id) || null;
}
export function deleteDog(id: string) {
  saveDogs(getDogs().filter(d => d.id !== id));
}

/* ---------------- Health ---------------- */
export function getHealthRecords(dogId?: string): HealthRecord[] {
  const all = read<HealthRecord[]>(KEYS.health, []);
  return dogId ? all.filter(h => h.dogId === dogId) : all;
}
export function addHealthRecord(rec: Omit<HealthRecord, "id">): HealthRecord {
  const all = read<HealthRecord[]>(KEYS.health, []);
  const newRec: HealthRecord = { ...rec, id: generateId("H-") };
  all.push(newRec);
  write(KEYS.health, all);
  return newRec;
}
export function deleteHealthRecord(id: string) {
  write(KEYS.health, read<HealthRecord[]>(KEYS.health, []).filter(h => h.id !== id));
}

/* ---------------- Litters ---------------- */
export function getLitters(): Litter[] { return read<Litter[]>(KEYS.litters, []); }
export function addLitter(litter: Omit<Litter, "id">): Litter {
  const all = getLitters();
  const newLitter: Litter = { ...litter, id: generateId("L-") };
  all.push(newLitter);
  write(KEYS.litters, all);
  return newLitter;
}

/* ---------------- Transfers ---------------- */
export function getTransfers(): Transfer[] { return read<Transfer[]>(KEYS.transfers, []); }
export function getMyTransfers(): Transfer[] {
  const cur = getCurrentUser();
  if (!cur) return [];
  return getTransfers().filter(t => t.fromUserId === cur.id);
}
export function addTransfer(t: Omit<Transfer, "id" | "requestedAt" | "status">): Transfer {
  const all = getTransfers();
  const newT: Transfer = {
    ...t, id: generateId("T-"),
    requestedAt: new Date().toISOString(),
    status: "pending",
  };
  all.push(newT);
  write(KEYS.transfers, all);
  return newT;
}
export function updateTransfer(id: string, patch: Partial<Transfer>): Transfer | null {
  const all = getTransfers().map(t => t.id === id ? { ...t, ...patch } : t);
  write(KEYS.transfers, all);
  return all.find(t => t.id === id) || null;
}

/* ---------------- Events ---------------- */
export function getEvents(): Event[] { return read<Event[]>(KEYS.events, []); }
export function toggleEventRegister(id: string) {
  const all = getEvents().map(e => e.id === id ? { ...e, registered: !e.registered } : e);
  write(KEYS.events, all);
}

/* ---------------- Marketplace ---------------- */
export function getMarketplace(): MarketplaceListing[] { return read<MarketplaceListing[]>(KEYS.marketplace, []); }
export function addListing(l: Omit<MarketplaceListing, "id" | "posted">): MarketplaceListing {
  const all = getMarketplace();
  const newL: MarketplaceListing = { ...l, id: generateId("M-"), posted: new Date().toISOString() };
  all.unshift(newL);
  write(KEYS.marketplace, all);
  return newL;
}

/* ---------------- Seed ---------------- */
export function seedData() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.seeded)) return;

  const demoUserId = "U-DEMO-001";
  const breederId = "U-DEMO-002";

  const users: User[] = [
    {
      id: demoUserId, email: "demo@bullypedex.app", password: "demo1234",
      name: "Alex Morgan", kennelName: "Crown Bullies Kennel",
      country: "United States", phone: "+1 (305) 555-0190",
      bio: "Breeder of exotic American Bullies since 2015. ABKC champions in pocket and standard.",
      membership: "elite", createdAt: "2023-04-12T10:00:00.000Z",
    },
    {
      id: breederId, email: "ruby@kennel.app", password: "demo1234",
      name: "Ruby Castillo", kennelName: "Aztec Legends Kennel",
      country: "Mexico", membership: "pro",
      bio: "Specialized in XL and Extreme American Bullies. International shows.",
      createdAt: "2022-09-04T10:00:00.000Z",
    },
  ];

  const dogs: Dog[] = [
    {
      id: "D-SIRE-001", certificateId: "BPX-1024-ZEUS-19", ownerId: demoUserId,
      name: "CH Crown's Black Zeus", callName: "Zeus", breed: "American Bully",
      variant: "Standard", gender: "male", color: "Solid Black", weight: 85, height: 18,
      dob: "2020-06-15", microchip: "9817222345001", kennelName: "Crown Bullies Kennel",
      sireName: "GR CH Iron King Apollo", damName: "CH Midnight Queen",
      titles: ["ABKC Champion", "Grand Champion Sire"],
      registrationDate: "2020-09-01T10:00:00.000Z", status: "active",
      notes: "Producer of multiple champions. Heart and hips OFA certified.",
    },
    {
      id: "D-DAM-001", certificateId: "BPX-1025-LUNA-22", ownerId: demoUserId,
      name: "CH Crown's Silver Luna", callName: "Luna", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Blue Tri", weight: 55, height: 15,
      dob: "2021-03-22", microchip: "9817222345002", kennelName: "Crown Bullies Kennel",
      sireName: "GR CH Storm Bringer", damName: "CH Diamond Pearl",
      titles: ["ABKC Champion"],
      registrationDate: "2021-06-10T10:00:00.000Z", status: "active",
    },
    {
      id: "D-001", certificateId: "BPX-2025-DIESEL-01", ownerId: demoUserId,
      name: "Crown's Diesel Prime", callName: "Diesel", breed: "American Bully",
      variant: "XL", gender: "male", color: "Chocolate Tri", weight: 110, height: 22,
      dob: "2024-01-15", microchip: "9817222345010", kennelName: "Crown Bullies Kennel",
      sireId: "D-SIRE-001", damId: "D-DAM-001",
      sireName: "CH Crown's Black Zeus", damName: "CH Crown's Silver Luna",
      registrationDate: "2024-04-20T10:00:00.000Z", status: "active",
      notes: "Heavy bone, blocky head, exotic structure.",
    },
    {
      id: "D-002", certificateId: "BPX-2025-NOVA-02", ownerId: demoUserId,
      name: "Crown's Nova Star", callName: "Nova", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Lilac Tri", weight: 48, height: 14,
      dob: "2024-01-15", microchip: "9817222345011", kennelName: "Crown Bullies Kennel",
      sireId: "D-SIRE-001", damId: "D-DAM-001",
      sireName: "CH Crown's Black Zeus", damName: "CH Crown's Silver Luna",
      registrationDate: "2024-04-20T10:00:00.000Z", status: "active",
    },
    {
      id: "D-003", certificateId: "BPX-2024-ROCKY-77", ownerId: breederId,
      name: "Aztec's Rocky Balboa", callName: "Rocky", breed: "American Bully",
      variant: "Extreme", gender: "male", color: "Merle Blue", weight: 95, height: 20,
      dob: "2023-08-10", microchip: "9817222345020", kennelName: "Aztec Legends Kennel",
      sireName: "GR CH Mexican Titan", damName: "CH Aztec Princess",
      titles: ["Best of Show 2024"],
      registrationDate: "2023-11-15T10:00:00.000Z", status: "active",
    },
  ];

  const health: HealthRecord[] = [
    { id: "H-1", dogId: "D-001", type: "vaccination", title: "DHPP Annual Booster", date: "2025-01-20", vet: "Dr. Sarah Lin" },
    { id: "H-2", dogId: "D-001", type: "checkup", title: "Annual Wellness Exam", date: "2025-02-10", vet: "Dr. Sarah Lin", notes: "All clear. Heart and lungs normal." },
    { id: "H-3", dogId: "D-001", type: "test", title: "OFA Hips - Good", date: "2025-04-05", vet: "Veterinary Imaging Center" },
    { id: "H-4", dogId: "D-002", type: "vaccination", title: "Rabies 3-Year", date: "2025-01-20", vet: "Dr. Sarah Lin" },
    { id: "H-5", dogId: "D-002", type: "weight", title: "Weight Check - 48 lbs", date: "2025-05-12" },
  ];

  const events: Event[] = [
    { id: "E-1", title: "ABKC Summer Nationals 2026", date: "2026-07-18", location: "Tampa Convention Center", city: "Tampa, FL", country: "USA", type: "show", description: "The largest American Bully show of the summer. Over 400 dogs competing across all classes." },
    { id: "E-2", title: "Bully Expo CDMX", date: "2026-08-22", location: "Centro Banamex", city: "Mexico City", country: "Mexico", type: "expo", description: "Featuring top kennels from Latin America. Vendors, breeders, seminars." },
    { id: "E-3", title: "European Bully Championship", date: "2026-09-12", location: "Madrid Arena", city: "Madrid", country: "Spain", type: "competition", description: "Annual European championship featuring EU bloodlines." },
    { id: "E-4", title: "Bully Lovers Meetup - Miami", date: "2026-06-28", location: "Bayfront Park", city: "Miami, FL", country: "USA", type: "meetup", description: "Casual social meetup for owners and enthusiasts." },
    { id: "E-5", title: "Texas Bully Bash", date: "2026-10-05", location: "Fort Worth Stockyards", city: "Fort Worth, TX", country: "USA", type: "show", description: "Two-day show with championship judging." },
  ];

  const marketplace: MarketplaceListing[] = [
    { id: "M-1", type: "puppy", title: "Pocket Bully Female Puppy - Tri Color", description: "8-week-old female pocket bully, tri color, ABKC registered parents. Heavy bone, blocky head.", price: 4500, currency: "USD", location: "Miami, FL", sellerId: demoUserId, sellerName: "Crown Bullies Kennel", image: "🐶", posted: "2026-05-12T10:00:00Z" },
    { id: "M-2", type: "stud", title: "GR CH Zeus - Stud Service Available", description: "Proven sire of 6 champions. Solid black, 85lbs, exotic build. OFA hips. Fresh and frozen available.", price: 3500, currency: "USD", location: "Miami, FL", sellerId: demoUserId, sellerName: "Crown Bullies Kennel", image: "🦮", posted: "2026-04-22T10:00:00Z", pedigreeId: "BPX-1024-ZEUS-19" },
    { id: "M-3", type: "adult", title: "Adult XL Male - Show Quality", description: "2 year old XL male, fully titled, looking for new show home. 110 lbs.", price: 8000, currency: "USD", location: "Houston, TX", sellerId: breederId, sellerName: "Aztec Legends", image: "🐕", posted: "2026-05-28T10:00:00Z" },
    { id: "M-4", type: "equipment", title: "Premium Leather Show Collar Set", description: "Hand-made Italian leather collar with brass hardware. Multiple sizes available.", price: 180, currency: "USD", location: "Online", sellerId: breederId, sellerName: "Aztec Legends", image: "📿", posted: "2026-05-30T10:00:00Z" },
  ];

  write(KEYS.users, users);
  write(KEYS.dogs, dogs);
  write(KEYS.health, health);
  write(KEYS.events, events);
  write(KEYS.marketplace, marketplace);
  write(KEYS.litters, []);
  write(KEYS.transfers, []);
  localStorage.setItem(KEYS.seeded, "1");
}
