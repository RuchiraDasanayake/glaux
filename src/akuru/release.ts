import release from "./release.json";

export interface ReleaseFile {
  name: string;
  bytes: number;
  sha256: string;
}

export const RELEASE: {
  version: string;
  date: string;
  files: Record<"setup" | "portable", ReleaseFile>;
} = release;

const DOWNLOADS = (
  import.meta.env.VITE_AKURU_DOWNLOADS || "https://downloads.useglaux.com/akuru"
).replace(/\/+$/, "");

export const downloadUrl = (file: ReleaseFile) => `${DOWNLOADS}/${encodeURIComponent(file.name)}`;

/** Windows Explorer counts in 1024s but labels them MB; match what people will see in Downloads. */
export const fileSize = (file: ReleaseFile) => `${Math.round(file.bytes / 1024 ** 2)} MB`;

export const releaseDate = new Date(`${RELEASE.date}T00:00:00Z`).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
