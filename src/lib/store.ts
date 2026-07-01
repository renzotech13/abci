"use client";

import type {
  User, Dog, HealthRecord, Litter, Transfer,
  Event, MarketplaceListing, Affix, AdminLog, BlogPost,
} from "./types";
import { generateId, generateCertificateId, generateAffixId } from "./utils";

const KEYS = {
  users: "abci:users",
  session: "abci:session",
  dogs: "abci:dogs",
  health: "abci:health",
  litters: "abci:litters",
  transfers: "abci:transfers",
  events: "abci:events",
  marketplace: "abci:marketplace",
  affixes: "abci:affixes",
  adminLogs: "abci:admin:logs",
  blogPosts: "abci:blog:posts",
  seeded: "abci:seeded:v3",
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

export function isAdmin(): boolean {
  const u = getCurrentUser();
  return u?.role === "admin";
}

export function adminUpdateUser(id: string, patch: Partial<User>): User | null {
  const users = getUsers().map(u => u.id === id ? { ...u, ...patch } : u);
  saveUsers(users);
  return users.find(u => u.id === id) || null;
}

export function adminDeleteUser(id: string) {
  saveUsers(getUsers().filter(u => u.id !== id));
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

/* ---------------- Affixes ---------------- */
export function getAffixes(): Affix[] { return read<Affix[]>(KEYS.affixes, []); }
export function getAffix(id: string): Affix | null {
  return getAffixes().find(a => a.id === id || a.affixId === id) || null;
}
export function addAffix(data: Omit<Affix, "id" | "affixId" | "createdAt" | "status">): Affix {
  const all = getAffixes();
  const newAffix: Affix = {
    ...data,
    id: generateId("A-"),
    affixId: generateAffixId(),
    createdAt: new Date().toISOString(),
    status: "active",
  };
  all.push(newAffix);
  write(KEYS.affixes, all);
  return newAffix;
}

/* ---------------- Admin logs ---------------- */
export function getAdminLogs(): AdminLog[] { return read<AdminLog[]>(KEYS.adminLogs, []); }
export function logAdminAction(action: string, target?: string, details?: string): AdminLog | null {
  const cur = getCurrentUser();
  if (!cur || cur.role !== "admin") return null;
  const log: AdminLog = {
    id: generateId("LOG-"),
    adminId: cur.id,
    adminName: cur.name,
    action, target, details,
    timestamp: new Date().toISOString(),
  };
  const all = getAdminLogs();
  all.unshift(log);
  write(KEYS.adminLogs, all.slice(0, 200));
  return log;
}

/* ---------------- Admin bulk operations ---------------- */
export function adminBulkAddDogs(rows: Partial<Dog>[]): { added: number; updated: number; skipped: number; errors: string[] } {
  const dogs = getDogs();
  // Índice por nro. de certificado para detectar duplicados ya existentes
  // (de una importación anterior, o de los datos demo precargados).
  const byCert = new Map<string, number>();
  dogs.forEach((d, i) => {
    if (d.certificateId) byCert.set(d.certificateId, i);
  });

  let added = 0, updated = 0, skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.name) { skipped++; errors.push("Fila sin nombre"); continue; }
    if (!row.dob) { skipped++; errors.push(`${row.name}: falta fecha de nacimiento`); continue; }

    const certificateId = row.certificateId || generateCertificateId();
    const existingIdx = certificateId ? byCert.get(certificateId) : undefined;

    const base: Dog = {
      id: existingIdx !== undefined ? dogs[existingIdx].id : generateId("D-"),
      certificateId,
      ownerId: row.ownerId || (existingIdx !== undefined ? dogs[existingIdx].ownerId : "GUEST"),
      name: row.name,
      callName: row.callName,
      breed: row.breed || "American Bully",
      variant: row.variant,
      gender: (String(row.gender || "").toLowerCase().startsWith("h") || String(row.gender || "").toLowerCase() === "female" || String(row.gender || "").toLowerCase() === "f") ? "female" : "male",
      color: row.color || "Negro sólido",
      weight: row.weight,
      height: row.height,
      dob: row.dob,
      microchip: row.microchip,
      sireName: row.sireName,
      damName: row.damName,
      kennelName: row.kennelName,
      breederName: row.breederName,
      location: row.location,
      notes: row.notes,
      titles: row.titles,
      photo: row.photo || (existingIdx !== undefined ? dogs[existingIdx].photo : undefined),
      registrationDate: existingIdx !== undefined ? dogs[existingIdx].registrationDate : (row.registrationDate || new Date().toISOString()),
      status: "active",
    };

    if (existingIdx !== undefined) {
      dogs[existingIdx] = base;
      updated++;
    } else {
      dogs.push(base);
      if (certificateId) byCert.set(certificateId, dogs.length - 1);
      added++;
    }
  }
  saveDogs(dogs);
  logAdminAction("Importación masiva de ejemplares", undefined, `${added} agregados · ${updated} actualizados · ${skipped} omitidos`);
  return { added, updated, skipped, errors };
}

