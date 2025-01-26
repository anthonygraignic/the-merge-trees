import * as fs from 'fs';
import {TheMergeTree} from '../typechain';

export async function saveToSVG(contract: TheMergeTree, tokenId: number, fileName: string) {
  const svgResult = await contract.renderTokenById(tokenId);
  writeToSvg(fileName, svgResult);
}

export function writeToSvg(fileName: string, content: string) {
  fs.writeFile(
    `images/${fileName}.svg`,
    `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs><marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"><circle cx="5" cy="5" r="5" fill="#0B6623" /></marker>
          ${content}
        <rect width="1024" height="24" y="1000" style="fill:#2e8b57" />
        <text x="0" y="1022" fill="white">I love SVG!</text>
      </svg>
      `,
    function (err) {
      if (err) throw err;
    }
  );
}
export function writeToSvgRaw(fileName: string, content: string) {
  fs.writeFile(
    `images/${fileName}.svg`,
    `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
          ${content}
      </svg>
      `,
    function (err) {
      if (err) throw err;
    }
  );
}
export function writeJSON(fileName: string, content: string) {
  fs.writeFile(`images/${fileName}.json`, content, function (err) {
    if (err) throw err;
  });
}
export function writeJSONAndSVG(fileName: string, content: string) {
  const decodedJson = atob(content.replace('data:application/json;base64,', ''));
  fs.writeFile(`images/${fileName}.json`, decodedJson, function (err) {
    if (err) throw err;
  });
  fs.writeFile(
    `images/${fileName}.svg`,
    atob(JSON.parse(decodedJson).image.replace('data:image/svg+xml;base64,', '')),
    function (err) {
      if (err) throw err;
    }
  );
}

// 392699081698724160; // PI/8
// 523598775598298900; // PI/6
// 785398163397448300; // PI/4
// 1047197551196597800; // PI/3
// MAX~1237197551196597800
// 1570796326794896600; // PI/2
// export function getTreeStructData(
//   trunkLength: number,
//   trunkDiameter: number,
//   segments: number,
//   branches: number,
//   angle: string,
//   cuts: number
// ): ITreeSeeder.TreeStruct {
//   // return ethers.utils.AbiCoder.prototype.encode(
//   //   ['uint32', 'uint32', 'uint8', 'uint256'],
//   //   [trunkLength, trunkDiameter, segments, init0]
//   // );
//   return {
//     initLength: ethers.BigNumber.from(trunkLength),
//     diameter: ethers.BigNumber.from(trunkDiameter),
//     segments: ethers.BigNumber.from(segments),
//     branches: ethers.BigNumber.from(branches),
//     angle: ethers.BigNumber.from(angle),
//     cuts: ethers.BigNumber.from(cuts),
//   };
// }
