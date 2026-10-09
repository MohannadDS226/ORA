import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const media = [
  ["media/chunks/ora-film", "public/assets/ora-film-web.mp4"],
  ["media/chunks/ora-intro", "public/assets/ora-intro.mp4"],
];

for (const [sourceDirectory, targetFile] of media) {
  try {
    const target = await stat(targetFile);
    if (target.size > 0) continue;
  } catch {
    // The GitHub source stores large media in portable chunks.
  }

  const parts = (await readdir(sourceDirectory)).sort();
  const buffers = await Promise.all(
    parts.map((part) => readFile(path.join(sourceDirectory, part)))
  );
  await mkdir(path.dirname(targetFile), { recursive: true });
  await writeFile(targetFile, Buffer.concat(buffers));
  console.log(`Assembled ${targetFile}`);
}