/* Aplica un mapa { [certificateId]: photoUrl } a los ejemplares ya importados */
export function adminApplyPhotoMap(
  map: Record<string, string>,
  overwrite = false,
): { updated: number; skipped: number } {
  const dogs = getDogs();
  let updated = 0, skipped = 0;
  for (const dog of dogs) {
    const url = map[dog.certificateId];
    if (!url) { skipped++; continue; }
    if (dog.photo && !overwrite) { skipped++; continue; }
    dog.photo = url;
    updated++;
  }
  saveDogs(dogs);
  logAdminAction("Aplicación masiva de fotos", undefined, `${updated} fotos asignadas · ${skipped} omitidas`);
  return { updated, skipped };
}

/* ---------------- Admin blog ---------------- */
export function getStoredBlogPosts(): BlogPost[] { return read<BlogPost[]>(KEYS.blogPosts, []); }
export function adminSaveBlogPost(post: BlogPost): BlogPost {
  const all = getStoredBlogPosts();
  const idx = all.findIndex(p => p.id === post.id);
  if (idx >= 0) all[idx] = post; else all.unshift(post);
  write(KEYS.blogPosts, all);
  return post;
}
export function adminDeleteBlogPost(id: string) {
  write(KEYS.blogPosts, getStoredBlogPosts().filter(p => p.id !== id));
}

/* ---------------- Admin events ---------------- */
export function adminSaveEvent(event: Event): Event {
  const all = getEvents();
  const idx = all.findIndex(e => e.id === event.id);
  if (idx >= 0) all[idx] = event; else all.push(event);
  write(KEYS.events, all);
  return event;
}
export function adminDeleteEvent(id: string) {
  write(KEYS.events, getEvents().filter(e => e.id !== id));
}

/* ---------------- Admin affixes ---------------- */
export function adminSaveAffix(affix: Affix): Affix {
  const all = getAffixes();
  const idx = all.findIndex(a => a.id === affix.id);
  if (idx >= 0) all[idx] = affix; else all.push(affix);
  write(KEYS.affixes, all);
  return affix;
}
export function adminDeleteAffix(id: string) {
  write(KEYS.affixes, getAffixes().filter(a => a.id !== id));
}

/* ---------------- Admin marketplace ---------------- */
export function adminDeleteListing(id: string) {
  write(KEYS.marketplace, getMarketplace().filter(l => l.id !== id));
}

