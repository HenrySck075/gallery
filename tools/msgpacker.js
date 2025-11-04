// Scans for all .json files and encode each into MessagePack (save as a .mpk file)

import fs from 'fs';
import { encode } from '@msgpack/msgpack';

const inputDir = '_site'; // Directory containing .json files

for (const file of fs.readdirSync(inputDir, {recursive: true})) {
  if (file.endsWith(".json") && !file.startsWith("package")) {
    const filePath = `${inputDir}/${file}`;
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonData);
    const encoded = encode(data);
    const outputFilePath = filePath.replace('.json', '.mpk');
    fs.writeFileSync(outputFilePath, Buffer.from(encoded));
    fs.unlinkSync(filePath);
  }
}
