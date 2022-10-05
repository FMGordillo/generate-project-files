/**
 * @author Facundo Martin Gordillo<facundomgordillo@gmail.com>
 * @license Apache-2.0
 */

const styledFileContent = `
import styled from "styled-components";

export const Container = styled.div\`\`;
`;

const testFileContent = (dirName: string) => `
import ${dirName} from "./${dirName}";
import { render } from "@testing-library/react";

describe("<${dirName} />", () => {
  it("should render", () => {
    const { getByText } = render(<${dirName} />);
    expect(getByText("Hello world")).toBeInTheDocument();
  });
};
`;

const componentFileContent = (dirName: string) => `
const ${dirName} = () => {
  return (
    <div>Hello world</div>
  );
};

export default ${dirName};
`;

const pascalCaseRegex =
  /[A-Z]([A-Z0-9]*[a-z][a-z0-9]*[A-Z]|[a-z0-9]*[A-Z][A-Z0-9]*[a-z])[A-Za-z0-9]*/;

function checkSyntax(name: string) {
  if (!pascalCaseRegex.test(name)) {
    throw new Error("Error: Directory name must be in PascalCase");
  }
}

async function createFiles(dirName: string) {
  try {
    if (!dirName) {
      throw new Error("No name was provided");
    }
    const encoder = new TextEncoder();

    console.log(`Creating file: ${dirName}.tsx`);
    await Deno.writeFile(
      `./${dirName}/${dirName}.tsx`,
      encoder.encode(componentFileContent(dirName)),
    );

    console.log(`Creating file: ${dirName}.test.tsx`);
    await Deno.writeFile(
      `./${dirName}/${dirName}.test.tsx`,
      encoder.encode(testFileContent(dirName)),
    );

    console.log(`Creating file: styled.tsx`);
    await Deno.writeFile(
      `./${dirName}/styled.tsx`,
      encoder.encode(styledFileContent),
    );

    console.log(`Creating file: index.ts`);
    await Deno.writeFile(
      `./${dirName}/index.ts`,
      encoder.encode(`export { default } from "./${dirName}";\n`),
    );

    console.log(`File created successfully`);
  } catch (e) {
    console.error(`Error while creating file`);
    throw e;
  }
}

async function createDirectory(name: string) {
  try {
    if (!name) {
      throw new Error("No name was provided");
    }
    console.log(`Creating directory ${name}`);
    const result = await Deno.mkdir(name);
    console.log("Directory created successfully");
    return result;
  } catch (e) {
    console.error(`Error while creating directory`);
    throw e;
  }
}

async function main() {
  try {
    const dirs = Deno.args;

    if (dirs.length === 0) {
      console.error("Error: No arguments were provided");
      console.log("Example usage:");
      console.log("./create_containers MyContainer");
      Deno.exit(1);
    }

    dirs.forEach((dir) => checkSyntax(dir));

    const createDirectoriesPromise = dirs.map((dir) => createDirectory(dir));
    await Promise.allSettled(createDirectoriesPromise);

    const createFilesPromise = dirs.map((dir) => createFiles(dir));
    await Promise.all(createFilesPromise);

    console.log("All files and directories created successfully");
    Deno.exit(0);
  } catch (e) {
    console.error("Error while executing script");
    console.error(e);
    Deno.exit(1);
  }
}

main();