/* ---------------- Seed ---------------- */
export function seedData() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.seeded)) return;

  const demoUserId = "U-DEMO-001";
  const breederId = "U-DEMO-002";
  const adminId = "U-ADMIN-001";

  // IDs externos para criaderos reales del registro
  const ext = {
    flores: "U-EXT-FLORES",
    tmbull: "U-EXT-TMBULL",
    thiagos: "U-EXT-THIAGOS",
    lbk: "U-EXT-LBK",
    ostos: "U-EXT-OSTOS",
    yanez: "U-EXT-YANEZ",
    navarro: "U-EXT-NAVARRO",
    matt: "U-EXT-MATT",
    damaaza: "U-EXT-DAMAAZA",
    estela: "U-EXT-ESTELA",
    vascos: "U-EXT-VASCOS",
    vascosperu: "U-EXT-VASCOSPE",
    somos: "U-EXT-SOMOS",
    carlu: "U-EXT-CARLU",
    cocoa: "U-EXT-COCOA",
  };

  const users: User[] = [
    {
      id: adminId, email: "admin@abciregistro.app", password: "admin1234",
      name: "Dr. Marcos Velarde", kennelName: "ABCI World Wide — Oficina Central",
      country: "Perú", phone: "+51 987 000 100",
      bio: "Registrador General — ABCI World Wide. Administrador del sistema.",
      membership: "elite", role: "admin",
      createdAt: "2020-01-01T10:00:00.000Z",
    },
    {
      id: demoUserId, email: "demo@abciregistro.app", password: "demo1234",
      name: "Anthony Huamán", kennelName: "Figthing Bulls Kennel", affix: "FIGHTING BULL",
      country: "Perú", phone: "+51 987 555 019",
      bio: "Criadero peruano especializado en American Bully Pocket. Camada Mili/Mely/Moli/Malu nacida en mayo 2024.",
      membership: "elite", role: "user", createdAt: "2022-03-12T10:00:00.000Z",
    },
    {
      id: breederId, email: "ruby@bullycamp.app", password: "demo1234",
      name: "Rosa Castillo", kennelName: "BullyCamp Kennel", affix: "BULLYCAMP",
      country: "México", membership: "pro", role: "user",
      bio: "Criadero internacional con bloodlines XL y Extreme. Campeones ABCI 2024.",
      createdAt: "2021-09-04T10:00:00.000Z",
    },
    // Criaderos del registro real ABCI
    { id: ext.flores, email: "diego.flores@abci.app", password: "—", name: "Diego Armando Flores Quispe", kennelName: "Flores Bulls Kennel", affix: "FLORES BULLS", country: "Perú", membership: "pro", role: "user", bio: "Criadero peruano especializado en Exotic Bully con líneas Lilac Tri.", createdAt: "2023-05-10T10:00:00.000Z" },
    { id: ext.tmbull, email: "marcos.rodriguez@abci.app", password: "—", name: "Marcos Rodríguez García", kennelName: "TM Bull Kennel", affix: "TM BULL", country: "Perú", membership: "pro", role: "user", bio: "Líneas Exotic Bully con coloración Blue Merle.", createdAt: "2022-08-20T10:00:00.000Z" },
    { id: ext.thiagos, email: "thiago.velasquez@abci.app", password: "—", name: "Thiago Velásquez", kennelName: "Thiagos Bulls Kennel", affix: "THIAGOS BULLS", country: "Perú", membership: "pro", role: "user", bio: "Exotic Bullies con líneas premium de Vasco's Kennel Peru.", createdAt: "2022-11-05T10:00:00.000Z" },
    { id: ext.lbk, email: "lbk@abci.app", password: "—", name: "Luis Becerra", kennelName: "LBK Kennel", affix: "LBK", country: "Perú", membership: "free", role: "user", bio: "Criadero familiar dedicado a la cría responsable de Bullies.", createdAt: "2022-04-12T10:00:00.000Z" },
    { id: ext.ostos, email: "ostos@abci.app", password: "—", name: "Familia Ostos", kennelName: "Ostos Bullys", affix: "OSTOS BULLYS", country: "Perú", membership: "free", role: "user", createdAt: "2023-01-22T10:00:00.000Z" },
    { id: ext.yanez, email: "yanez@abci.app", password: "—", name: "Yanez", kennelName: "Yanez Bully", affix: "YANEZ BULLY", country: "Perú", membership: "free", role: "user", createdAt: "2023-02-18T10:00:00.000Z" },
    { id: ext.navarro, email: "navarro@abci.app", password: "—", name: "Navarro", kennelName: "Navarro Bull", affix: "NAVARRO BULL", country: "Perú", membership: "free", role: "user", bio: "Criadero peruano con líneas Pocket y Standard.", createdAt: "2023-03-15T10:00:00.000Z" },
    { id: ext.matt, email: "mattcia@abci.app", password: "—", name: "Matt Cia", kennelName: "Matt Cia Bulls", affix: "MATT CIA BULLS", country: "Perú", membership: "free", role: "user", createdAt: "2023-04-20T10:00:00.000Z" },
    { id: ext.damaaza, email: "damaaza@abci.app", password: "—", name: "Damaaza", kennelName: "Damaaza Bulls", affix: "DAMAAZA BULLS", country: "Perú", membership: "free", role: "user", createdAt: "2023-05-12T10:00:00.000Z" },
    { id: ext.estela, email: "estela@abci.app", password: "—", name: "Estela", kennelName: "Estela Bulls", affix: "ESTELA BULLS", country: "Perú", membership: "free", role: "user", createdAt: "2023-06-25T10:00:00.000Z" },
    { id: ext.vascos, email: "vascos@abci.app", password: "—", name: "Vasco", kennelName: "Vasco's Kennel", affix: "VASCO'S KENNEL", country: "Perú", membership: "elite", role: "user", bio: "Líneas reconocidas a nivel nacional. Reproductores titulados.", createdAt: "2020-09-10T10:00:00.000Z" },
    { id: ext.vascosperu, email: "vascosperu@abci.app", password: "—", name: "Vasco's Kennel Peru", kennelName: "Vasco's Kennel Peru", affix: "VASCO'S KENNEL PERU", country: "Perú", membership: "elite", role: "user", bio: "Filial peruana de Vasco's Kennel con bloodline propia.", createdAt: "2021-02-14T10:00:00.000Z" },
    { id: ext.somos, email: "somos@abci.app", password: "—", name: "SomosBullys", kennelName: "SomosBullys", affix: "SOMOSBULLYS", country: "Perú", membership: "pro", role: "user", createdAt: "2022-07-08T10:00:00.000Z" },
    { id: ext.carlu, email: "carlu@abci.app", password: "—", name: "Carlu Bulls", kennelName: "Carlu Bulls", affix: "CARLU BULLS", country: "Perú", membership: "free", role: "user", createdAt: "2023-08-30T10:00:00.000Z" },
    { id: ext.cocoa, email: "cocoa@abci.app", password: "—", name: "Cocoa Bulls", kennelName: "Cocoa Bulls Kennel", affix: "COCOA BULLS", country: "Perú", membership: "pro", role: "user", bio: "Criadero peruano con líneas Chocolate Tri y reproductores Jireh.", createdAt: "2022-12-05T10:00:00.000Z" },
  ];

  const dogs: Dog[] = [
    // Padres Fighting Bulls (genealogía interna)
    {
      id: "D-SIRE-001", certificateId: "28401", ownerId: demoUserId,
      name: "FIGTHING BULL KHABIT", callName: "Khabit", breed: "American Bully",
      variant: "Pocket", gender: "male", color: "Negro sólido", weight: 22, height: 40,
      dob: "2021-08-15", microchip: "900233005206190", kennelName: "Figthing Bulls Kennel",
      breederName: "Anthony Cristhian Huamán Quiroz",
      sireName: "VASCO'S KENNEL TANK", damName: "TM BULL NALA",
      titles: ["Reproductor confiable"],
      registrationDate: "2021-12-01T10:00:00.000Z", status: "active",
      location: "Lima, Perú",
    },
    {
      id: "D-DAM-001", certificateId: "28950", ownerId: demoUserId,
      name: "FIGTHING BULL CARACHAMA", callName: "Carachama", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Azul tri", weight: 19, height: 36,
      dob: "2022-04-22", microchip: "900233005206191", kennelName: "Figthing Bulls Kennel",
      breederName: "Anthony Cristhian Huamán Quiroz",
      sireName: "BULLYCAMP STORM", damName: "VASCO'S PEARL",
      registrationDate: "2022-07-10T10:00:00.000Z", status: "active",
      location: "Lima, Perú",
    },

    // Camada Fighting Bulls — datos reales del registro ABCI (nacidas 2024-05-12)
    {
      id: "D-MILI", certificateId: "29601", ownerId: demoUserId,
      name: "FIGTHING BULL MILI", callName: "Mili", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Azul",
      dob: "2024-05-12", microchip: "900233005206193", kennelName: "Figthing Bulls Kennel",
      breederName: "Anthony Cristhian Huamán Quiroz",
      sireId: "D-SIRE-001", damId: "D-DAM-001",
      sireName: "FIGTHING BULL KHABIT", damName: "FIGTHING BULL CARACHAMA",
      registrationDate: "2024-08-20T10:00:00.000Z", status: "active",
      location: "Lima, Perú",
    },
    {
      id: "D-MELY", certificateId: "29600", ownerId: demoUserId,
      name: "FIGTHING BULL MELY", callName: "Mely", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Azul tri",
      dob: "2024-05-12", microchip: "900233005206194", kennelName: "Figthing Bulls Kennel",
      breederName: "Anthony Cristhian Huamán Quiroz",
      sireId: "D-SIRE-001", damId: "D-DAM-001",
      sireName: "FIGTHING BULL KHABIT", damName: "FIGTHING BULL CARACHAMA",
      registrationDate: "2024-08-20T10:00:00.000Z", status: "active",
      location: "Lima, Perú",
    },
    {
      id: "D-MOLI", certificateId: "29599", ownerId: demoUserId,
      name: "FIGTHING BULL MOLI", callName: "Moli", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Chocolate tri",
      dob: "2024-05-12", microchip: "900233005206195", kennelName: "Figthing Bulls Kennel",
      breederName: "Anthony Cristhian Huamán Quiroz",
      sireId: "D-SIRE-001", damId: "D-DAM-001",
      sireName: "FIGTHING BULL KHABIT", damName: "FIGTHING BULL CARACHAMA",
      registrationDate: "2024-08-20T10:00:00.000Z", status: "active",
      location: "Lima, Perú",
    },
    {
      id: "D-MALU", certificateId: "29598", ownerId: demoUserId,
      name: "FIGTHING BULL MALU", callName: "Malu", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Lila tri",
      dob: "2024-05-12", microchip: "900233005206196", kennelName: "Figthing Bulls Kennel",
      breederName: "Anthony Cristhian Huamán Quiroz",
      sireId: "D-SIRE-001", damId: "D-DAM-001",
      sireName: "FIGTHING BULL KHABIT", damName: "FIGTHING BULL CARACHAMA",
      registrationDate: "2024-08-20T10:00:00.000Z", status: "active",
      location: "Lima, Perú",
    },

    // Ejemplares del registro ABCI con datos reales
    {
      id: "D-TAZMY", certificateId: "30683", ownerId: ext.flores,
      name: "FLORES BULLS KENNEL TAZMY", callName: "Tazmy", breed: "Exotic Bully",
      variant: "Pocket", gender: "male", color: "Lila tri",
      dob: "2024-10-15", microchip: "90023300578", kennelName: "Flores Bulls Kennel",
      breederName: "Diego Armando Flores Quispe",
      sireName: "MALA FAMA BULLS STELL BOSS", damName: "KENNEL FLORES BULLS SYRAX",
      registrationDate: "2024-12-10T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-SKY", certificateId: "29602", ownerId: ext.tmbull,
      name: "TM BULL SKY ANDRADE CHAVEZ", callName: "Sky", breed: "Exotic Bully",
      variant: "Pocket", gender: "female", color: "Blue Merle",
      dob: "2024-04-05", microchip: "900233005206509", kennelName: "TM Bull Kennel",
      breederName: "Marcos Rodríguez García",
      sireName: "TORRES BULLYS LIL NARUTO", damName: "TM BULL NALA",
      registrationDate: "2024-07-22T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-DREAMFYRE", certificateId: "29583", ownerId: ext.thiagos,
      name: "THIAGOS BULLS KENNEL DREAMFYRE", callName: "Dreamfyre", breed: "Exotic Bully",
      variant: "Pocket", gender: "female", color: "Lila tri",
      dob: "2024-02-21", microchip: "9002330052056173", kennelName: "Thiagos Bulls Kennel",
      breederName: "Thiago Velásquez",
      sireName: "VASCO'S KENNEL PERU FUTURE", damName: "CANIBULLS SAMANTA",
      registrationDate: "2024-05-30T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-BAKI", certificateId: "29566", ownerId: ext.lbk,
      name: "LBK BAKI", callName: "Baki", breed: "American Bully",
      variant: "Pocket", gender: "male", color: "Atigrado",
      dob: "2022-11-12", microchip: "900233005206580", kennelName: "LBK Kennel",
      breederName: "Luis Becerra",
      sireName: "—", damName: "—",
      registrationDate: "2023-02-18T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-ADA", certificateId: "29563", ownerId: ext.ostos,
      name: "OSTOS BULLYS ADA CATTALEYA", callName: "Ada Cattaleya", breed: "American Bully",
      variant: "Standard", gender: "female", color: "Azul tri",
      dob: "2023-09-08", microchip: "900233005206571", kennelName: "Ostos Bullys",
      breederName: "Familia Ostos",
      sireName: "—", damName: "—",
      registrationDate: "2024-01-15T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-HERCULES", certificateId: "29549", ownerId: ext.yanez,
      name: "YANEZ BULLY HÉRCULES", callName: "Hércules", breed: "American Bully",
      variant: "Standard", gender: "male", color: "Negro sólido",
      dob: "2023-07-20", microchip: "900233005206553", kennelName: "Yanez Bully",
      breederName: "Yanez",
      sireName: "—", damName: "—",
      registrationDate: "2023-12-04T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-PERLA", certificateId: "29548", ownerId: ext.navarro,
      name: "NAVARRO BULL PERLA", callName: "Perla", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Champagne",
      dob: "2023-10-02", microchip: "900233005206548", kennelName: "Navarro Bull",
      breederName: "Navarro",
      sireName: "—", damName: "—",
      registrationDate: "2024-02-10T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-ATENEA", certificateId: "29587", ownerId: ext.matt,
      name: "MATT CIA BULLS ATENEA", callName: "Atenea", breed: "American Bully",
      variant: "Standard", gender: "female", color: "Lila",
      dob: "2024-01-28", microchip: "900233005206587", kennelName: "Matt Cia Bulls",
      breederName: "Matt Cia",
      sireName: "—", damName: "—",
      registrationDate: "2024-05-04T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-ATHENA", certificateId: "29581", ownerId: ext.damaaza,
      name: "DAMAAZA BULLS ATHENA", callName: "Athena", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Azul",
      dob: "2024-01-12", microchip: "900233005206581", kennelName: "Damaaza Bulls",
      breederName: "Damaaza",
      sireName: "—", damName: "—",
      registrationDate: "2024-04-18T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-PARIS", certificateId: "29580", ownerId: ext.estela,
      name: "ESTELA BULLS PARIS", callName: "Paris", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Chocolate",
      dob: "2024-01-15", microchip: "900233005206580", kennelName: "Estela Bulls",
      breederName: "Estela",
      sireName: "—", damName: "—",
      registrationDate: "2024-04-20T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-MCGREGOR", certificateId: "29569", ownerId: ext.vascos,
      name: "VASCO'S KENNEL MC GREGOR", callName: "Mc Gregor", breed: "American Bully",
      variant: "Standard", gender: "male", color: "Atigrado",
      dob: "2023-08-30", microchip: "900233005206569", kennelName: "Vasco's Kennel",
      breederName: "Vasco",
      sireName: "—", damName: "—",
      titles: ["Línea destacada"],
      registrationDate: "2023-12-08T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-LKCHERO", certificateId: "29561", ownerId: ext.vascosperu,
      name: "VASCO'S KENNEL PERU LK CHERO", callName: "LK Chero", breed: "American Bully",
      variant: "Standard", gender: "male", color: "Negro y blanco",
      dob: "2023-07-14", microchip: "900233005206561", kennelName: "Vasco's Kennel Peru",
      breederName: "Vasco's Kennel Peru",
      sireName: "—", damName: "—",
      registrationDate: "2023-11-22T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-BLASTER", certificateId: "29555", ownerId: ext.somos,
      name: "SOMOSBULLYS BLASTER", callName: "Blaster", breed: "American Bully",
      variant: "Pocket", gender: "male", color: "Azul",
      dob: "2023-09-05", microchip: "900233005206555", kennelName: "SomosBullys",
      breederName: "SomosBullys",
      sireName: "—", damName: "—",
      registrationDate: "2024-01-30T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-NAYROVIC", certificateId: "29544", ownerId: ext.carlu,
      name: "CARLU BULLS NAYROVIC", callName: "Nayrovic", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Atigrado",
      dob: "2023-06-22", microchip: "900233005206544", kennelName: "Carlu Bulls",
      breederName: "Carlu",
      sireName: "—", damName: "—",
      registrationDate: "2023-10-11T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-TOKIO", certificateId: "29542", ownerId: ext.navarro,
      name: "NAVARRO BULL TOKIO", callName: "Tokio", breed: "American Bully",
      variant: "Pocket", gender: "female", color: "Azul tri",
      dob: "2023-06-10", microchip: "900233005206542", kennelName: "Navarro Bull",
      breederName: "Navarro",
      sireName: "—", damName: "—",
      registrationDate: "2023-09-25T10:00:00.000Z", status: "active",
      location: "Perú",
    },
    {
      id: "D-DRAX", certificateId: "29539", ownerId: ext.cocoa,
      name: "COCOA BULLS DRAX", callName: "Drax", breed: "American Bully",
      variant: "Pocket", gender: "male", color: "Chocolate tri",
      dob: "2023-05-18", microchip: "9002330005205683", kennelName: "Cocoa Bulls Kennel",
      breederName: "Cocoa Bulls",
      sireName: "JIREH BULLS BISON BOY", damName: "JP BULL VALKIRIA",
      registrationDate: "2023-08-30T10:00:00.000Z", status: "active",
      location: "Perú",
    },

    // Ejemplares de BullyCamp (no en el registro real, pero parte del demo internacional)
    {
      id: "D-MEDUZA", certificateId: "27889", ownerId: breederId,
      name: "BULLYCAMP MEDUZA", callName: "Meduza", breed: "American Bully",
      variant: "Extreme", gender: "male", color: "Merle azul", weight: 43, height: 50,
      dob: "2023-08-10", microchip: "900233005206800", kennelName: "BullyCamp Kennel",
      breederName: "Rosa Castillo",
      sireName: "AZTEC TITAN", damName: "BULLYCAMP PRINCESA",
      titles: ["Mejor de la Raza 2024 ABCI"],
      registrationDate: "2023-11-15T10:00:00.000Z", status: "active",
      location: "Ciudad de México, México",
    },
    {
      id: "D-AZUMI", certificateId: "26551", ownerId: breederId,
      name: "BULLYCAMP AZUMI", callName: "Azumi", breed: "American Bully",
      variant: "Standard", gender: "female", color: "Lila tri", weight: 28, height: 42,
      dob: "2023-01-18", microchip: "900233005206811", kennelName: "BullyCamp Kennel",
      breederName: "Rosa Castillo",
      sireName: "ARIZONA MAKO", damName: "MISARI BULLS LUNA",
      registrationDate: "2023-04-22T10:00:00.000Z", status: "active",
      location: "Ciudad de México, México",
    },
  ];

  const health: HealthRecord[] = [
    { id: "H-1", dogId: "D-MILI", type: "vaccination", title: "Refuerzo anual quíntuple", date: "2025-01-20", vet: "Dra. Sara Lin — Clínica Veterinaria San Borja" },
    { id: "H-2", dogId: "D-MILI", type: "checkup", title: "Chequeo anual de bienestar", date: "2025-02-10", vet: "Dra. Sara Lin", notes: "Todo en orden. Corazón y pulmones normales." },
    { id: "H-3", dogId: "D-MILI", type: "test", title: "Radiografía displasia de cadera — Excelente", date: "2025-04-05", vet: "Centro de Imagen Veterinaria Lima" },
    { id: "H-4", dogId: "D-MELY", type: "vaccination", title: "Refuerzo anual quíntuple", date: "2025-01-20", vet: "Dra. Sara Lin" },
    { id: "H-5", dogId: "D-MELY", type: "weight", title: "Control de peso — 19 kg", date: "2025-05-12" },
    { id: "H-6", dogId: "D-MOLI", type: "vaccination", title: "Refuerzo anual quíntuple", date: "2025-01-20", vet: "Dra. Sara Lin" },
    { id: "H-7", dogId: "D-MALU", type: "vaccination", title: "Refuerzo anual quíntuple", date: "2025-01-20", vet: "Dra. Sara Lin" },
  ];

  const events: Event[] = [
    { id: "E-1", title: "Copa Nacional ABCI 2026 — Perú", date: "2026-07-18", location: "Centro de Convenciones Jockey Plaza", city: "Lima", country: "Perú", type: "show", description: "La exhibición canina más grande del Perú. Más de 300 ejemplares compitiendo en todas las categorías ABCI." },
    { id: "E-2", title: "Expo Bully Latinoamérica CDMX", date: "2026-08-22", location: "Centro Banamex", city: "Ciudad de México", country: "México", type: "expo", description: "Reunión de los mejores criaderos de toda América Latina. Vendedores, seminarios y juzgamiento oficial." },
    { id: "E-3", title: "Campeonato Sudamericano ABCI", date: "2026-09-12", location: "Estadio Centenario", city: "Montevideo", country: "Uruguay", type: "competition", description: "Campeonato regional con criaderos de Argentina, Chile, Uruguay, Brasil y Perú." },
    { id: "E-4", title: "Encuentro Bullies Lima Norte", date: "2026-06-28", location: "Parque de las Leyendas", city: "Lima", country: "Perú", type: "meetup", description: "Reunión casual para dueños y aficionados al American Bully en Lima." },
    { id: "E-5", title: "Bully Bash Bogotá", date: "2026-10-05", location: "Parque Simón Bolívar", city: "Bogotá", country: "Colombia", type: "show", description: "Dos días de exhibición con juzgamiento oficial certificado ABCI." },
  ];

  const marketplace: MarketplaceListing[] = [
    { id: "M-1", type: "puppy", title: "Cachorra Pocket Tri — 8 semanas", description: "Cachorra hembra American Bully Pocket, color azul tri. Padres campeones titulados ABCI con afijo FIGHTING BULL. Estructura sólida y cabeza blocky.", price: 1800, currency: "USD", location: "Lima, Perú", sellerId: demoUserId, sellerName: "Fighting Bulls Kennel", image: "🐶", posted: "2026-05-12T10:00:00Z" },
    { id: "M-2", type: "stud", title: "FIGHTING BULL KHABIT — Servicio de monta", description: "Reproductor probado, padre de 8 cachorros titulados. Negro sólido, 38 kg, estructura exótica. Caderas radiografiadas OFA.", price: 1200, currency: "USD", location: "Lima, Perú", sellerId: demoUserId, sellerName: "Fighting Bulls Kennel", image: "🦮", posted: "2026-04-22T10:00:00Z", pedigreeId: "28401" },
    { id: "M-3", type: "adult", title: "Macho XL Adulto — Calidad exposición", description: "Ejemplar de 2 años, titulado, buscando hogar para exposición. 43 kg, líneas BullyCamp.", price: 3500, currency: "USD", location: "Ciudad de México, México", sellerId: breederId, sellerName: "BullyCamp Kennel", image: "🐕", posted: "2026-05-28T10:00:00Z" },
    { id: "M-4", type: "equipment", title: "Set de collar de cuero premium", description: "Collar de cuero italiano artesanal con herrajes de bronce. Varias tallas disponibles.", price: 90, currency: "USD", location: "Envío nacional", sellerId: breederId, sellerName: "BullyCamp Kennel", image: "📿", posted: "2026-05-30T10:00:00Z" },
  ];

  const affixes: Affix[] = [
    { id: "A-1", affixId: "AFX-1001", name: "FIGHTING BULL", ownerId: demoUserId, ownerName: "Anthony Huamán", country: "Perú", createdAt: "2022-03-15T10:00:00Z", status: "active", description: "Afijo de Figthing Bulls Kennel, criadero peruano de American Bully Pocket.", specialty: "American Bully — Pocket" },
    { id: "A-2", affixId: "AFX-1002", name: "BULLYCAMP", ownerId: breederId, ownerName: "Rosa Castillo", country: "México", createdAt: "2021-09-10T10:00:00Z", status: "active", description: "Criadero mexicano enfocado en líneas XL y Extreme.", specialty: "American Bully — XL / Extreme" },
    { id: "A-3", affixId: "AFX-1003", name: "FLORES BULLS", ownerId: ext.flores, ownerName: "Diego Armando Flores Quispe", country: "Perú", createdAt: "2023-05-10T10:00:00Z", status: "active", specialty: "Exotic Bully — Lilac Tri" },
    { id: "A-4", affixId: "AFX-1004", name: "TM BULL", ownerId: ext.tmbull, ownerName: "Marcos Rodríguez García", country: "Perú", createdAt: "2022-08-20T10:00:00Z", status: "active", specialty: "Exotic Bully — Blue Merle" },
    { id: "A-5", affixId: "AFX-1005", name: "THIAGOS BULLS", ownerId: ext.thiagos, ownerName: "Thiago Velásquez", country: "Perú", createdAt: "2022-11-05T10:00:00Z", status: "active", specialty: "Exotic Bully — Pocket" },
    { id: "A-6", affixId: "AFX-1006", name: "LBK", ownerId: ext.lbk, ownerName: "Luis Becerra", country: "Perú", createdAt: "2022-04-12T10:00:00Z", status: "active", specialty: "American Bully — Pocket" },
    { id: "A-7", affixId: "AFX-1007", name: "OSTOS BULLYS", ownerId: ext.ostos, ownerName: "Familia Ostos", country: "Perú", createdAt: "2023-01-22T10:00:00Z", status: "active", specialty: "American Bully — Standard" },
    { id: "A-8", affixId: "AFX-1008", name: "YANEZ BULLY", ownerId: ext.yanez, ownerName: "Yanez", country: "Perú", createdAt: "2023-02-18T10:00:00Z", status: "active", specialty: "American Bully — Standard" },
    { id: "A-9", affixId: "AFX-1009", name: "NAVARRO BULL", ownerId: ext.navarro, ownerName: "Navarro", country: "Perú", createdAt: "2023-03-15T10:00:00Z", status: "active", specialty: "American Bully — Pocket" },
    { id: "A-10", affixId: "AFX-1010", name: "MATT CIA BULLS", ownerId: ext.matt, ownerName: "Matt Cia", country: "Perú", createdAt: "2023-04-20T10:00:00Z", status: "active", specialty: "American Bully — Standard" },
    { id: "A-11", affixId: "AFX-1011", name: "DAMAAZA BULLS", ownerId: ext.damaaza, ownerName: "Damaaza", country: "Perú", createdAt: "2023-05-12T10:00:00Z", status: "active", specialty: "American Bully — Pocket" },
    { id: "A-12", affixId: "AFX-1012", name: "ESTELA BULLS", ownerId: ext.estela, ownerName: "Estela", country: "Perú", createdAt: "2023-06-25T10:00:00Z", status: "active", specialty: "American Bully — Pocket" },
    { id: "A-13", affixId: "AFX-1013", name: "VASCO'S KENNEL", ownerId: ext.vascos, ownerName: "Vasco", country: "Perú", createdAt: "2020-09-10T10:00:00Z", status: "active", description: "Líneas históricas con campeones nacionales.", specialty: "American Bully — Standard" },
    { id: "A-14", affixId: "AFX-1014", name: "VASCO'S KENNEL PERU", ownerId: ext.vascosperu, ownerName: "Vasco's Kennel Peru", country: "Perú", createdAt: "2021-02-14T10:00:00Z", status: "active", specialty: "American Bully — Standard" },
    { id: "A-15", affixId: "AFX-1015", name: "SOMOSBULLYS", ownerId: ext.somos, ownerName: "SomosBullys", country: "Perú", createdAt: "2022-07-08T10:00:00Z", status: "active", specialty: "American Bully — Pocket" },
    { id: "A-16", affixId: "AFX-1016", name: "CARLU BULLS", ownerId: ext.carlu, ownerName: "Carlu Bulls", country: "Perú", createdAt: "2023-08-30T10:00:00Z", status: "active", specialty: "American Bully — Pocket" },
    { id: "A-17", affixId: "AFX-1017", name: "COCOA BULLS", ownerId: ext.cocoa, ownerName: "Cocoa Bulls", country: "Perú", createdAt: "2022-12-05T10:00:00Z", status: "active", description: "Criadero peruano con líneas Chocolate Tri.", specialty: "American Bully — Pocket / Chocolate Tri" },
  ];

  write(KEYS.users, users);
  write(KEYS.dogs, dogs);
  write(KEYS.health, health);
  write(KEYS.events, events);
  write(KEYS.marketplace, marketplace);
  write(KEYS.affixes, affixes);
  write(KEYS.litters, []);
  write(KEYS.transfers, []);
  localStorage.setItem(KEYS.seeded, "1");
}
