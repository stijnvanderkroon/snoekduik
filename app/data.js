/** Laadt data/soorten.json en houdt het in het geheugen. */

let bestand = null;
let opId = new Map();

export async function laadSoorten() {
  // Relatief pad, zodat de app ook onder /<repo>/ op GitHub Pages werkt.
  const res = await fetch('data/soorten.json');
  if (!res.ok) throw new Error(`data/soorten.json laden mislukte (${res.status})`);
  bestand = await res.json();
  opId = new Map(bestand.soorten.map((s) => [s.id, s]));
  return bestand;
}

export const soorten = () => bestand?.soorten ?? [];
export const soortOpId = (id) => opId.get(id) ?? null;
export const modules = () => bestand?.modules ?? {};
export const drempelQuiz = () => bestand?.drempelQuiz ?? 1;
export const streefFotos = () => bestand?.streefFotos ?? 5;

export function statistiek() {
  const alle = soorten();
  const gekeurd = alle.reduce((n, s) => n + s.fotos.filter((f) => f.gekeurd).length, 0);
  return {
    soorten: alle.length,
    gekeurd,
    soortenMetGekeurd: alle.filter((s) => s.fotos.some((f) => f.gekeurd)).length,
    quizKlaar: alle.filter((s) => s.quizKlaar).length,
  };
}
