export type CertificateFields = {
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
  link: string;
  coverKey: string;
};
export type StudioCertificate = CertificateFields & {
  id: string;
  revision: string;
  status: "draft" | "published";
  updatedAt: string;
};
export type PublicCertificate = Omit<CertificateFields, "coverKey"> & { id: string; image: string };
export type CertificateCatalog = { certificates: StudioCertificate[]; migrated: boolean };

export function validIssueDate(value: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
