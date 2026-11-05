export const CV_URL = `${import.meta.env.BASE_URL}cv/lemith-nanditha-cv.pdf`;
export const CV_FILENAME = "Lemith-Nanditha-CV.pdf";

export async function fetchCv(url: string): Promise<Blob | null> {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404 || response.status === 410) return null;
  if (!response.ok) throw new Error("The CV could not be downloaded.");

  const file = await response.blob();
  // An SPA rewrite can return index.html with status 200 for a missing file.
  if (await file.slice(0, 5).text() !== "%PDF-") return null;
  return new Blob([file], { type: "application/pdf" });
}
