import Code from '../Code';
import TabItem from '../TabItem';
import Tabs from '../Tabs';

type Props = {
  readonly packageName: string;
};

function NpmLikeInstallation({ packageName }: Props) {
  return (
    <Tabs>
      <TabItem value="npm" label="npm">
        <pre>
          <Code className="language-bash" showLineNumbers={false}>{`npm i ${packageName}`}</Code>
        </pre>
      </TabItem>
      <TabItem value="pnpm" label="pnpm">
        <pre>
          <Code className="language-bash" showLineNumbers={false}>{`pnpm add ${packageName}`}</Code>
        </pre>
      </TabItem>
      <TabItem value="yarn" label="yarn">
        <pre>
          <Code className="language-bash" showLineNumbers={false}>{`yarn add ${packageName}`}</Code>
        </pre>
      </TabItem>
    </Tabs>
  );
}
export default NpmLikeInstallation;
