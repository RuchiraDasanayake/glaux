import { useEffect, useState } from "react";
import bundled from "./release.json";

export interface ReleaseFile {
  name: string;
  bytes: number;
  sha256: string;
}

export interface Release {
  version: string;
  date: string;
  files: Record<"setup" | "portable", ReleaseFile>;
}

/** The release this build knew about; shown first, and kept if the live list can't be read. */
export const RELEASE: Release = bundled;

const DOWNLOADS = (
  import.meta.env.VITE_AKURU_DOWNLOADS || "https://downloads.useglaux.com/akuru"
).replace(/\/+$/, "");

/** Written beside the installers by the app's `pnpm release`, so a release never needs a site deploy. */
export const RELEASE_URL = `${DOWNLOADS}/release.json`;

const isFile = (value: unknown): value is ReleaseFile => {
  const file = value as ReleaseFile | null;
  return (
    typeof file?.name === "string" &&
    /^[\w.-]+\.exe$/.test(file.name) &&
    Number.isFinite(file.bytes) &&
    typeof file.sha256 === "string" &&
    /^[0-9a-f]{64}$/i.test(file.sha256)
  );
};

const isRelease = (value: unknown): value is Release => {
  const release = value as Release | null;
  return (
    typeof release?.version === "string" &&
    /^\d+\.\d+\.\d+$/.test(release.version) &&
    typeof release.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(release.date) &&
    isFile(release.files?.setup) &&
    isFile(release.files?.portable)
  );
};

/** The newest release: the bundled one at first, then whatever release.json on the download host says. */
export function useRelease(): Release {
  const [release, setRelease] = useState(RELEASE);
  useEffect(() => {
    const controller = new AbortController();
    fetch(RELEASE_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((live: unknown) => {
        if (isRelease(live)) setRelease(live);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return release;
}

export const downloadUrl = (file: ReleaseFile) => `${DOWNLOADS}/${encodeURIComponent(file.name)}`;

/** Windows Explorer counts in 1024s but labels them MB; match what people will see in Downloads. */
export const fileSize = (file: ReleaseFile) => `${Math.round(file.bytes / 1024 ** 2)} MB`;

export const releaseDate = (release: Release) =>
  new Date(`${release.date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
